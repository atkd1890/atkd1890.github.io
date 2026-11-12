// Loads and validates showcase.yml. An invalid file fails the build.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { load as parseYaml } from "js-yaml";
import { validateShowcase } from "../../lib/showcase-schema.js";

const file = fileURLToPath(new URL("./showcase.yml", import.meta.url));

export default function () {
  return validateShowcase(parseYaml(readFileSync(file, "utf8")));
}
