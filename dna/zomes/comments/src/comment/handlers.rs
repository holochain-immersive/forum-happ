use hdk::prelude::*;
use hdk::prelude::holo_hash::*;
use super::Comment;

#[hdk_extern]
pub fn get_comment(entry_hash: EntryHashB64) -> ExternResult<Option<Comment>> {
  let maybe_element = get(EntryHash::from(entry_hash), GetOptions::default())?;

  match maybe_element {
    None => Ok(None),
    Some(element) => {
      let comment: Comment = element.entry()
        .to_app_option()?
        .ok_or(WasmError::Guest("Could not deserialize element to Comment.".into()))?;
    
      Ok(Some(comment))
    }
  }
}


#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct NewCommentOutput {
  header_hash: HeaderHashB64,
  entry_hash: EntryHashB64,
}

#[hdk_extern]
pub fn create_comment(comment: Comment) -> ExternResult<NewCommentOutput> {
  let header_hash = create_entry(&comment)?;

  let entry_hash = hash_entry(&comment)?;

  let output = NewCommentOutput {
    header_hash: HeaderHashB64::from(header_hash),
    entry_hash: EntryHashB64::from(entry_hash)
  };

  Ok(output)
}


#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UpdateCommentInput {
  original_header_hash: HeaderHashB64,
  updated_comment: Comment
}

#[hdk_extern]
pub fn update_comment(input: UpdateCommentInput) -> ExternResult<NewCommentOutput> {
  let header_hash = update_entry(HeaderHash::from(input.original_header_hash), &input.updated_comment)?;

  let entry_hash = hash_entry(&input.updated_comment)?;

  let output = NewCommentOutput {
    header_hash: HeaderHashB64::from(header_hash),
    entry_hash: EntryHashB64::from(entry_hash)
  };

  Ok(output)
}


