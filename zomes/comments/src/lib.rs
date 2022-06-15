use hdk::prelude::*;

#[hdk_entry(id = "comment")]
pub struct Comment {
    pub comment: String,
}

#[cfg(not(feature = "exercise2step1"))]
entry_defs![Comment::entry_def()];

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateCommentInput {
    comment_on: HeaderHash,
    comment: String,
}

// Creates a new Comment entry, associating it with the "comment_on" header
#[hdk_extern]
#[cfg(not(feature = "exercise2step2"))]
pub fn create_comment(input: CreateCommentInput) -> ExternResult<HeaderHash> {
    let header_hash = create_entry(Comment {
        comment: input.comment,
    })?;

    create_link(
        input.comment_on.into(),
        header_hash.clone().into(),
        HdkLinkType::Any,
        (),
    )?;

    Ok(header_hash)
}

// Gets all the "Comment" entries that have been associated with the given header
#[hdk_extern]
#[cfg(not(feature = "exercise2step3"))]
pub fn get_comments_on(header_hash: HeaderHash) -> ExternResult<Vec<Element>> {
    let links = get_links(header_hash.into(), None)?;

    let header_hashes: Vec<HeaderHash> = links
        .into_iter()
        .map(|link| HeaderHash::from(link.target))
        .collect();

    let mut comments: Vec<Element> = vec![];

    for header_hash in header_hashes {
        let maybe_element = get(header_hash, GetOptions::default())?;

        if let Some(element) = maybe_element {
            comments.push(element);
        }
    }

    Ok(comments)
}

// Deletes the given comment
#[hdk_extern]
#[cfg(not(feature = "exercise2step4"))]
pub fn delete_comment(header_hash: HeaderHash) -> ExternResult<()> {
    delete_entry(header_hash)?;

    Ok(())
}
