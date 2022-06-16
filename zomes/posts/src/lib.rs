use hdk::prelude::*;

#[hdk_entry(id = "post")]
pub struct Post {
    pub title: String,
    pub content: String,
}

#[cfg(not(feature = "exercise3step1"))]
entry_defs![Post::entry_def(), PathEntry::entry_def()];

fn channel_path(channel: String) -> Path {
    Path::from(format!("all_posts.{}", channel))
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
pub fn create_post(input: CreatePostInput) -> ExternResult<HeaderHash> {
    let header_hash = create_entry(&input.post)?;

    #[cfg(not(feature = "exercise3step1"))]
    let path = channel_path(input.channel);
    #[cfg(not(feature = "exercise3step1"))]
    path.ensure()?;

    #[cfg(not(feature = "exercise3step1"))]
    create_link(
        path.path_entry_hash()?.into(),
        header_hash.clone().into(),
        HdkLinkType::Any,
        (),
    )?;

    Ok(header_hash)
}

// Get the header hashes for all the posts that have been created
#[hdk_extern]
#[cfg(not(feature = "exercise3step6"))]
pub fn get_channel_posts(channel: String) -> ExternResult<Vec<HeaderHash>> {
    let path = channel_path(channel);

    let mut links = get_links(path.path_entry_hash()?.into(), None)?;

    links.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

    let header_hashes: Vec<HeaderHash> = links
        .into_iter()
        .map(|link| HeaderHash::from(link.target))
        .collect();

    Ok(header_hashes)
}

#[hdk_extern]
#[cfg(not(feature = "exercise3step7"))]
pub fn get_all_channels(_: ()) -> ExternResult<Vec<String>> {
    let path = Path::from("all_posts");

    let children_paths = path.children_paths()?;

    let channels: Vec<String> = children_paths
        .into_iter()
        .filter_map(|p| p.leaf().cloned())
        .map(|c| String::try_from(&c))
        .collect::<Result<Vec<String>, SerializedBytesError>>()?;

    Ok(channels)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdatePostInput {
    post_to_update: HeaderHash,
    updated_post: Post,
}

// Updates the original_header_hash post with the given contents
#[hdk_extern]
#[cfg(not(feature = "exercise3step8"))]
pub fn update_post(input: UpdatePostInput) -> ExternResult<HeaderHash> {
    update_entry(input.post_to_update, &input.updated_post)
}

// Get the latest post content from its original header hash
#[hdk_extern]
#[cfg(not(feature = "exercise3step9"))]
pub fn get_post(header_hash: HeaderHash) -> ExternResult<Element> {
    let element = get_latest_post(header_hash)?;

    Ok(element)
}

fn get_latest_post(header_hash: HeaderHash) -> ExternResult<Element> {
    let details = get_details(header_hash, GetOptions::default())?
        .ok_or(WasmError::Guest("Post not found".into()))?;

    match details {
        Details::Entry(_) => Err(WasmError::Guest("Malformed details".into())),
        Details::Element(element_details) => match element_details.updates.last() {
            Some(update) => get_latest_post(update.header_address().clone()),
            None => Ok(element_details.element),
        },
    }
}

#[hdk_extern]
#[cfg(not(feature = "exercise3step1"))]
pub fn init(_: ()) -> ExternResult<InitCallbackResult> {
    channel_path(String::from("general")).ensure()?;

    Ok(InitCallbackResult::Pass)
}
