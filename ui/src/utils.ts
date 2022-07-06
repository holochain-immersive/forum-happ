import { Record, Action, ActionHash } from '@holochain/client';
import { decode } from '@msgpack/msgpack';

export function extractEntry(record: Record): any {
  return decode((record.entry as any)?.Present.entry) as any;
}

export function extractAction(record: Record): Action {
  return (record as any).signed_action.hashed.content;
}

export function extractActionHash(record: Record): ActionHash {
  return (record as any).signed_action.hashed.hash;
}
