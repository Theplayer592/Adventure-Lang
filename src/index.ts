import { readFile } from "node:fs/promises"
import { join } from "node:path"

import Parser from "./parser.js"

const parser = new Parser(await readFile(join(process.cwd(), "./assets/index.gm"), "utf-8"))