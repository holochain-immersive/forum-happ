use hdk::prelude::*;

#[hdk_entry_helper]
struct Profile {
    nickname: String,
}

#[hdk_entry_defs]
#[unit_enum(UnitTypes)]
enum EntryTypes {
    Profile(Profile),
}

#[hdk_link_types]
enum LinkTypes {
    AgentToProfile,
}

#[hdk_extern]
fn create_profile(profile: Profile) -> ExternResult<ActionHash> {
    let action_hash = create_entry(EntryTypes::Profile(profile))?;

    // get public key from agent
    let my_pub_key: AgentPubKey = agent_info()?.agent_initial_pubkey;

    create_link(
        my_pub_key, 
        action_hash.clone(),
        LinkTypes::AgentToProfile,
        ()
    )?;

    Ok(action_hash)
}

#[hdk_extern]
fn get_agent_profile(agent_pub_key: AgentPubKey) -> ExternResult<Option<Profile>> {
    let agent_to_profile_links: Vec<Link> =
        get_links(agent_pub_key, LinkTypes::AgentToProfile, None)?;

    if agent_to_profile_links.len() <= 0 {
        return Ok(None);
    }

    match agent_to_profile_links.get(0) {
        Some(link) => {
            let record = get(ActionHash::from(link.clone().target), GetOptions::default())?.unwrap();
            let record_entry = record.entry().clone();
            let profile = match record_entry {
                RecordEntry::Present(Entry::App(bytes)) => Profile::try_from(bytes.0).map_err(|err| wasm_error!(err.into())),
                _ => Err(wasm_error!(WasmErrorInner::Guest(format!("error"))))
            }?;
            Ok(Some(profile))
        },
        _ => Ok(None)
    }

    // let link = &agent_to_profile_links[0];
    // let holo_hash = link.clone().target;
    // let action_hash = ActionHash::from(holo_hash);
    // let record = get(action_hash, GetOptions::default())?;
    // let record_entry = record.entry().clone();
    
    // let profile = match record_entry {

    // }
    // Ok(None)

}
// fn get_record_from_link(link: Link) -> Option<RecordEntry> {
//     let holo_hash = link.clone().target;
//     let action_hash = ActionHash::from(holo_hash);
//     let result = get(action_hash, GetOptions::default())?;
//     // let record_entry = record.entry().clone();
// }

// #[hdk_extern]
// fn get_my_profile(public_key: AgentPubKey) -> ExternResult<Option<Profile>> {
//   get_agent_profile(agent_info()?.agent_latest_pubkey)
// }

/**
 * DON'T TOUCH
 */
pub use profiles_zome;
