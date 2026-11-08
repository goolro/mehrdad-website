
      var require = await (async () => {
        var { createRequire } = await import("node:module");
        return createRequire(import.meta.url);
      })();
    
import {
  __require
} from "../esm-chunks/chunk-VJBIAOVP.js";

// src/build/advanced-api-routes.ts
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
var ApiRouteType = /* @__PURE__ */ ((ApiRouteType2) => {
  ApiRouteType2["SCHEDULED"] = "experimental-scheduled";
  ApiRouteType2["BACKGROUND"] = "experimental-background";
  return ApiRouteType2;
})(ApiRouteType || {});
async function getAPIRoutesConfigs(ctx) {
  const uniqueApiRoutes = /* @__PURE__ */ new Set();
  const functionsConfigManifestPath = join(
    ctx.publishDir,
    "server",
    "functions-config-manifest.json"
  );
  if (existsSync(functionsConfigManifestPath)) {
    const functionsConfigManifest = JSON.parse(
      await readFile(functionsConfigManifestPath, "utf-8")
    );
    for (const apiRoute of Object.keys(functionsConfigManifest.functions)) {
      uniqueApiRoutes.add(apiRoute);
    }
  }
  const pagesManifestPath = join(ctx.publishDir, "server", "pages-manifest.json");
  if (existsSync(pagesManifestPath)) {
    const pagesManifest = JSON.parse(await readFile(pagesManifestPath, "utf-8"));
    for (const route of Object.keys(pagesManifest)) {
      if (route.startsWith("/api/")) {
        uniqueApiRoutes.add(route);
      }
    }
  }
  if (uniqueApiRoutes.size === 0) {
    return [];
  }
  const appDir = ctx.resolveFromSiteDir(".");
  const pagesDir = join(appDir, "pages");
  const srcPagesDir = join(appDir, "src", "pages");
  const { pageExtensions } = ctx.requiredServerFiles.config;
  return Promise.all(
    [...uniqueApiRoutes].map(async (apiRoute) => {
      const filePath = getSourceFileForPage(apiRoute, [pagesDir, srcPagesDir], pageExtensions);
      const sharedFields = {
        apiRoute,
        filePath,
        config: {}
      };
      if (filePath) {
        const config = await extractConfigFromFile(filePath, appDir);
        return {
          ...sharedFields,
          config
        };
      }
      return sharedFields;
    })
  );
}
var SOURCE_FILE_EXTENSIONS = ["js", "jsx", "ts", "tsx"];
var getSourceFileForPage = (page, roots, pageExtensions = SOURCE_FILE_EXTENSIONS) => {
  for (const root of roots) {
    for (const extension of pageExtensions) {
      const file = join(root, `${page}.${extension}`);
      if (existsSync(file)) {
        return file;
      }
      const fileAtFolderIndex = join(root, page, `index.${extension}`);
      if (existsSync(fileAtFolderIndex)) {
        return fileAtFolderIndex;
      }
    }
  }
};
var findModuleFromBase = ({
  paths,
  candidates
}) => {
  for (const candidate of candidates) {
    try {
      const modulePath = __require.resolve(candidate, { paths });
      if (modulePath) {
        return modulePath;
      }
    } catch {
    }
  }
  for (const candidate of candidates) {
    try {
      const modulePath = __require.resolve(candidate);
      if (modulePath) {
        return modulePath;
      }
    } catch {
    }
  }
  return null;
};
var extractConstValue;
var parseModule;
var extractConfigFromFile = async (apiFilePath, appDir) => {
  if (!apiFilePath || !existsSync(apiFilePath)) {
    return {};
  }
  const extractConstValueModulePath = findModuleFromBase({
    paths: [appDir],
    candidates: ["next/dist/build/analysis/extract-const-value"]
  });
  const parseModulePath = findModuleFromBase({
    paths: [appDir],
    candidates: ["next/dist/build/analysis/parse-module"]
  });
  if (!extractConstValueModulePath || !parseModulePath) {
    return {};
  }
  if (!extractConstValue && extractConstValueModulePath) {
    extractConstValue = __require(extractConstValueModulePath);
  }
  if (!parseModule && parseModulePath) {
    parseModule = __require(parseModulePath).parseModule;
  }
  const { extractExportedConstValue } = extractConstValue;
  const fileContent = await readFile(apiFilePath, "utf8");
  if (!fileContent.includes("config")) {
    return {};
  }
  try {
    const installBindingsModule = findModuleFromBase({
      paths: [appDir],
      candidates: ["next/dist/build/swc/install-bindings"]
    });
    if (installBindingsModule) {
      const { installBindings } = __require(installBindingsModule);
      await installBindings();
    }
  } catch {
  }
  const ast = await parseModule(apiFilePath, fileContent);
  try {
    const extracted = extractExportedConstValue(ast, "config");
    if (!extracted || typeof extracted !== "object") {
      return {};
    }
    if ("value" in extracted) {
      return extracted.value;
    }
    return extracted;
  } catch {
    return {};
  }
};
export {
  ApiRouteType,
  getAPIRoutesConfigs
};
