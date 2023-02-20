import { createContext } from "@lit-labs/context";
import { AppAgentClient } from "@holochain/client";

export const appAgentClientContext =
  createContext<AppAgentClient>("appAgentClient");
