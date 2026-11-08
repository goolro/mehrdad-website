
      var require = await (async () => {
        var { createRequire } = await import("node:module");
        return createRequire(import.meta.url);
      })();
    
import {
  trace,
  wrapTracer
} from "./esm-chunks/chunk-QCOH52QC.js";
import "./esm-chunks/chunk-VJBIAOVP.js";

// src/index.ts
import { rm } from "fs/promises";
import { restoreBuildCache, saveBuildCache } from "./build/cache.js";
import { copyPrerenderedContent } from "./build/content/prerendered.js";
import {
  copyStaticAssets,
  copyStaticContent,
  copyStaticExport,
  publishStaticDir,
  setHeadersConfig,
  unpublishStaticDir
} from "./build/content/static.js";
import { clearStaleEdgeHandlers, createEdgeHandlers } from "./build/functions/edge.js";
import { clearStaleServerHandlers, createServerHandler } from "./build/functions/server.js";
import { setImageConfig } from "./build/image-cdn.js";
import { PluginContext } from "./build/plugin-context.js";
import { setSkewProtection } from "./build/skew-protection.js";
import {
  verifyAdvancedAPIRoutes,
  verifyNetlifyFormsWorkaround,
  verifyPublishDir
} from "./build/verification.js";
var skipPlugin = process.env.NETLIFY_NEXT_PLUGIN_SKIP === "true" || process.env.NETLIFY_NEXT_PLUGIN_SKIP === "1";
var skipText = "Skipping Next.js plugin due to NETLIFY_NEXT_PLUGIN_SKIP environment variable.";
var tracer = wrapTracer(trace.getTracer("Next.js runtime"));
var onPreDev = async (options) => {
  if (skipPlugin) {
    console.warn(skipText);
    return;
  }
  await tracer.withActiveSpan("onPreDev", async () => {
    const context = new PluginContext(options);
    await rm(context.blobDir, { recursive: true, force: true });
  });
};
var onPreBuild = async (options) => {
  if (skipPlugin) {
    console.warn(skipText);
    return;
  }
  await tracer.withActiveSpan("onPreBuild", async (span) => {
    process.env.NEXT_PRIVATE_STANDALONE = "true";
    const ctx = new PluginContext(options);
    if (options.constants.IS_LOCAL) {
      await clearStaleServerHandlers(ctx);
      await clearStaleEdgeHandlers(ctx);
    } else {
      await restoreBuildCache(ctx);
    }
    await setSkewProtection(ctx, span);
  });
};
var onBuild = async (options) => {
  if (skipPlugin) {
    console.warn(skipText);
    return;
  }
  await tracer.withActiveSpan("onBuild", async (span) => {
    const ctx = new PluginContext(options);
    verifyPublishDir(ctx);
    span.setAttribute("next.buildConfig", JSON.stringify(ctx.buildConfig));
    if (!options.constants.IS_LOCAL) {
      await saveBuildCache(ctx);
    }
    if (ctx.buildConfig.output === "export") {
      return Promise.all([copyStaticExport(ctx), setHeadersConfig(ctx), setImageConfig(ctx)]);
    }
    await verifyAdvancedAPIRoutes(ctx);
    await verifyNetlifyFormsWorkaround(ctx);
    await Promise.all([
      copyStaticAssets(ctx),
      copyStaticContent(ctx),
      copyPrerenderedContent(ctx),
      createServerHandler(ctx),
      createEdgeHandlers(ctx),
      setHeadersConfig(ctx),
      setImageConfig(ctx)
    ]);
  });
};
var onPostBuild = async (options) => {
  if (skipPlugin) {
    console.warn(skipText);
    return;
  }
  await tracer.withActiveSpan("onPostBuild", async () => {
    await publishStaticDir(new PluginContext(options));
  });
};
var onSuccess = async () => {
  if (skipPlugin) {
    console.warn(skipText);
    return;
  }
  await tracer.withActiveSpan("onSuccess", async () => {
    const prewarm = [process.env.DEPLOY_URL, process.env.DEPLOY_PRIME_URL, process.env.URL].filter(
      // If running locally then the deploy ID is a placeholder value. Filtering for `https://0--` removes it.
      (url) => Boolean(url && !url.startsWith("https://0--"))
    );
    await Promise.allSettled(prewarm.map((url) => fetch(url)));
  });
};
var onEnd = async (options) => {
  if (skipPlugin) {
    console.warn(skipText);
    return;
  }
  await tracer.withActiveSpan("onEnd", async () => {
    await unpublishStaticDir(new PluginContext(options));
  });
};
export {
  onBuild,
  onEnd,
  onPostBuild,
  onPreBuild,
  onPreDev,
  onSuccess
};
