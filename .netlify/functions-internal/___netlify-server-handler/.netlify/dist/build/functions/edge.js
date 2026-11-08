
      var require = await (async () => {
        var { createRequire } = await import("node:module");
        return createRequire(import.meta.url);
      })();
    
import {
  require_out
} from "../../esm-chunks/chunk-T435CDHD.js";
import {
  __toESM
} from "../../esm-chunks/chunk-VJBIAOVP.js";

// src/build/functions/edge.ts
var import_fast_glob = __toESM(require_out(), 1);
import { cp, lstat, mkdir, readdir, readFile, readlink, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path/posix";
import { EDGE_HANDLER_NAME } from "../plugin-context.js";
function nodeMiddlewareDefinitionHasMatcher(definition) {
  return Array.isArray(definition.matchers);
}
var writeEdgeManifest = async (ctx, manifest) => {
  await mkdir(ctx.edgeFunctionsDir, { recursive: true });
  await writeFile(join(ctx.edgeFunctionsDir, "manifest.json"), JSON.stringify(manifest, null, 2));
};
var copyRuntime = async (ctx, handlerDirectory) => {
  const files = await (0, import_fast_glob.glob)("edge-runtime/**/*", {
    cwd: ctx.pluginDir,
    ignore: ["**/*.test.ts"],
    dot: true
  });
  await Promise.all(
    files.map(
      (path) => cp(join(ctx.pluginDir, path), join(handlerDirectory, path), { recursive: true })
    )
  );
};
var fixEdgeRuntimeTurbopackMatcherJsonPart = (matchers) => {
  return matchers.map((matcher) => {
    if (matcher.regexp) {
      return {
        ...matcher,
        // Next.js in some versions produces "\\\\.json" for edge runtime middleware when built with turbopack
        // with too many escapes preventing proper matching
        regexp: matcher.regexp.replaceAll("\\\\.json", "\\.json")
      };
    }
    return matcher;
  });
};
var augmentMatchers = (matchers, ctx) => {
  const i18NConfig = ctx.buildConfig.i18n;
  if (!i18NConfig) {
    return matchers;
  }
  return matchers.flatMap((matcher) => {
    if (matcher.originalSource && matcher.locale !== false) {
      return [
        matcher.regexp ? {
          ...matcher,
          // https://github.com/vercel/next.js/blob/5e236c9909a768dc93856fdfad53d4f4adc2db99/packages/next/src/build/analysis/get-page-static-info.ts#L332-L336
          // Next is producing pretty broad matcher for i18n locale. Presumably rest of their infrastructure protects this broad matcher
          // from matching on non-locale paths. For us this becomes request entry point, so we need to narrow it down to just defined locales
          // otherwise users might get unexpected matches on paths like `/api*`
          // additionally we don't have a way to normalize i18n paths for request without locale information, so we need to adjust the regexp to mark locale part as optional
          regexp: matcher.regexp.replace(
            "(?:\\/((?!_next\\/)[^/.]{1,}))",
            `(?:\\/((?!_next\\/)(${i18NConfig.locales.join("|")}){1,}))?`
          )
        } : matcher
      ];
    }
    return matcher;
  });
};
var writeHandlerFile = async (ctx, { matchers, name }) => {
  const nextConfig = ctx.buildConfig;
  const handlerName = getHandlerName({ name });
  const handlerDirectory = join(ctx.edgeFunctionsDir, handlerName);
  const handlerRuntimeDirectory = join(handlerDirectory, "edge-runtime");
  await copyRuntime(ctx, handlerDirectory);
  await writeFile(join(handlerRuntimeDirectory, "matchers.json"), JSON.stringify(matchers));
  const minimalNextConfig = {
    basePath: nextConfig.basePath,
    i18n: nextConfig.i18n,
    trailingSlash: nextConfig.trailingSlash,
    skipMiddlewareUrlNormalize: nextConfig.skipProxyUrlNormalize ?? nextConfig.skipMiddlewareUrlNormalize
  };
  await writeFile(
    join(handlerRuntimeDirectory, "next.config.json"),
    JSON.stringify(minimalNextConfig)
  );
  await writeFile(
    join(handlerDirectory, `${handlerName}.js`),
    `
    import { handleMiddleware } from './edge-runtime/middleware.ts';
    import handler from './server/${name}.js';

    export default (req, context) => handleMiddleware(req, context, handler);
    `
  );
};
var copyHandlerDependenciesForEdgeMiddleware = async (ctx, { name, env, files, wasm }) => {
  const srcDir = join(ctx.standaloneDir, ctx.nextDistDir);
  const destDir = join(ctx.edgeFunctionsDir, getHandlerName({ name }));
  const edgeRuntimeDir = join(ctx.pluginDir, "edge-runtime");
  const shimPath = join(edgeRuntimeDir, "shim/edge.js");
  const shim = await readFile(shimPath, "utf8");
  const parts = [shim];
  const outputFile = join(destDir, `server/${name}.js`);
  if (env) {
    for (const [key, value] of Object.entries(env)) {
      parts.push(`process.env.${key} = '${value}';`);
    }
  }
  if (wasm?.length) {
    for (const wasmChunk of wasm ?? []) {
      const data = await readFile(join(srcDir, wasmChunk.filePath));
      parts.push(`const ${wasmChunk.name} = Uint8Array.from(${JSON.stringify([...data])})`);
    }
  }
  for (const file of files) {
    const entrypoint = await readFile(join(srcDir, file), "utf8");
    parts.push(`;// Concatenated file: ${file} 
`, entrypoint);
  }
  parts.push(
    `const middlewareEntryKey = Object.keys(_ENTRIES).find(entryKey => entryKey.startsWith("middleware_${name}"));`,
    // turbopack entries are promises so we await here to get actual entry
    // non-turbopack entries are already resolved, so await does not change anything
    `export default await _ENTRIES[middlewareEntryKey].default;`
  );
  await mkdir(dirname(outputFile), { recursive: true });
  await writeFile(outputFile, parts.join("\n"));
};
var NODE_MIDDLEWARE_NAME = "node-middleware";
var copyHandlerDependenciesForNodeMiddleware = async (ctx) => {
  const name = NODE_MIDDLEWARE_NAME;
  const srcDir = join(ctx.standaloneDir, ctx.nextDistDir);
  const destDir = join(ctx.edgeFunctionsDir, getHandlerName({ name }));
  const edgeRuntimeDir = join(ctx.pluginDir, "edge-runtime");
  const shimPath = join(edgeRuntimeDir, "shim/node.js");
  const shim = await readFile(shimPath, "utf8");
  const parts = [shim];
  const entry = "server/middleware.js";
  const nft = `${entry}.nft.json`;
  const nftFilesPath = join(ctx.publishDir, nft);
  const nftManifest = JSON.parse(await readFile(nftFilesPath, "utf8"));
  const files = nftManifest.files.map((file) => join("server", file));
  files.push(entry);
  const { maxParentDirectoriesPath, unsupportedDotNodeModules } = files.reduce(
    (acc, file) => {
      let dirsUp = 0;
      let parentDirectoriesPath = "";
      for (const part of file.split("/")) {
        if (part === "..") {
          dirsUp += 1;
          parentDirectoriesPath += "../";
        } else {
          break;
        }
      }
      if (file.endsWith(".node")) {
        acc.unsupportedDotNodeModules.push(join(srcDir, file));
      }
      if (dirsUp > acc.maxDirsUp) {
        return {
          ...acc,
          maxDirsUp: dirsUp,
          maxParentDirectoriesPath: parentDirectoriesPath
        };
      }
      return acc;
    },
    { maxDirsUp: 0, maxParentDirectoriesPath: "", unsupportedDotNodeModules: [] }
  );
  if (unsupportedDotNodeModules.length !== 0) {
    throw new Error(
      `Usage of unsupported C++ Addon(s) found in Node.js Middleware:
${unsupportedDotNodeModules.map((file) => `- ${file}`).join("\n")}

Check https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/#limitations for more information.`
    );
  }
  const commonPrefix = relative(join(srcDir, maxParentDirectoriesPath), srcDir);
  parts.push(`const virtualModules = new Map();`, `const virtualSymlinks = new Map();`);
  const handleFileOrDirectory = async (fileOrDir) => {
    const srcPath = join(srcDir, fileOrDir);
    const stats = await lstat(srcPath);
    if (stats.isDirectory()) {
      const filesInDir = await readdir(srcPath);
      for (const fileInDir of filesInDir) {
        await handleFileOrDirectory(join(fileOrDir, fileInDir));
      }
    } else if (stats.isSymbolicLink()) {
      const symlinkTarget = await readlink(srcPath);
      parts.push(
        `virtualSymlinks.set(${JSON.stringify(join(commonPrefix, fileOrDir))}, ${JSON.stringify(symlinkTarget)});`
      );
    } else {
      const content = await readFile(srcPath, "utf8");
      parts.push(
        `virtualModules.set(${JSON.stringify(join(commonPrefix, fileOrDir))}, ${JSON.stringify(content)});`
      );
    }
  };
  for (const file of files) {
    await handleFileOrDirectory(file);
  }
  parts.push(`registerCJSModules(import.meta.url, virtualModules, virtualSymlinks);

    const require = createRequire(import.meta.url);
    const middlewareEntrypoint = "${join(commonPrefix, entry)}"
    const handlerMod = await require("./" + middlewareEntrypoint);
    const handler = handlerMod.default || handlerMod;

    export default handler
    `);
  const outputFile = join(destDir, `server/${name}.js`);
  await mkdir(dirname(outputFile), { recursive: true });
  await writeFile(outputFile, parts.join("\n"));
};
var createEdgeHandler = async (ctx, definition) => {
  await (definition.runtime === "edge" ? copyHandlerDependenciesForEdgeMiddleware(ctx, definition.functionDefinition) : copyHandlerDependenciesForNodeMiddleware(ctx));
  await writeHandlerFile(ctx, definition);
};
var getHandlerName = ({ name }) => `${EDGE_HANDLER_NAME}-${name.replace(/\W/g, "-")}`;
var buildHandlerDefinition = (ctx, def) => {
  return augmentMatchers(def.matchers, ctx).map((matcher) => ({
    function: getHandlerName({ name: def.name }),
    name: "Next.js Middleware Handler",
    pattern: matcher.regexp,
    generator: `${ctx.pluginName}@${ctx.pluginVersion}`
  }));
};
var clearStaleEdgeHandlers = async (ctx) => {
  await rm(ctx.edgeFunctionsDir, { recursive: true, force: true });
};
var createEdgeHandlers = async (ctx) => {
  const nextManifest = await ctx.getMiddlewareManifest();
  const middlewareDefinitions = [
    ...Object.values(nextManifest.middleware)
  ].map((edgeDefinition) => {
    return {
      runtime: "edge",
      functionDefinition: edgeDefinition,
      name: edgeDefinition.name,
      matchers: fixEdgeRuntimeTurbopackMatcherJsonPart(edgeDefinition.matchers)
    };
  });
  const functionsConfigManifest = await ctx.getFunctionsConfigManifest();
  if (functionsConfigManifest?.functions?.["/_middleware"] && nodeMiddlewareDefinitionHasMatcher(functionsConfigManifest?.functions?.["/_middleware"])) {
    middlewareDefinitions.push({
      runtime: "nodejs",
      functionDefinition: functionsConfigManifest?.functions?.["/_middleware"],
      name: NODE_MIDDLEWARE_NAME,
      matchers: functionsConfigManifest?.functions?.["/_middleware"]?.matchers
    });
  }
  await Promise.all(middlewareDefinitions.map((def) => createEdgeHandler(ctx, def)));
  const netlifyDefinitions = middlewareDefinitions.flatMap(
    (def) => buildHandlerDefinition(ctx, def)
  );
  const netlifyManifest = {
    version: 1,
    functions: netlifyDefinitions
  };
  await writeEdgeManifest(ctx, netlifyManifest);
};
export {
  clearStaleEdgeHandlers,
  createEdgeHandlers
};
