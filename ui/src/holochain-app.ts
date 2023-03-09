import "@webcomponents/scoped-custom-element-registry";

import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  AppAgentWebsocket,
  AppAgentClient,
  ActionHash,
} from "@holochain/client";
import { contextProvider } from "@lit-labs/context";
import "@material/mwc-circular-progress";
import "@material/mwc-button";
import "@material/mwc-top-app-bar";
import "@material/mwc-drawer";
import "@material/mwc-fab";

import "./components/forum/profiles/create-profile";
import "./components/forum/profiles/agent-nickname";
import "./components/forum/posts/channel-posts";
import "./components/forum/posts/create-post";
import "./components/forum/posts/edit-post";
import "./components/forum/posts/all-channels";
import { appAgentClientContext } from "./contexts";

@customElement("holochain-app")
export class HolochainApp extends LitElement {
  @state() loading = true;

  @state() profileCreated = false;

  @contextProvider({ context: appAgentClientContext })
  @property({ type: Object })
  client!: AppAgentClient;

  @state()
  currentView:
    | { view: "main"; selectedChannel: string }
    | { view: "creatingPost" }
    | { view: "updatingPost"; actionHash: ActionHash } = {
    view: "main",
    selectedChannel: "general",
  };

  async firstUpdated() {
    this.client = await AppAgentWebsocket.connect("", "");

    const myProfile = await this.client.callZome({
      role_name: "forum",
      zome_name: "profiles",
      fn_name: "get_my_profile",
      payload: null,
    });

    this.profileCreated = !!myProfile;

    this.loading = false;
  }

  renderContent() {
    if (!this.profileCreated)
      return html`<create-profile
        style="margin-top: 264px;"
        @profile-created=${() => {
          this.profileCreated = true;
        }}
      ></create-profile>`;

    if (this.currentView.view === "creatingPost")
      return html`<create-post
        @post-created=${(e: any) => {
          this.currentView = {
            view: "main",
            selectedChannel: e.detail.channel,
          };
        }}
      ></create-post>`;

    if (this.currentView.view === "updatingPost")
      return html`<edit-post
        .postHash=${this.currentView.actionHash}
        @post-updated=${() => {
          this.currentView = { view: "main", selectedChannel: "general" };
        }}
      ></edit-post>`;

    return html`
      <mwc-drawer hasHeader>
        <span slot="title">Channels</span>
        <all-channels
          .selectedChannel=${this.currentView.selectedChannel}
          @channel-selected=${(e: CustomEvent) => {
            (this.currentView as any).selectedChannel = e.detail;
            this.requestUpdate();
          }}
        ></all-channels>

        <div slot="appContent" class="flex-scrollable-parent">
          <div class="flex-scrollable-container">
            <div class="flex-scrollable-y">
              <channel-posts
                .channel=${this.currentView.selectedChannel}
                style="display: flex; flex-direction: column; width: 600px;"
                @updating-post=${(e: CustomEvent) => {
                  this.currentView = {
                    view: "updatingPost",
                    actionHash: e.detail.actionHash,
                  };
                }}
              ></channel-posts>
            </div>
          </div>
        </div>
      </mwc-drawer>
      <mwc-fab
        label="Create post"
        style="position: fixed; right: 16px; bottom: 16px"
        icon="add"
        extended
        @click=${() => {
          this.currentView = { view: "creatingPost" };
        }}
      ></mwc-fab>
    `;
  }

  renderActionItems() {
    if (!this.profileCreated) return html``;

    return html`
      <div
        slot="actionItems"
        style="margin-left: 16px; display: flex; flex-direction: row; align-items: center;"
      >
        <holo-identicon .hash=${this.client.myPubKey}></holo-identicon>
        <agent-nickname
          style="margin-left: 8px;"
          .agentPubKey=${this.client.myPubKey}
        ></agent-nickname>
      </div>
    `;
  }

  render() {
    if (this.loading)
      return html`
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      `;

    return html`
      <mwc-top-app-bar style="flex: 1; display: flex; justify-content: center"
        ><span slot="title">Forum</span>

        ${this.renderActionItems()}
        <div
          style="display: flex; flex: 1; flex-direction: column; height: 100%; width: 100vw"
        >
          ${this.renderContent()}
        </div>
      </mwc-top-app-bar>
    `;
  }

  static styles = css`
    :host {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      color: #1a2b42;
      text-align: center;
      background-color: var(--lit-element-background-color);
    }

    .flex-scrollable-container {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
    .flex-scrollable-x {
      max-width: 100%;
      overflow-x: auto;
    }
    .flex-scrollable-y {
      max-height: 100%;
      overflow-y: auto;
    }
    main {
      flex-grow: 1;
    }

    .app-footer {
      font-size: calc(12px + 0.5vmin);
      align-items: center;
    }

    .app-footer a {
      margin-left: 5px;
    }
  `;
}
