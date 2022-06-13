import '@webcomponents/scoped-custom-element-registry';

import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { AppWebsocket, InstalledAppInfo } from '@holochain/client';
import { contextProvider } from '@lit-labs/context';
import '@material/mwc-circular-progress';
import '@material/mwc-button';

import './components/forum/profiles/create-profile';
import './components/forum/profiles/agent-nickname';
import './components/forum/posts/all-posts';
import './components/forum/posts/create-post';
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
  creatingPost = false;

  async firstUpdated() {
    this.appWebsocket = await AppWebsocket.connect(
      `ws://localhost:${process.env.HC_PORT}`
    );

    this.appInfo = await this.appWebsocket.appInfo({
      installed_app_id: 'forum',
    });

    const cell = this.appInfo.cell_data[0];

    const myProfile = await this.appWebsocket.callZome({
      cap_secret: null,
      cell_id: cell.cell_id,
      zome_name: 'profiles',
      fn_name: 'get_my_profile',
      payload: null,
      provenance: cell.cell_id[1],
    });

    this.profileCreated = !!myProfile;

    this.loading = false;
  }

  renderContent() {
    if (this.creatingPost)
      return html`<create-post
        @post-created=${() => {
          this.creatingPost = false;
        }}
      ></create-post>`;

    return html`
      <div style="display: flex; flex-direction: column">
        <mwc-button
          label="Create post"
          @click=${() => {
            this.creatingPost = true;
          }}
        ></mwc-button>
        <all-posts></all-posts>
      </div>
    `;
  }

  render() {
    if (this.loading)
      return html`
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      `;

    return html`
      <main>
        <h1>forum</h1>

        ${this.profileCreated
          ? this.renderContent()
          : html`
              <create-profile
                @profile-created=${() => {
                  this.profileCreated = true;
                }}
              ></create-profile>
            `}
      </main>
    `;
  }

  static styles = css`
    :host {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      font-size: calc(10px + 2vmin);
      color: #1a2b42;
      max-width: 960px;
      margin: 0 auto;
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
