import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import {
  InstalledCell,
  AppWebsocket,
  InstalledAppInfo,
  AgentPubKey,
} from '@holochain/client';
import { contextProvided } from '@lit-labs/context';
import { appInfoContext, appWebsocketContext } from '../../../contexts';
import { Profile } from '../../../types/forum/profiles';
import '@material/mwc-circular-progress';
import '@type-craft/title/title-detail';

@customElement('agent-nickname')
export class AgentNickname extends LitElement {
  @property({ type: Object })
  agentPubKey!: AgentPubKey;

  @state()
  _profile: Profile | undefined;

  @contextProvided({ context: appWebsocketContext })
  appWebsocket!: AppWebsocket;

  @contextProvided({ context: appInfoContext })
  appInfo!: InstalledAppInfo;

  async firstUpdated() {
    const cellData = this.appInfo.cell_data.find(
      (c: InstalledCell) => c.role_id === 'forum'
    )!;

    this._profile = await this.appWebsocket.callZome({
      cap_secret: null,
      cell_id: cellData.cell_id,
      zome_name: 'profiles',
      fn_name: 'get_agent_profile',
      payload: this.agentPubKey,
      provenance: cellData.cell_id[1],
    });
  }

  render() {
    if (!this._profile) {
      return html`<sl-skeleton></sl-skeleton>`;
    }

    return html` <span>${this._profile.nickname}</span> `;
  }
}
