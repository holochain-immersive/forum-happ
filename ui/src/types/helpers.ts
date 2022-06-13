import { HeaderHash, Header } from '@holochain/client';

export interface EntryWithHeader<E> {
  header_hash: HeaderHash;
  header: Header;
  entry: E;
}
