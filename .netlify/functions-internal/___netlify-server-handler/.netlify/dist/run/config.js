
      var require = await (async () => {
        var { createRequire } = await import("node:module");
        return createRequire(import.meta.url);
      })();
    
import "../esm-chunks/chunk-VJBIAOVP.js";

// src/run/config.ts
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { PLUGIN_DIR, RUN_CONFIG_FILE } from "./constants.js";
import { setInMemoryCacheMaxSizeFromNextConfig } from "./storage/storage.cjs";
var getRunConfig = async () => {
  return JSON.parse(await readFile(resolve(PLUGIN_DIR, RUN_CONFIG_FILE), "utf-8"));
};
var setRunConfig = (config) => {
  const cacheHandler = join(PLUGIN_DIR, ".netlify/dist/run/handlers/cache.cjs");
  if (!existsSync(cacheHandler)) {
    throw new Error(`Cache handler not found at ${cacheHandler}`);
  }
  config.experimental = {
    ...config.experimental,
    // Before Next.js 14.1.0 path to the cache handler was in experimental section, see NextConfigForMultipleVersions type
    incrementalCacheHandlerPath: cacheHandler
  };
  config.cacheHandler = cacheHandler;
  config.images = {
    ...config.images,
    // @ts-expect-error `maximumDiskCacheSize` is not typed in min Next.js config type
    maximumDiskCacheSize: 0
  };
  setInMemoryCacheMaxSizeFromNextConfig(
    config.cacheMaxMemorySize ?? config.experimental?.isrMemoryCacheSize
  );
  process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(config);
  return config;
};
export {
  getRunConfig,
  setRunConfig
};
