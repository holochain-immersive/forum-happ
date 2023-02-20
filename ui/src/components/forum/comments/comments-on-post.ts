import { LitElement, html } from "lit";
import { state, customElement, property } from "lit/decorators.js";
import { ActionHash, AppAgentClient, Record } from "@holochain/client";
import { contextProvided } from "@lit-labs/context";
import { TextField } from "@material/mwc-textfield";
import isEqual from "lodash-es/isEqual";
import "@material/mwc-circular-progress";
import "@type-craft/content/content-detail";

import { appAgentClientContext } from "../../../contexts";
import { extractEntry, extractAction, extractActionHash } from "../../../utils";

@customElement("comments-on-post")
export class CommentsOnPost extends LitElement {
  @property({ type: Object })
  postHash!: ActionHash;

  @state()
  _comments: Array<Record> | undefined;

  @contextProvided({ context: appAgentClientContext })
  client!: AppAgentClient;

  firstUpdated() {
    this.fetchComments();
    setInterval(() => this.fetchComments(), 3000);
  }

  async fetchComments() {
    this._comments = await this.client.callZome({
      role_name: "forum",
      zome_name: "comments",
      fn_name: "get_comments_on",
      payload: this.postHash,
    });
  }

  async comment(field: TextField) {
    await this.client.callZome({
      role_name: "forum",
      zome_name: "comments",
      fn_name: "create_comment",
      payload: { comment_on: this.postHash, comment: field.value },
    });

    field.value = "";
    await this.fetchComments();
  }

  async deleteComment(comment: ActionHash) {
    await this.client.callZome({
      role_name: "forum",
      zome_name: "comments",
      fn_name: "delete_comment",
      payload: comment,
    });

    await this.fetchComments();
  }

  renderComment(comment: Record) {
    return html`
      <div
        style="display:flex; flex: 1; flex-direction: row; margin-bottom: 16px;"
      >
        <holo-identicon .hash=${extractAction(comment).author}></holo-identicon>
        <div
          style="display:flex; flex: 1; flex-direction: column;  align-items: start; margin-left: 16px;"
        >
          <agent-nickname
            .agentPubKey=${extractAction(comment).author}
          ></agent-nickname>
          <span style="opacity: 0.8; margin-top: 4px"
            >${extractEntry(comment).comment}</span
          >
        </div>

        ${isEqual(extractAction(comment).author, this.client.myPubKey)
          ? html`
              <mwc-icon-button
                icon="delete"
                @click=${() => this.deleteComment(extractActionHash(comment))}
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
      ${this._comments.map((comment) => this.renderComment(comment))}

      <div style="display:flex; flex-direction: row; align-items: center">
        <holo-identicon .hash=${this.client.myPubKey}></holo-identicon>
        <mwc-textfield
          id="new-comment"
          style="margin-left: 8px; flex: 1"
          label="New Comment"
          outlined
          @keypress=${(e: KeyboardEvent) =>
            e.key === "Enter" && this.comment(e.target as TextField)}
        ></mwc-textfield>
      </div>
    </div> `;
  }
}
