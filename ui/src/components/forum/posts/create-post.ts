import { LitElement, html } from 'lit';
import { state, customElement } from 'lit/decorators.js';
import {
  InstalledCell,
  AppWebsocket,
  InstalledAppInfo,
} from '@holochain/client';
import { contextProvided } from '@lit-labs/context';
import { appWebsocketContext, appInfoContext } from '../../../contexts';
import { Post } from '../../../types/forum/posts';
import '@material/mwc-button';
import '@material/mwc-textarea';
import '@type-craft/title/create-title';
import '@type-craft/content/create-content';

@customElement('create-post')
export class CreatePost extends LitElement {
  @state()
  _title: string | undefined;

  @state()
  _content: string | undefined;

  isPostValid() {
    return this._title && this._content;
  }

  @contextProvided({ context: appWebsocketContext })
  appWebsocket!: AppWebsocket;

  @contextProvided({ context: appInfoContext })
  appInfo!: InstalledAppInfo;

  async createPost() {
    const cellData = this.appInfo.cell_data.find(
      (c: InstalledCell) => c.role_id === 'forum'
    )!;

    const post: Post = {
      title: this._title!,
      content: this._content!,
    };

    const { entryHash } = await this.appWebsocket.callZome({
      cap_secret: null,
      cell_id: cellData.cell_id,
      zome_name: 'posts',
      fn_name: 'create_post',
      payload: post,
      provenance: cellData.cell_id[1],
    });

    this.dispatchEvent(
      new CustomEvent('post-created', {
        composed: true,
        bubbles: true,
        detail: {
          entryHash,
        },
      })
    );
  }

  render() {
    return html`<sl-card>
      <div style="display: flex; flex-direction: column; align-items: start">
        <span style="font-size: 18px">Create Post</span>

        <create-title
          @change=${(e: Event) => {
            this._title = (e.target as any).value;
          }}
          style="margin-top: 16px"
        ></create-title>

        <mwc-textarea
          style="margin-top: 16px; width: 800px; height: 500px"
          label="Content"
          outlined
          @input=${(e: Event) => {
            this._content = (e.target as any).value;
          }}
        ></mwc-textarea>

        <mwc-button
          label="Create Post"
          style="align-self: end; margin-top: 24px"
          .disabled=${!this.isPostValid()}
          @click=${() => this.createPost()}
        ></mwc-button></div
    ></sl-card>`;
  }
}
