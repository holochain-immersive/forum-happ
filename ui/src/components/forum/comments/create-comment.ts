
import { LitElement, html } from 'lit';
import { state, customElement } from 'lit/decorators.js';
import { InstalledCell, AppWebsocket, InstalledAppInfo } from '@holochain/client';
import { contextProvided } from '@lit-labs/context';
import { appWebsocketContext, appInfoContext } from '../../../contexts';
import { Comment } from '../../../types/forum/comments';
import '@material/mwc-button';
import '@type-craft/content/create-content';

@customElement('create-comment')
export class CreateComment extends LitElement {

    @state()
  _comment: string | undefined;

  isCommentValid() {
    return this._comment;
  }

  @contextProvided({ context: appWebsocketContext })
  appWebsocket!: AppWebsocket;

  @contextProvided({ context: appInfoContext })
  appInfo!: InstalledAppInfo;

  async createComment() {
    const cellData = this.appInfo.cell_data.find((c: InstalledCell) => c.role_id === 'forum')!;

    const comment: Comment = {
      comment: this._comment!,
    };

    const { entryHash } = await this.appWebsocket.callZome({
      cap_secret: null,
      cell_id: cellData.cell_id,
      zome_name: 'comments',
      fn_name: 'create_comment',
      payload: comment,
      provenance: cellData.cell_id[1]
    });

    this.dispatchEvent(new CustomEvent('comment-created', {
      composed: true,
      bubbles: true,
      detail: {
        entryHash
      }
    }));
  }

  render() {
    return html`
      <div style="display: flex; flex-direction: column">
        <span style="font-size: 18px">Create Comment</span>

        <create-content 
      
      @change=${(e: Event) => this._comment = (e.target as any).value}
      style="margin-top: 16px"
    ></create-content>

        <mwc-button 
          label="Create Comment"
          .disabled=${!this.isCommentValid()}
          @click=${() => this.createComment()}
        ></mwc-button>
    </div>`;
  }
}
