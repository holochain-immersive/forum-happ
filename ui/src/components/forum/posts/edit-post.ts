import { LitElement, html } from 'lit';
import { state, customElement, property, query } from 'lit/decorators.js';
import {
  InstalledCell,
  AppWebsocket,
  InstalledAppInfo,
  HeaderHash,
} from '@holochain/client';
import { contextProvided } from '@lit-labs/context';
import '@material/mwc-button';
import '@material/mwc-textarea';
import '@material/mwc-textfield';
import { TextArea } from '@material/mwc-textarea';
import { TextField } from '@material/mwc-textfield';
import '@type-craft/title/create-title';
import '@type-craft/content/create-content';

import { appWebsocketContext, appInfoContext } from '../../../contexts';
import { Post } from '../../../types/forum/posts';
import { EntryWithHeader } from '../../../types/helpers';

@customElement('edit-post')
export class EditPost extends LitElement {
  @property({ type: Object })
  postHash!: HeaderHash;

  @contextProvided({ context: appWebsocketContext })
  appWebsocket!: AppWebsocket;

  @contextProvided({ context: appInfoContext })
  appInfo!: InstalledAppInfo;

  isPostValid() {
    return this._title && this._content;
  }

  @state()
  _post!: EntryWithHeader<Post> | undefined;

  @state()
  _title!: string;

  @state()
  _content!: string;

  @query('#title')
  titleField!: TextField;

  @query('#content')
  contentField!: TextArea;

  async firstUpdated() {
    const cellData = this.appInfo.cell_data.find(
      (c: InstalledCell) => c.role_id === 'forum'
    )!;
    
    const post: EntryWithHeader<Post> = await this.appWebsocket.callZome({
      cap_secret: null,
      cell_id: cellData.cell_id,
      zome_name: 'posts',
      fn_name: 'get_post',
      payload: this.postHash,
      provenance: cellData.cell_id[1],
    });

    this._title = post.entry.title;
    this._content = post.entry.content;
    setTimeout(() => {
      this.titleField.value = this._title;
      this.contentField.value = this._content;
    });
    this._post = post;
  }

  async updatePost() {
    const cellData = this.appInfo.cell_data.find(
      (c: InstalledCell) => c.role_id === 'forum'
    )!;

    await this.appWebsocket.callZome({
      cap_secret: null,
      cell_id: cellData.cell_id,
      zome_name: 'posts',
      fn_name: 'update_post',
      payload: {
        original_header_hash: this._post?.header_hash,
        updated_post: {
          title: this._title,
          content: this._content,
        },
      },
      provenance: cellData.cell_id[1],
    });

    this.dispatchEvent(
      new CustomEvent('post-updated', {
        composed: true,
        bubbles: true,
      })
    );
  }

  render() {
    if (!this._post)
      return html`<sl-card><sl-skeleton></sl-skeleton></sl-card>`;

    return html`<sl-card>
      <div style="display: flex; flex-direction: column; align-items: start">
        <span style="font-size: 18px">Update Post</span>

        <mwc-textfield
          id="title"
          style="margin-top: 16px"
          label="Title"
          outlined
          @input=${(e: Event) => {
            this._title = (e.target as any).value;
          }}
        ></mwc-textfield>

        <mwc-textarea
          id="content"
          style="margin-top: 16px; width: 800px; height: 500px"
          label="Content"
          outlined
          @input=${(e: Event) => {
            this._content = (e.target as any).value;
          }}
        ></mwc-textarea>

        <mwc-button
          label="Update Post"
          style="align-self: end; margin-top: 24px"
          .disabled=${!this.isPostValid()}
          @click=${() => this.updatePost()}
        ></mwc-button></div
    ></sl-card>`;
  }
}
