use hdk::prelude::*;

#[hdk_entry(id = "profile")]
#[serde(rename_all = "camelCase")]
#[derive(Clone)]
pub struct Profile {
    pub nickname: String,
}

entry_defs![Profile::entry_def()];

#[hdk_extern]
pub fn create_profile(profile: Profile) -> ExternResult<()> {
    let header_hash = create_entry(&profile)?;

    let my_pub_key = agent_info()?.agent_initial_pubkey;

    create_link(my_pub_key.into(), header_hash.into(), HdkLinkType::Any, ())?;

    Ok(())
}

#[hdk_extern]
pub fn get_agent_profile(agent_pub_key: AgentPubKey) -> ExternResult<Option<Profile>> {
    let links = get_links(agent_pub_key.into(), None)?;

    match links.first() {
        Some(link) => get_profile(link.target.clone().into()),
        None => Ok(None),
    }
}

fn get_profile(header_hash: HeaderHash) -> ExternResult<Option<Profile>> {
    let maybe_element = get(header_hash, GetOptions::default())?;

    match maybe_element {
        None => Ok(None),
        Some(element) => {
            let profile: Profile = element.entry().to_app_option()?.ok_or(WasmError::Guest(
                "Could not deserialize element to Profile.".into(),
            ))?;

            Ok(Some(profile))
        }
    }
}

#[hdk_extern]
pub fn get_my_profile(_: ()) -> ExternResult<Option<Profile>> {
    let my_pub_key = agent_info()?.agent_initial_pubkey;

    get_agent_profile(my_pub_key)
}

#[hdk_extern]
pub fn validate(_op: Op) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
