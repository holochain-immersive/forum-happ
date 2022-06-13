use hdk::prelude::*;

#[hdk_entry(id = "post")]
#[serde(rename_all = "camelCase")]
#[derive(Clone)]
pub struct Post {
    pub title: String,
    pub content: String,
}

entry_defs![Post::entry_def()];

fn all_posts_path() -> Path {
    Path::from("all_posts")
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EntryWithHeader<E> {
    header_hash: HeaderHash,
    header: Header,
    entry: E,
}

#[hdk_extern]
pub fn get_all_posts(_: ()) -> ExternResult<Vec<HeaderHash>> {
    let path = all_posts_path();

    let links = get_links(path.path_entry_hash()?.into(), None)?;

    let header_hashes: Vec<HeaderHash> = links
        .into_iter()
        .map(|link| HeaderHash::from(link.target))
        .collect();

    Ok(header_hashes)
}

#[hdk_extern]
pub fn get_post(header_hash: HeaderHash) -> ExternResult<Option<EntryWithHeader<Post>>> {
    let maybe_element = get(header_hash, GetOptions::default())?;

    match maybe_element {
        None => Ok(None),
        Some(element) => {
            let post: Post = element.entry().to_app_option()?.ok_or(WasmError::Guest(
                "Could not deserialize element to Post.".into(),
            ))?;

            Ok(Some(EntryWithHeader {
                header: element.header().clone(),
                header_hash: element.header_address().clone(),
                entry: post,
            }))
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct NewPostOutput {
    header_hash: HeaderHash,
    entry_hash: EntryHash,
}

#[hdk_extern]
pub fn create_post(post: Post) -> ExternResult<NewPostOutput> {
    let header_hash = create_entry(&post)?;

    let entry_hash = hash_entry(&post)?;

    let output = NewPostOutput {
        header_hash: HeaderHash::from(header_hash.clone()),
        entry_hash: EntryHash::from(entry_hash),
    };

    let path = all_posts_path();

    create_link(
        path.path_entry_hash()?.into(),
        header_hash.into(),
        HdkLinkType::Any,
        (),
    )?;

    Ok(output)
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UpdatePostInput {
    original_header_hash: HeaderHash,
    updated_post: Post,
}

#[hdk_extern]
pub fn update_post(input: UpdatePostInput) -> ExternResult<NewPostOutput> {
    let header_hash = update_entry(
        HeaderHash::from(input.original_header_hash),
        &input.updated_post,
    )?;

    let entry_hash = hash_entry(&input.updated_post)?;

    let output = NewPostOutput {
        header_hash: HeaderHash::from(header_hash),
        entry_hash: EntryHash::from(entry_hash),
    };

    Ok(output)
}

#[hdk_extern]
pub fn delete_post(header_hash: HeaderHash) -> ExternResult<HeaderHash> {
    delete_entry(HeaderHash::from(header_hash))
}
