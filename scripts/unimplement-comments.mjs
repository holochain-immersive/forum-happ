import { readFolder, writeDirectoryTree } from "@source-craft/fs";
import { replaceFunctionBody } from "@source-craft/rust";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dir = readFolder(`${__dirname}/../dna/zomes/profiles/src`);

dir = replaceFunctionBody(dir, "get_all_posts", "Ok(vec![])");
dir = replaceFunctionBody(dir, "get_post", "Ok(None)");
dir = replaceFunctionBody(dir, "get_latest_post", "unimplemented!()");
dir = replaceFunctionBody(dir, "create_post", "unimplemented!()");
dir = replaceFunctionBody(dir, "update_post", "unimplemented!()");

writeDirectoryTree("dna/zomes/profiles/src", dir);
