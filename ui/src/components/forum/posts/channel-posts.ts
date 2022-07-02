import { LitElement, html, PropertyValues } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import {
  InstalledCell,
  AppWebsocket,
  InstalledAppInfo,
  ActionHash,
} from '@holochain/client';
import { contextProvided } from '@lit-labs/context';
import { appInfoContext, appWebsocketContext } from '../../../contexts';
import '@material/mwc-circular-progress';
import '@type-craft/title/title-detail';

import './post-detail';

@customElement('channel-posts')
export class ChannelPosts extends LitElement {
  @property()
  channel!: string;

  @state()
  _channelPosts: Array<ActionHash> | undefined;

  @contextProvided({ context: appWebsocketContext })
  appWebsocket!: AppWebsocket;

  @contextProvided({ context: appInfoContext })
  appInfo!: InstalledAppInfo;

  async updated(changedValues: PropertyValues) {
    super.updated(changedValues);

    if (changedValues.has('channel')) {
      this._channelPosts = undefined;

      const cellData = this.appInfo.cell_data.find(
        (c: InstalledCell) => c.role_id === 'forum'
      )!;
      this._channelPosts = await this.appWebsocket.callZome({
        cap_secret: null,
        cell_id: cellData.cell_id,
        zome_name: 'posts',
        fn_name: 'get_channel_posts',
        payload: this.channel,
        provenance: cellData.cell_id[1],
      });
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
      postHash =>
        html`<post-detail
          .postHash=${postHash}
          style="margin-top: 16px;"
        ></post-detail>`
    );
  }
}
