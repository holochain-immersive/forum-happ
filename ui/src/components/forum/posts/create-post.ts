import { LitElement, html } from "lit";
import { state, customElement, query } from "lit/decorators.js";
import { AppAgentClient } from "@holochain/client";
import { contextProvided } from "@lit-labs/context";
import { appAgentClientContext } from "../../../contexts";
import { Post } from "../../../types/forum/posts";
import "@material/mwc-button";
import "@material/mwc-textarea";
import "@type-craft/title/create-title";
import "@type-craft/content/create-content";
import "@vaadin/combo-box/theme/material/vaadin-combo-box.js";

@customElement("create-post")
export class CreatePost extends LitElement {
  @state()
  _title: string | undefined;

  @state()
  _content: string | undefined;

  @state()
  _allChannels: string[] | undefined;

  @state()
  _channel: string | undefined;

  isPostValid() {
    return this._title && this._content;
  }

  @contextProvided({ context: appAgentClientContext })
  client!: AppAgentClient;

  @query("#channel-selector")
  channelSelector: any;

  async firstUpdated() {
    this._allChannels = await this.client.callZome({
      role_name: "forum",
      zome_name: "posts",
      fn_name: "get_all_channels",
      payload: null,
    });

    this.channelSelector.value = "general";
  }

  async createPost() {
    const post: Post = {
      title: this._title!,
      content: this._content!,
    };

    const { entry_hash } = await this.client.callZome({
      role_name: "forum",
      zome_name: "posts",
      fn_name: "create_post",
      payload: { post, channel: this._channel },
    });

    this.dispatchEvent(
      new CustomEvent("post-created", {
        composed: true,
        bubbles: true,
        detail: {
          entryHash: entry_hash,
          channel: this._channel,
        },
      })
    );
  }

  render() {
    return html`<sl-card>
      <div style="display: flex; flex-direction: column; align-items: start">
        <span style="font-size: 18px">Create Post</span>
        <div
          style="display: flex; flex-direction: row; align-self: stretch; align-items: center;"
        >
          <create-title
            @change=${(e: Event) => {
              this._title = (e.target as any).value;
            }}
            style="margin-top: 16px"
          ></create-title>
          <span style="flex:1"></span>

          <vaadin-combo-box
            id="channel-selector"
            allow-custom-value
            label="Channel"
            helper-text="Select or create a new one"
            style="text-align: start"
            .items=${this._allChannels}
            @value-changed=${(e: CustomEvent) => {
              this._channel = e.detail.value;
            }}
          ></vaadin-combo-box>
        </div>
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
