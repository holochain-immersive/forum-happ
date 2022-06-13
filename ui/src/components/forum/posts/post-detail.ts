import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import '@material/mwc-circular-progress';
import '@type-craft/title/title-detail';
import '@type-craft/content/content-detail';
import { contextProvided } from '@lit-labs/context';
import {
  AppWebsocket,
  HeaderHash,
  InstalledAppInfo,
  InstalledCell,
} from '@holochain/client';

import '../profiles/agent-nickname';

import { Post } from '../../../types/forum/posts';
import { EntryWithHeader } from '../../../types/helpers';
import { appInfoContext, appWebsocketContext } from '../../../contexts';

@customElement('post-detail')
export class PostDetail extends LitElement {
  @property({ type: Object })
  postHash!: HeaderHash;

  @state()
  _post!: EntryWithHeader<Post> | undefined;

  @contextProvided({ context: appWebsocketContext })
  appWebsocket!: AppWebsocket;

  @contextProvided({ context: appInfoContext })
  appInfo!: InstalledAppInfo;

  async firstUpdated() {
    const cellData = this.appInfo.cell_data.find(
      (c: InstalledCell) => c.role_id === 'forum'
    )!;

    this._post = await this.appWebsocket.callZome({
      cap_secret: null,
      cell_id: cellData.cell_id,
      zome_name: 'posts',
      fn_name: 'get_post',
      payload: this.postHash,
      provenance: cellData.cell_id[1],
    });
  }

  render() {
    return html`
      <sl-card style="width: 500px;"> ${this.renderContent()} </sl-card>
    `;
  }

  renderContent() {
    if (!this._post) {
      return html`<div
        style="display: flex; flex: 1; align-items: center; justify-content: center"
      >
        <sl-skeleton></sl-skeleton>
        <sl-skeleton></sl-skeleton>
      </div>`;
    }
    return html`
      <div style="display: flex; flex-direction: column; align-items: start">
        <span style="font-size: 22px">${this._post.entry.title}</span>
        <span style="margin-top: 16px; font-size: 18px"
          >${this._post.entry.content}</span
        >

        <span style="align-self: end; font-size: 12px; color: grey"
          >Created by
          <agent-nickname
            .agentPubKey=${this._post.header.author}
          ></agent-nickname
          >,
          <sl-relative-time
            .date=${new Date(this._post.header.timestamp / 1000)}
          ></sl-relative-time>
        </span>
      </div>
    `;
  }
}
