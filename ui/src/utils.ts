import { Element } from '@holochain-open-dev/core-types';
import { Header, HeaderHash } from '@holochain/client';
import { decode } from '@msgpack/msgpack';

export function extractEntry(element: Element): any {
  return decode((element.entry as any)?.Present.entry) as any;
}

export function extractHeader(element: Element): Header {
  return (element as any).signed_header.hashed.content;
}

export function extractHeaderHash(element: Element): HeaderHash {
  return (element as any).signed_header.hashed.hash;
}
