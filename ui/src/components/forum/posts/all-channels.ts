import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import {
  InstalledCell,
  AppWebsocket,
  InstalledAppInfo,
} from '@holochain/client';
import { contextProvided } from '@lit-labs/context';
import { appInfoContext, appWebsocketContext } from '../../../contexts';
import '@material/mwc-circular-progress';
import '@material/mwc-list';
import '@type-craft/title/title-detail';

@customElement('all-channels')
export class AllChannels extends LitElement {
  @state()
  _allChannels: Array<string> | undefined;

  @property()
  selectedChannel!: string;

  @contextProvided({ context: appWebsocketContext })
  appWebsocket!: AppWebsocket;

  @contextProvided({ context: appInfoContext })
  appInfo!: InstalledAppInfo;

  async firstUpdated() {
    const cellData = this.appInfo.cell_data.find(
      (c: InstalledCell) => c.role_id === 'forum'
    )!;

    this._allChannels = await this.appWebsocket.callZome({
      cap_secret: null,
      cell_id: cellData.cell_id,
      zome_name: 'posts',
      fn_name: 'get_all_channels',
      payload: null,
      provenance: cellData.cell_id[1],
    });
  }

  render() {
    if (!this._allChannels) {
      return html`<div
        style="display: flex; flex: 1; align-items: center; justify-content: center"
      >
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      </div>`;
    }

    if (this._allChannels.length === 0)
      return html`<span style="opacity: 0.6; margin-top: 256px;"
        >There are no channels yet</span
      >`;
    console.log(this.selectedChannel);
    return html`<mwc-list
      >${this._allChannels.map(
        channel =>
          html`<mwc-list-item
            .selected=${channel === this.selectedChannel}
            @click=${() =>
              this.dispatchEvent(
                new CustomEvent('channel-selected', {
                  bubbles: true,
                  composed: true,
                  detail: channel,
                })
              )}
            >${channel}</mwc-list-item
          >`
      )}</mwc-list
    > `;
  }
}
