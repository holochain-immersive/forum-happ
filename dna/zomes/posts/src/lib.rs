use hdk::prelude::*;

#[hdk_entry_helper]
struct Post {
    title: String,
    content: String,
}

#[hdk_entry_defs]
#[unit_enum(UnitEntryTypes)]
enum EntryTypes {
    Post(Post),
}

#[derive(Debug, Serialize, Deserialize)]
struct CreatePostInput {
    post: Post,
    channel: String,
}

#[hdk_link_types]
enum LinkTypes {
    PathToChannel,
    ChannelToPost,
}

#[hdk_extern]
fn create_post(input: CreatePostInput) -> ExternResult<ActionHash> {
    let action_hash = create_entry(EntryTypes::Post(input.post))?;
    let path = Path::from(format!("all_posts.{}", input.channel));
    let typed_path = path.typed(LinkTypes::PathToChannel)?;
    typed_path.ensure()?;
    create_link(
        typed_path.path_entry_hash()?,
        action_hash.clone(),
        LinkTypes::ChannelToPost,
        (),
    )?;
    Ok(action_hash)
}

#[hdk_extern]
fn get_channel_posts(channel: String) -> ExternResult<Vec<ActionHash>> {
    let channel_path =
        Path::from(format!("all_posts.{}", channel)).typed(LinkTypes::PathToChannel)?;
    let links = get_links(
        channel_path.path_entry_hash()?,
        LinkTypes::ChannelToPost,
        None,
    )?;
    let hashes = links
        .into_iter()
        .map(|link| ActionHash::from(link.target))
        .collect();
    Ok(hashes)
}

#[hdk_extern]
fn get_all_channels(_: ()) -> ExternResult<Vec<String>> {
    let root_path = Path::from("all_posts").typed(LinkTypes::PathToChannel)?;
    let paths = root_path.children_paths()?;
    let mut results: Vec<String> = vec![];
    for linked_path in paths {
        if let Some(found) = linked_path.path.leaf() {
            let str = String::try_from(found);
            match str {
                Ok(s) => results.push(s),
                _ => (),
            }
        }
    }
    Ok(results)
}

#[derive(Debug, Serialize, Deserialize)]
struct UpdatePostInput {
    updated_post: Post,
    post_to_update: ActionHash,
}

#[hdk_extern]
fn update_post(input: UpdatePostInput) -> ExternResult<ActionHash> {
    let action_hash = update_entry(input.post_to_update, input.updated_post)?;
    Ok(action_hash)
}

#[hdk_extern]
fn get_post(action_hash: ActionHash) -> ExternResult<Record> {
    if let Some(record) = last_update_for(action_hash) {
        Ok(record)
    } else {
        Err(wasm_error!(WasmErrorInner::Guest("no post at address".into())))
    }
}

fn last_update_for(action_hash: ActionHash) -> Option<Record> {
    let action_details: Option<Details> = get_details(action_hash, GetOptions::default()).unwrap_or(None);
    match action_details {
        Some(Details::Record(RecordDetails { record, updates, .. })) => {
                if let Some(last_update) = updates.last() {
                    if let Some(next) = last_update_for(last_update.hashed.hash.clone()) {
                        return Some(next)
                    }
                } 
                return Some(record)
        },
        _ => None
    }
}

//- Then add a new function to search_posts_by_tags(tags:Vec<String>) that returns posts with any of those tags
//
//- Modify the create_post function to receive a list of tags, and add a function to search posts by tag
//another option is to create a function `get_all_comments_for_agent(_: ())` that returns all comments, without modifying any other function 
/**
 * Add your edits to the bottom of this file
 */
pub use posts_zome;
