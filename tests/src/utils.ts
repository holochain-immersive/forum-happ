import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const forumAppPath =
  dirname(fileURLToPath(import.meta.url)) + "/../../workdir/forum.happ";
