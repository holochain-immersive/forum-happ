use hdk::prelude::*;

#[hdk_entry(id = "profile")]
pub struct Profile {
    pub nickname: String,
}

#[cfg(not(feature = "exercise1step1"))]
entry_defs![Profile::entry_def()];

// Create the given profile and associates it with our public key
#[hdk_extern]
#[cfg(not(feature = "exercise1step2"))]
pub fn create_profile(profile: Profile) -> ExternResult<()> {
    let header_hash = create_entry(&profile)?;

    let my_pub_key = agent_info()?.agent_initial_pubkey;

    create_link(my_pub_key.into(), header_hash.into(), HdkLinkType::Any, ())?;

    Ok(())
}

// Gets the profile for the given agent, if they have created it
#[hdk_extern]
#[cfg(not(feature = "exercise1step3"))]
pub fn get_agent_profile(agent_pub_key: AgentPubKey) -> ExternResult<Option<Profile>> {
    inner_get_agent_profile(agent_pub_key)
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

// Gets the profile of the current agent, if we have created it
#[hdk_extern]
#[cfg(not(feature = "exercise1step4"))]
pub fn get_my_profile(_: ()) -> ExternResult<Option<Profile>> {
    let my_pub_key = agent_info()?.agent_initial_pubkey;

    inner_get_agent_profile(my_pub_key)
}

fn inner_get_agent_profile(agent_pub_key: AgentPubKey) -> ExternResult<Option<Profile>> {
    let links = get_links(agent_pub_key.into(), None)?;

    match links.first() {
        Some(link) => get_profile(link.target.clone().into()),
        None => Ok(None),
    }
}
