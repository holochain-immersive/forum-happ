import { LitElement, html } from "lit";
import { state, customElement, property } from "lit/decorators.js";
import "@material/mwc-circular-progress";
import "@material/mwc-icon-button";
import "@type-craft/title/title-detail";
import "@holochain-open-dev/utils/holo-identicon";
import "@type-craft/content/content-detail";
import { contextProvided } from "@lit-labs/context";
import { Record, ActionHash, AppAgentClient } from "@holochain/client";
import isEqual from "lodash-es/isEqual";

import "../profiles/agent-nickname";
import "../comments/comments-on-post";

import { appAgentClientContext } from "../../../contexts";
import { extractEntry, extractAction, extractActionHash } from "../../../utils";

@customElement("post-detail")
export class PostDetail extends LitElement {
  @property({ type: Object })
  postHash!: ActionHash;

  @state()
  _post!: Record | undefined;

  @contextProvided({ context: appAgentClientContext })
  client!: AppAgentClient;

  firstUpdated() {
    this.fetchPost();
    setInterval(() => this.fetchPost(), 3000);
  }

  async fetchPost() {
    this._post = await this.client.callZome({
      role_name: "forum",
      zome_name: "posts",
      fn_name: "get_post",
      payload: this.postHash,
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

        ${isEqual(extractAction(this._post).author, this.client.myPubKey)
          ? html`<mwc-icon-button
              icon="edit"
              style="position: absolute; right: -16px; top: -16px"
              @click=${() =>
                this.dispatchEvent(
                  new CustomEvent("updating-post", {
                    bubbles: true,
                    composed: true,
                    detail: {
                      actionHash: extractActionHash(this._post!),
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
            .hash=${extractAction(this._post).author}
            size="24"
          ></holo-identicon>
          <agent-nickname
            .agentPubKey=${extractAction(this._post).author}
          ></agent-nickname
          >,
          <sl-relative-time
            style="margin-left: 4px;"
            .date=${new Date(extractAction(this._post).timestamp / 1000)}
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
