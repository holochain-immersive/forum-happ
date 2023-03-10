use hdk::prelude::*;

#[hdk_entry_helper]
struct Profile {
    nickname: String,
}

#[hdk_entry_defs]
#[unit_enum(UnitEntryTypes)]
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
    let pub_key: AgentPubKey = agent_info()?.agent_initial_pubkey;
    let create_link_action_hash: ActionHash =
        create_link(pub_key, action_hash, LinkTypes::AgentToProfile, ())?;
    Ok(create_link_action_hash)
}

#[hdk_extern]
fn get_agent_profile(agent: AgentPubKey) -> ExternResult<Option<Profile>> {
    let mut links = get_links(agent, LinkTypes::AgentToProfile, None)?;
    if links.len() == 0 {
        return Ok(None)
    }

    let link = links.remove(0);
    let maybe_record = get(ActionHash::from(link.target), GetOptions::default())?;

    if let Some(record) = maybe_record {
        let profile: Profile = record
            .entry()
            .to_app_option()
            .map_err(|err| wasm_error!(err))?
            .ok_or(wasm_error!(WasmErrorInner::Guest(
                "Could not deserialize element to Profile.".into(),
            )))?;
        Ok(Some(profile))
    } else {
        Ok(None)
    }
}

#[hdk_extern]
fn get_my_profile(_: ()) -> ExternResult<Option<Profile>> {
    let pub_key: AgentPubKey = agent_info()?.agent_initial_pubkey;
    get_agent_profile(pub_key)
}


/**
 * Add your edits to the bottom of this file
 */
pub use profiles_zome;
