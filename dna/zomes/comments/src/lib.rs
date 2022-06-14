use hdk::prelude::*;

#[hdk_entry(id = "comment")]
#[derive(Clone)]
pub struct Comment {
    pub comment: String,
}

entry_defs![Comment::entry_def()];

#[derive(Debug, Serialize, Deserialize)]
pub struct EntryWithHeader<E> {
    header_hash: HeaderHash,
    header: Header,
    entry: E,
}

#[hdk_extern]
pub fn get_comments_on(header_hash: HeaderHash) -> ExternResult<Vec<EntryWithHeader<Comment>>> {
    let links = get_links(header_hash.into(), None)?;

    let header_hashes: Vec<HeaderHash> = links
        .into_iter()
        .map(|link| HeaderHash::from(link.target))
        .collect();

    let mut comments: Vec<EntryWithHeader<Comment>> = vec![];

    for header_hash in header_hashes {
        let maybe_element = get(header_hash, GetOptions::default())?;

        if let Some(element) = maybe_element {
            let comment: Comment = element.entry().to_app_option()?.ok_or(WasmError::Guest(
                "Could not deserialize element to Comment.".into(),
            ))?;

            comments.push(EntryWithHeader {
                header: element.header().clone(),
                header_hash: element.header_address().clone(),
                entry: comment,
            });
        }
    }

    Ok(comments)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateCommentInput {
    comment_on: HeaderHash,
    comment: Comment,
}

#[hdk_extern]
pub fn create_comment(input: CreateCommentInput) -> ExternResult<HeaderHash> {
    let header_hash = create_entry(&input.comment)?;

    create_link(
        input.comment_on.into(),
        header_hash.clone().into(),
        HdkLinkType::Any,
        (),
    )?;

    Ok(header_hash)
}

#[hdk_extern]
pub fn delete_comment(header_hash: HeaderHash) -> ExternResult<()> {
    delete_entry(header_hash)?;

    Ok(())
}
