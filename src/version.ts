import { readFileSync } from "node:fs";
import { join } from "node:path";

const pkgPath = join(__dirname, "..", "package.json");
const { version } = JSON.parse(readFileSync(pkgPath, "utf8")) as { version: string };

/** Published npm version at load time (from repo `package.json`). */
export const GRAMORA_VERSION = version;

/** Default Bot API User-Agent string: `gramora-bot/<version>`. */
export const DEFAULT_GRAMORA_USER_AGENT = `gramora-bot/${GRAMORA_VERSION}`;
