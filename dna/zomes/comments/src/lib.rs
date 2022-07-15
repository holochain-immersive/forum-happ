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

/**
 * DON'T TOUCH
 */
pub use comments_zome;
