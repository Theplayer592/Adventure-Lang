import { rm } from "fs"
import { join } from "path"

rm(join(process.cwd(), "./build"), {
    recursive: true,
    force: true
}, (e) => { if (e) throw e })