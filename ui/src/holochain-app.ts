import '@webcomponents/scoped-custom-element-registry';

import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  AgentPubKey,
  AppWebsocket,
  HeaderHash,
  InstalledAppInfo,
} from '@holochain/client';
import { contextProvider } from '@lit-labs/context';
import '@material/mwc-circular-progress';
import '@material/mwc-button';
import '@material/mwc-top-app-bar';
import '@material/mwc-fab';

import './components/forum/profiles/create-profile';
import './components/forum/profiles/agent-nickname';
import './components/forum/posts/all-posts';
import './components/forum/posts/create-post';
import './components/forum/posts/edit-post';
import { appWebsocketContext, appInfoContext } from './contexts';

@customElement('holochain-app')
export class HolochainApp extends LitElement {
  @state() loading = true;

  @state() profileCreated = false;

  @contextProvider({ context: appWebsocketContext })
  @property({ type: Object })
  appWebsocket!: AppWebsocket;

  @contextProvider({ context: appInfoContext })
  @property({ type: Object })
  appInfo!: InstalledAppInfo;

  @state()
  currentView:
    | { view: 'main' }
    | { view: 'creatingPost' }
    | { view: 'updatingPost'; headerHash: HeaderHash } = { view: 'main' };

  myPubKey!: AgentPubKey;

  async firstUpdated() {
    this.appWebsocket = await AppWebsocket.connect(
      `ws://localhost:${process.env.HC_PORT}`
    );

    this.appInfo = await this.appWebsocket.appInfo({
      installed_app_id: 'forum',
    });

    const cell = this.appInfo.cell_data[0];

    this.myPubKey = cell.cell_id[1];

    const myProfile = await this.appWebsocket.callZome({
      cap_secret: null,
      cell_id: cell.cell_id,
      zome_name: 'profiles',
      fn_name: 'get_my_profile',
      payload: null,
      provenance: this.myPubKey,
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

    if (this.currentView.view === 'creatingPost')
      return html`<create-post
        @post-created=${() => {
          this.currentView = { view: 'main' };
        }}
      ></create-post>`;

    if (this.currentView.view === 'updatingPost')
      return html`<edit-post
        .postHash=${this.currentView.headerHash}
        @post-updated=${() => {
          this.currentView = { view: 'main' };
        }}
      ></edit-post>`;

    return html`
      <all-posts
        style="display: flex; flex-direction: column; width: 800px;"
        @updating-post=${(e: CustomEvent) => {
          this.currentView = {
            view: 'updatingPost',
            headerHash: e.detail.headerHash,
          };
        }}
      ></all-posts>
      <mwc-fab
        label="Create post"
        style="position: fixed; right: 16px; bottom: 16px"
        icon="add"
        extended
        @click=${() => {
          this.currentView = { view: 'creatingPost' };
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
        <holo-identicon .hash=${this.myPubKey}></holo-identicon>
        <agent-nickname
          style="margin-left: 8px;"
          .agentPubKey=${this.myPubKey}
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
          style="display: flex; flex: 1; flex-direction: column; height: 100%;"
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
