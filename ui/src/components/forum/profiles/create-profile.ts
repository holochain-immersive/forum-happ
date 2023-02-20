import { LitElement, html } from "lit";
import { state, customElement } from "lit/decorators.js";
import { AppAgentClient } from "@holochain/client";
import { contextProvided } from "@lit-labs/context";
import { appAgentClientContext } from "../../../contexts";
import { Profile } from "../../../types/forum/profiles";
import "@material/mwc-button";
import "@type-craft/title/create-title";

@customElement("create-profile")
export class CreateProfile extends LitElement {
  @state()
  _nickname: string | undefined;

  isProfileValid() {
    return this._nickname;
  }

  @contextProvided({ context: appAgentClientContext })
  client!: AppAgentClient;

  async createProfile() {
    const profile: Profile = {
      nickname: this._nickname!,
    };

    await this.client.callZome({
      role_name: "forum",
      zome_name: "profiles",
      fn_name: "create_profile",
      payload: profile,
    });

    this.dispatchEvent(
      new CustomEvent("profile-created", {
        composed: true,
        bubbles: true,
      })
    );
  }

  render() {
    return html` <sl-card
      ><div style="display: flex; flex-direction: column">
        <span style="font-size: 18px">Create Profile</span>

        <create-title
          label="Nickname"
          @change=${(e: Event) => {
            this._nickname = (e.target as any).value;
          }}
          style="margin-top: 16px"
        ></create-title>

        <mwc-button
          label="Create Profile"
          .disabled=${!this.isProfileValid()}
          @click=${() => this.createProfile()}
        ></mwc-button>
      </div>
    </sl-card>`;
  }
}
