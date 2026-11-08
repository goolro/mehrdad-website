
      var require = await (async () => {
        var { createRequire } = await import("node:module");
        return createRequire(import.meta.url);
      })();
    
import "../esm-chunks/chunk-VJBIAOVP.js";

// src/run/constants.ts
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
var MODULE_DIR = fileURLToPath(new URL(".", import.meta.url));
var PLUGIN_DIR = resolve(`${MODULE_DIR}../../..`);
var RUN_CONFIG_FILE = "run-config.json";
export {
  MODULE_DIR,
  PLUGIN_DIR,
  RUN_CONFIG_FILE
};
