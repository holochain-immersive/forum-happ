import { LitElement, html } from "lit";
import { state, customElement, property, query } from "lit/decorators.js";
import { AppAgentClient, Record, ActionHash } from "@holochain/client";
import { contextProvided } from "@lit-labs/context";
import "@material/mwc-button";
import "@material/mwc-textarea";
import "@material/mwc-textfield";
import { TextArea } from "@material/mwc-textarea";
import { TextField } from "@material/mwc-textfield";
import "@type-craft/title/create-title";
import "@type-craft/content/create-content";

import { appAgentClientContext } from "../../../contexts";
import { extractEntry, extractActionHash } from "../../../utils";

@customElement("edit-post")
export class EditPost extends LitElement {
  @property({ type: Object })
  postHash!: ActionHash;

  @contextProvided({ context: appAgentClientContext })
  client!: AppAgentClient;

  isPostValid() {
    return this._title && this._content;
  }

  @state()
  _post!: Record | undefined;

  @state()
  _title!: string;

  @state()
  _content!: string;

  @query("#title")
  titleField!: TextField;

  @query("#content")
  contentField!: TextArea;

  async firstUpdated() {
    const post: any = await this.client.callZome({
      role_name: "forum",
      zome_name: "posts",
      fn_name: "get_post",
      payload: this.postHash,
    });

    this._title = extractEntry(post).title;
    this._content = extractEntry(post).content;
    setTimeout(() => {
      this.titleField.value = this._title;
      this.contentField.value = this._content;
    });
    this._post = post;
  }

  async updatePost() {
    await this.client.callZome({
      role_name: "forum",
      zome_name: "posts",
      fn_name: "update_post",
      payload: {
        post_to_update: extractActionHash(this._post!),
        updated_post: {
          title: this._title,
          content: this._content,
        },
      },
    });

    this.dispatchEvent(
      new CustomEvent("post-updated", {
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
