import { LitElement, html } from "lit";
import { state, customElement, property } from "lit/decorators.js";
import { AppAgentClient } from "@holochain/client";
import { contextProvided } from "@lit-labs/context";
import { appAgentClientContext } from "../../../contexts";
import "@material/mwc-circular-progress";
import "@material/mwc-list";
import "@type-craft/title/title-detail";

@customElement("all-channels")
export class AllChannels extends LitElement {
  @state()
  _allChannels: Array<string> | undefined;

  @property()
  selectedChannel!: string;

  @contextProvided({ context: appAgentClientContext })
  client!: AppAgentClient;

  firstUpdated() {
    this.fetchChannels();
    setInterval(() => this.fetchChannels(), 3000);
  }

  async fetchChannels() {
    this._allChannels = await this.client.callZome({
      role_name: "forum",
      zome_name: "posts",
      fn_name: "get_all_channels",
      payload: null,
    });
  }

  render() {
    if (!this._allChannels) {
      return html`<div
        style="display: flex; flex: 1; align-items: center; justify-content: center"
      >
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      </div>`;
    }

    if (this._allChannels.length === 0)
      return html`<span style="opacity: 0.6; margin-top: 256px;"
        >There are no channels yet</span
      >`;

    return html`<mwc-list
      >${this._allChannels.map(
        (channel) =>
          html`<mwc-list-item
            .activated=${channel === this.selectedChannel}
            @click=${() =>
              this.dispatchEvent(
                new CustomEvent("channel-selected", {
                  bubbles: true,
                  composed: true,
                  detail: channel,
                })
              )}
            >${channel}</mwc-list-item
          >`
      )}</mwc-list
    > `;
  }
}
