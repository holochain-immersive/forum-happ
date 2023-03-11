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

#[hdk_link_types]
enum LinkTypes {
    CommentedOnToComment
}

#[hdk_extern]
fn create_comment(inp: Input) -> ExternResult<ActionHash> {
    let comment = Comment {comment: inp.comment};
    let action_hash = create_entry(EntryTypes::Comment(comment))?;
    let hash_copy = action_hash.clone();
    create_link(inp.comment_on, action_hash, LinkTypes::CommentedOnToComment, ())?;

    Ok(hash_copy)
}

#[hdk_extern]
fn get_comments_on(hash: ActionHash) -> ExternResult<Vec<Record>> {
    let links = get_links(hash, LinkTypes::CommentedOnToComment, None)?;
    let mut results = vec!();
    if links.len() == 0 {
        return Ok(results);
    }
    for link in links {
        let maybe_record = get(ActionHash::from(link.target), GetOptions::default())?;
        if let Some(record) = maybe_record {
            results.push(record);
        }
    }
    return Ok(results);
}

#[hdk_extern]
fn delete_comment(hash: ActionHash) -> ExternResult<()> {
    delete_entry(hash)?;
    Ok(())
}


/**
 * Add your edits to the bottom of this file
 */
pub use comments_zome;
