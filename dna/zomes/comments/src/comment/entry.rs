use hdk::prelude::*;



#[hdk_entry(id = "comment")]
#[serde(rename_all = "camelCase")]
#[derive(Clone)]
pub struct Comment {
  pub comment: String,
}