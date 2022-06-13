import { readFolder, writeDirectoryTree } from "@source-craft/fs";
import { unimplementFunctions } from "@source-craft/rust";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dir = readFolder(`${__dirname}/../dna/zomes/profiles/src`);

dir = unimplementFunctions(dir, [
  "get_my_profile",
  "get_agent_profile",
  "create_profile",
]);

console.log(dir);

writeDirectoryTree("dna/zomes/profiles/src", dir);
