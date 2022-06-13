use hdk::prelude::*;

mod comment;

use comment::Comment;

entry_defs![
  Comment::entry_def()
];

#[hdk_extern]
pub fn validate(_op: Op) -> ExternResult<ValidateCallbackResult> {
  Ok(ValidateCallbackResult::Valid)
}
