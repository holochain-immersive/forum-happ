import { LitElement, html, PropertyValues } from "lit";
import { state, customElement, property } from "lit/decorators.js";
import { ActionHash, AppAgentClient } from "@holochain/client";
import { contextProvided } from "@lit-labs/context";
import { appAgentClientContext } from "../../../contexts";
import "@material/mwc-circular-progress";
import "@type-craft/title/title-detail";

import "./post-detail";

@customElement("channel-posts")
export class ChannelPosts extends LitElement {
  @property()
  channel!: string;

  @state()
  _channelPosts: Array<ActionHash> | undefined;

  @contextProvided({ context: appAgentClientContext })
  client!: AppAgentClient;

  firstUpdated() {
    this.fetchPosts();
    setInterval(() => this.fetchPosts(), 3000);
  }

  async fetchPosts() {
    this._channelPosts = await this.client.callZome({
      role_name: "forum",
      zome_name: "posts",
      fn_name: "get_channel_posts",
      payload: this.channel,
    });
  }

  updated(changedValues: PropertyValues) {
    super.updated(changedValues);

    if (changedValues.has("channel")) {
      this._channelPosts = undefined;
      this.fetchPosts();
    }
  }

  render() {
    if (!this._channelPosts) {
      return html`<div
        style="display: flex; flex: 1; align-items: center; justify-content: center"
      >
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      </div>`;
    }

    if (this._channelPosts.length === 0)
      return html`<span style="opacity: 0.6; margin-top: 256px;"
        >There are no posts yet</span
      >`;

    return this._channelPosts.map(
      (postHash) =>
        html`<post-detail
          .postHash=${postHash}
          style="margin-top: 16px;"
        ></post-detail>`
    );
  }
}
