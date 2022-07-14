use hdk::prelude::*;


#[hdk_entry_helper]
struct Profile {
  nickname: String,
}

#[hdk_entry_defs]
#[unit_enum(UnitTypes)]
enum EntryTypes {
  Profile(Profile)
}

#[hdk_link_types]
enum LinkTypes {
  AgentToProfile
}

#[hdk_extern]
fn create_profile(profile: Profile) -> ExternResult<ActionHash> {
  let action_hash = create_entry(EntryTypes::Profile(profile))?;
  
  // get public key from agent
  let my_pub_key: AgentPubKey = agent_info()?.agent_initial_pubkey;

  let create_link_action_hash = create_link(
    my_pub_key,
    action_hash,
    LinkTypes::AgentToProfile,
    ()
  )?;

  Ok(create_link_action_hash)
}

// #[hdk_extern]
fn get_agent_profile(agent_pub_key: AgentPubKey) -> ExternResult<Option<Profile>> {
  let profiles: Vec<Link> = get_links(
    agent_pub_key,
    LinkTypes::AgentToProfile,
    None,
  )?;
  // let record = get(agent_pub_key, GetOptions::default())?;
  // let record_entry: &RecordEntry = record.unwrap().entry();
  // record_entry.
  // match record_entry {
  //   RecordEntry::Present(entry) => {
  //     let app: AppEntryBytes = match entry {

  //     }
  //   }
  //   _ => Err(wasm_error!(WasmErrorInner::Guest(String::from("Error trying to get the details of this action"))))
  // }
  // Err(wasm_error!(WasmErrorInner::Guest(String::from("Error trying to get the details of this action"))))

  // println!("{:?}", record_entry);

  // match record {
  //   Some => Ok(record),
  //   _ => Err(wasm_error!(WasmErrorInner::Guest(String::from("Error trying to get the details of this action"))))
  // }
}

// #[hdk_extern]
// fn get_my_profile(public_key: AgentPubKey) -> ExternResult<Option<Profile>> {
//   get_agent_profile(agent_info()?.agent_latest_pubkey)
// }

/**
 * DON'T TOUCH
 */
pub use profiles_zome;
