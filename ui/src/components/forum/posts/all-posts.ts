import { LitElement, html } from 'lit';
import { state, customElement } from 'lit/decorators.js';
import {
  InstalledCell,
  AppWebsocket,
  InstalledAppInfo,
  HeaderHash,
} from '@holochain/client';
import { contextProvided } from '@lit-labs/context';
import { appInfoContext, appWebsocketContext } from '../../../contexts';
import '@material/mwc-circular-progress';
import '@type-craft/title/title-detail';

import './post-detail';

@customElement('all-posts')
export class AgentNickname extends LitElement {
  @state()
  _allPosts: Array<HeaderHash> | undefined;

  @contextProvided({ context: appWebsocketContext })
  appWebsocket!: AppWebsocket;

  @contextProvided({ context: appInfoContext })
  appInfo!: InstalledAppInfo;

  async firstUpdated() {
    const cellData = this.appInfo.cell_data.find(
      (c: InstalledCell) => c.role_id === 'forum'
    )!;

    this._allPosts = await this.appWebsocket.callZome({
      cap_secret: null,
      cell_id: cellData.cell_id,
      zome_name: 'posts',
      fn_name: 'get_all_posts',
      payload: null,
      provenance: cellData.cell_id[1],
    });
  }

  render() {
    if (!this._allPosts) {
      return html`<div
        style="display: flex; flex: 1; align-items: center; justify-content: center"
      >
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      </div>`;
    }

    if (this._allPosts.length === 0) return html`<span style="opacity: 0.6; margin-top: 256px;">There are no posts yet</span>`

    return this._allPosts.map(
      postHash =>
        html`<post-detail
          .postHash=${postHash}
          style="margin-top: 16px;"
        ></post-detail>`
    );
  }
}
