import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import '@material/mwc-circular-progress';
import '@material/mwc-icon-button';
import '@type-craft/title/title-detail';
import '@holochain-open-dev/utils/holo-identicon';
import '@type-craft/content/content-detail';
import { contextProvided } from '@lit-labs/context';
import { Element } from '@holochain-open-dev/core-types';
import {
  AgentPubKey,
  AppWebsocket,
  HeaderHash,
  InstalledAppInfo,
  InstalledCell,
} from '@holochain/client';
import isEqual from 'lodash-es/isEqual';

import '../profiles/agent-nickname';
import '../comments/comments-on-post';

import { appInfoContext, appWebsocketContext } from '../../../contexts';
import { extractEntry, extractHeader, extractHeaderHash } from '../../../utils';

@customElement('post-detail')
export class PostDetail extends LitElement {
  @property({ type: Object })
  postHash!: HeaderHash;

  @state()
  _post!: Element | undefined;

  @contextProvided({ context: appWebsocketContext })
  appWebsocket!: AppWebsocket;

  @contextProvided({ context: appInfoContext })
  appInfo!: InstalledAppInfo;

  get myPubKey(): AgentPubKey {
    return this.appInfo.cell_data[0].cell_id[1];
  }

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
      <div
        style="display: flex; flex-direction: column; align-items: start; position: relative"
      >
        <span style="font-size: 22px">${extractEntry(this._post).title}</span>
        <span style="margin-top: 16px; font-size: 18px"
          >${extractEntry(this._post).content}</span
        >

        ${isEqual(extractHeader(this._post).author, this.myPubKey)
          ? html`<mwc-icon-button
              icon="edit"
              style="position: absolute; right: -16px; top: -16px"
              @click=${() =>
                this.dispatchEvent(
                  new CustomEvent('updating-post', {
                    bubbles: true,
                    composed: true,
                    detail: {
                      headerHash: extractHeaderHash(this._post!),
                    },
                  })
                )}
            ></mwc-icon-button>`
          : html``}

        <div
          style="margin-top: 24px; align-self: end; font-size: 12px; color: grey; display: flex; flex-direction: row; align-items: center"
        >
          Created by
          <holo-identicon
            style="margin: 0 8px"
            .hash=${extractHeader(this._post).author}
            size="24"
          ></holo-identicon>
          <agent-nickname
            .agentPubKey=${extractHeader(this._post).author}
          ></agent-nickname
          >,
          <sl-relative-time
            style="margin-left: 4px;"
            .date=${new Date(extractHeader(this._post).timestamp / 1000)}
          ></sl-relative-time>
        </div>
      </div>
      <comments-on-post
        slot="footer"
        .postHash=${this.postHash}
      ></comments-on-post>
    `;
  }
}
