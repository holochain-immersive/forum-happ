import { readFolder, writeDirectoryTree } from "@source-craft/fs";
import { replaceFunctionBody } from "@source-craft/rust";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dir = readFolder(`${__dirname}/../dna/zomes/profiles/src`);

dir = replaceFunctionBody(dir, "get_my_profile", "Ok(None)");
dir = replaceFunctionBody(dir, "get_agent_profile", "unimplemented!()");
dir = replaceFunctionBody(dir, "create_profile", "unimplemented!()");

writeDirectoryTree("dna/zomes/profiles/src", dir);
