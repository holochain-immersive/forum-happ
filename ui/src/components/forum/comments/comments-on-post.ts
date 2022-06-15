import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import {
  InstalledCell,
  AppWebsocket,
  InstalledAppInfo,
  HeaderHash,
  AgentPubKey,
} from '@holochain/client';
import { Element } from '@holochain-open-dev/core-types';
import { contextProvided } from '@lit-labs/context';
import { TextField } from '@material/mwc-textfield';
import isEqual from 'lodash-es/isEqual';
import '@material/mwc-circular-progress';
import '@type-craft/content/content-detail';

import { appInfoContext, appWebsocketContext } from '../../../contexts';
import { extractEntry, extractHeader, extractHeaderHash } from '../../../utils';

@customElement('comments-on-post')
export class CommentsOnPost extends LitElement {
  @property({ type: Object })
  postHash!: HeaderHash;

  @state()
  _comments: Array<Element> | undefined;

  @contextProvided({ context: appWebsocketContext })
  appWebsocket!: AppWebsocket;

  @contextProvided({ context: appInfoContext })
  appInfo!: InstalledAppInfo;

  get myPubKey(): AgentPubKey {
    return this.appInfo.cell_data[0].cell_id[1];
  }

  async firstUpdated() {
    await this.fetchComments();
  }

  async fetchComments() {
    const cellData = this.appInfo.cell_data.find(
      (c: InstalledCell) => c.role_id === 'forum'
    )!;

    this._comments = await this.appWebsocket.callZome({
      cap_secret: null,
      cell_id: cellData.cell_id,
      zome_name: 'comments',
      fn_name: 'get_comments_on',
      payload: this.postHash,
      provenance: cellData.cell_id[1],
    });
  }

  async comment(field: TextField) {
    const cellData = this.appInfo.cell_data.find(
      (c: InstalledCell) => c.role_id === 'forum'
    )!;

    await this.appWebsocket.callZome({
      cap_secret: null,
      cell_id: cellData.cell_id,
      zome_name: 'comments',
      fn_name: 'create_comment',
      payload: { comment_on: this.postHash, comment: field.value },
      provenance: cellData.cell_id[1],
    });

    field.value = '';
    await this.fetchComments();
  }

  async deleteComment(comment: HeaderHash) {
    const cellData = this.appInfo.cell_data.find(
      (c: InstalledCell) => c.role_id === 'forum'
    )!;

    await this.appWebsocket.callZome({
      cap_secret: null,
      cell_id: cellData.cell_id,
      zome_name: 'comments',
      fn_name: 'delete_comment',
      payload: comment,
      provenance: cellData.cell_id[1],
    });

    await this.fetchComments();
  }

  renderComment(comment: Element) {
    return html`
      <div
        style="display:flex; flex: 1; flex-direction: row; margin-bottom: 16px;"
      >
        <holo-identicon
          .hash=${extractHeader(comment).author}
        ></holo-identicon>
        <div
          style="display:flex; flex: 1; flex-direction: column;  align-items: start; margin-left: 16px;"
        >
          <agent-nickname
            .agentPubKey=${extractHeader(comment).author}
          ></agent-nickname>
          <span style="opacity: 0.8; margin-top: 4px"
            >${extractEntry(comment).comment}</span
          >
        </div>

        ${isEqual(extractHeader(comment).author, this.myPubKey)
          ? html`
              <mwc-icon-button
                icon="delete"
                @click=${() =>
                  this.deleteComment(extractHeaderHash(comment))}
              ></mwc-icon-button>
            `
          : html``}
      </div>
    `;
  }

  render() {
    if (!this._comments) {
      return html`<div
        style="display: flex; flex: 1; align-items: center; justify-content: center"
      >
        <sl-skeleton></sl-skeleton>
        <sl-skeleton></sl-skeleton>
      </div>`;
    }

    return html`<div style="display: flex; flex-direction: column">
      ${this._comments.map(comment => this.renderComment(comment))}

      <div style="display:flex; flex-direction: row; align-items: center">
        <holo-identicon .hash=${this.myPubKey}></holo-identicon>
        <mwc-textfield
          id="new-comment"
          style="margin-left: 8px; flex: 1"
          label="New Comment"
          outlined
          @keypress=${(e: KeyboardEvent) =>
            e.key === 'Enter' && this.comment(e.target as TextField)}
        ></mwc-textfield>
      </div>
    </div> `;
  }
}
