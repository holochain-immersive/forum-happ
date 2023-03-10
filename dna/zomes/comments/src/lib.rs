use hdk::prelude::*;

#[hdk_entry_helper]
struct Comment {
    comment: String
}

#[hdk_entry_defs]
#[unit_enum(UnitEntryTypes)]
enum EntryTypes {
    Comment(Comment)
}

#[derive(Debug, Serialize, Deserialize)]
struct Input {
    comment_on: ActionHash,
    comment: String,
}

#[hdk_extern]
fn create_comment(inp: Input) -> ExternResult<ActionHash> {
    let comment = Comment {comment: inp.comment};
    let action_hash = create_entry(EntryTypes::Comment(comment))?;

    Ok(action_hash)
}


/**
 * Add your edits to the bottom of this file
 */
pub use comments_zome;
