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

/**
 * Add your edits to the bottom of this file
 */
pub use comments_zome;
