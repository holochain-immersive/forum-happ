import { LitElement, html } from "lit";
import { state, customElement, property } from "lit/decorators.js";
import { AgentPubKey, AppAgentClient } from "@holochain/client";
import { contextProvided } from "@lit-labs/context";
import { appAgentClientContext } from "../../../contexts";
import { Profile } from "../../../types/forum/profiles";
import "@material/mwc-circular-progress";
import "@type-craft/title/title-detail";

@customElement("agent-nickname")
export class AgentNickname extends LitElement {
  @property({ type: Object })
  agentPubKey!: AgentPubKey;

  @state()
  _profile: Profile | undefined;

  @contextProvided({ context: appAgentClientContext })
  client!: AppAgentClient;

  async firstUpdated() {
    this._profile = await this.client.callZome({
      role_name: "forum",
      zome_name: "profiles",
      fn_name: "get_agent_profile",
      payload: this.agentPubKey,
    });
  }

  render() {
    if (!this._profile) {
      return html`<sl-skeleton></sl-skeleton>`;
    }

    return html` <span>${this._profile.nickname}</span> `;
  }
}
