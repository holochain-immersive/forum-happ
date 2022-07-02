use hdk::prelude::*;

#[hdk_entry_helper]
pub struct Comment {
    pub comment: String,
}

#[hdk_link_types]
pub enum LinkTypes {
    CommentedOnToComment,
}

#[hdk_entry_defs]
#[unit_enum(UnitEntryTypes)]
#[cfg(not(feature = "exercise2step1"))]
pub enum EntryTypes {
    #[entry_def(name = "comment")]
    Comment(Comment),
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateCommentInput {
    comment_on: ActionHash,
    comment: String,
}

// Creates a new Comment entry, associating it with the "comment_on" header
#[hdk_extern]
#[cfg(not(feature = "exercise2step2"))]
pub fn create_comment(input: CreateCommentInput) -> ExternResult<ActionHash> {
    let action_hash = create_entry(EntryTypes::Comment(Comment {
        comment: input.comment,
    }))?;

    create_link(
        input.comment_on,
        action_hash.clone(),
        LinkTypes::CommentedOnToComment,
        (),
    )?;

    Ok(action_hash)
}

// Gets all the "Comment" entries that have been associated with the given header
#[hdk_extern]
#[cfg(not(feature = "exercise2step3"))]
pub fn get_comments_on(action_hash: ActionHash) -> ExternResult<Vec<Record>> {
    let links = get_links(action_hash, LinkTypes::CommentedOnToComment, None)?;

    let action_hashes: Vec<ActionHash> = links
        .into_iter()
        .map(|link| ActionHash::from(link.target))
        .collect();

    let mut comments: Vec<Record> = vec![];

    for action_hash in action_hashes {
        let maybe_element = get(action_hash, GetOptions::default())?;

        if let Some(element) = maybe_element {
            comments.push(element);
        }
    }

    Ok(comments)
}

// Deletes the given comment
#[hdk_extern]
#[cfg(not(feature = "exercise2step4"))]
pub fn delete_comment(action_hash: ActionHash) -> ExternResult<()> {
    delete_entry(action_hash)?;

    Ok(())
}
