import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const forumDnaPath = dirname(fileURLToPath(import.meta.url)) + "/../../workdir/forum.dna";