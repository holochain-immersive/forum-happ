use hdk::{hash_path::path::TypedPath, prelude::*};

#[hdk_entry_helper]
pub struct Post {
    pub title: String,
    pub content: String,
}

#[hdk_link_types]
pub enum LinkTypes {
    PathToChannel,
    ChannelToPost,
}

#[hdk_entry_defs]
#[unit_enum(UnitEntryTypes)]
#[cfg(not(feature = "exercise3step1"))]
pub enum EntryTypes {
    #[entry_def(name = "post")]
    Post(Post),
}

fn all_channels_path() -> ExternResult<TypedPath> {
    Path::from("all_posts").typed(LinkTypes::PathToChannel)
}

fn channel_path(channel: String) -> ExternResult<TypedPath> {
    let mut path = all_channels_path()?;
    path.path.append_component(channel.into());

    Ok(path)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreatePostInput {
    post: Post,
    #[cfg(not(feature = "exercise3step1"))]
    channel: String,
}

// Create the given post
#[hdk_extern]
#[cfg(not(feature = "exercise3step2"))]
pub fn create_post(input: CreatePostInput) -> ExternResult<ActionHash> {
    let action_hash = create_entry(EntryTypes::Post(input.post))?;

    #[cfg(not(feature = "exercise3step1"))]
    let path = channel_path(input.channel)?;

    #[cfg(not(feature = "exercise3step1"))]
    create_link(
        path.path_entry_hash()?,
        action_hash.clone(),
        LinkTypes::ChannelToPost,
        (),
    )?;

    Ok(action_hash)
}

// Get the header hashes for all the posts that have been created
#[hdk_extern]
#[cfg(not(feature = "exercise3step6"))]
pub fn get_channel_posts(channel: String) -> ExternResult<Vec<ActionHash>> {
    let path = channel_path(channel)?;

    let mut links = get_links(path.path_entry_hash()?, LinkTypes::ChannelToPost, None)?;

    links.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

    let action_hashes: Vec<ActionHash> = links
        .into_iter()
        .map(|link| ActionHash::from(link.target))
        .collect();

    Ok(action_hashes)
}

#[hdk_extern]
#[cfg(not(feature = "exercise3step7"))]
pub fn get_all_channels(_: ()) -> ExternResult<Vec<String>> {
    let path = all_channels_path()?;

    let children_paths = path.children_paths()?;

    let channels = children_paths
        .into_iter()
        .filter_map(|p| p.leaf().cloned())
        .map(|c| String::try_from(&c))
        .collect::<Result<Vec<String>, SerializedBytesError>>();

    channels.map_err(|err| wasm_error!(err.into()))
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdatePostInput {
    post_to_update: ActionHash,
    updated_post: Post,
}

// Updates the original_action_hash post with the given contents
#[hdk_extern]
#[cfg(not(feature = "exercise3step8"))]
pub fn update_post(input: UpdatePostInput) -> ExternResult<ActionHash> {
    update_entry(input.post_to_update, &input.updated_post)
}

// Get the latest post content from its original header hash
#[hdk_extern]
#[cfg(not(feature = "exercise3step9"))]
pub fn get_post(action_hash: ActionHash) -> ExternResult<Record> {
    let element = get_latest_post(action_hash)?;

    Ok(element)
}

fn get_latest_post(action_hash: ActionHash) -> ExternResult<Record> {
    let details = get_details(action_hash, GetOptions::default())?
        .ok_or(wasm_error!(WasmErrorInner::Guest("Post not found".into())))?;

    match details {
        Details::Entry(_) => Err(wasm_error!(WasmErrorInner::Guest(
            "Malformed details".into()
        ))),
        Details::Record(element_details) => match element_details.updates.last() {
            Some(update) => get_latest_post(update.action_address().clone()),
            None => Ok(element_details.record),
        },
    }
}

#[hdk_extern]
#[cfg(not(feature = "exercise3step1"))]
pub fn init(_: ()) -> ExternResult<InitCallbackResult> {
    channel_path(String::from("general"))?.ensure()?;

    Ok(InitCallbackResult::Pass)
}
