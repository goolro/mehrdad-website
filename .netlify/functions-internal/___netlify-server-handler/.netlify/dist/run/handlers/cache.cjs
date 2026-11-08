"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/run/handlers/cache.cts
var cache_exports = {};
__export(cache_exports, {
  NetlifyCacheHandler: () => NetlifyCacheHandler,
  default: () => cache_default
});
module.exports = __toCommonJS(cache_exports);
var import_node_buffer = require("node:buffer");
var import_node_path = require("node:path");
var import_posix = require("node:path/posix");
var import_constants = require("next/dist/lib/constants.js");
var import_cache_types = require("../../shared/cache-types.cjs");
var import_route_cache_key = require("../../shared/route-cache-key.cjs");
var import_storage = require("../storage/storage.cjs");
var import_request_context = require("./request-context.cjs");
var import_tags_handler = require("./tags-handler.cjs");
var import_tracer = require("./tracer.cjs");
var memoizedPrerenderManifest;
var getPagesRouterImplicitTag = (key) => {
  const pathname = (0, import_route_cache_key.routeCacheKeyToPathname)(key);
  return (0, import_tags_handler.toCdnCacheTag)(`_N_T_${pathname === "/index" ? "/" : pathname}`);
};
var NetlifyCacheHandler = class {
  options;
  revalidatedTags;
  cacheStore;
  tracer = (0, import_tracer.getTracer)();
  constructor(options) {
    this.options = options;
    this.revalidatedTags = options.revalidatedTags;
    this.cacheStore = (0, import_storage.getMemoizedKeyValueStoreBackedByRegionalBlobStore)({ consistency: "strong" });
  }
  getTTL(blob) {
    if (blob.value?.kind === "FETCH" || blob.value?.kind === "ROUTE" || blob.value?.kind === "APP_ROUTE" || blob.value?.kind === "PAGE" || blob.value?.kind === "PAGES" || blob.value?.kind === "APP_PAGE") {
      const { revalidate } = blob.value;
      if (typeof revalidate === "number") {
        const revalidateAfter = revalidate * 1e3 + blob.lastModified;
        return (revalidateAfter - Date.now()) / 1e3;
      }
      if (revalidate === false) {
        return "PERMANENT";
      }
    }
    return "NOT SET";
  }
  captureResponseCacheLastModified(cacheValue, key, getCacheKeySpan) {
    if (cacheValue.value?.kind === "FETCH") {
      return;
    }
    const requestContext = (0, import_request_context.getRequestContext)();
    if (!requestContext) {
      (0, import_tracer.recordWarning)(new Error("CacheHandler was called without a request context"), getCacheKeySpan);
      return;
    }
    if (requestContext.responseCacheKey && requestContext.responseCacheKey !== key) {
      requestContext.responseCacheGetLastModified = void 0;
      (0, import_tracer.recordWarning)(
        new Error(
          `Multiple response cache keys used in single request: ["${requestContext.responseCacheKey}, "${key}"]`
        ),
        getCacheKeySpan
      );
      return;
    }
    requestContext.responseCacheKey = key;
    if (cacheValue.lastModified) {
      requestContext.responseCacheGetLastModified = cacheValue.lastModified;
    }
  }
  captureRouteRevalidateAndRemoveFromObject(cacheValue) {
    const { revalidate, ...restOfRouteValue } = cacheValue;
    const requestContext = (0, import_request_context.getRequestContext)();
    if (requestContext) {
      requestContext.routeHandlerRevalidate = revalidate;
    }
    return restOfRouteValue;
  }
  captureCacheTags(cacheValue, key) {
    const requestContext = (0, import_request_context.getRequestContext)();
    if (!requestContext) {
      return;
    }
    if (requestContext.responseCacheTags) {
      return;
    }
    if (!cacheValue) {
      const cacheTags = [getPagesRouterImplicitTag(key)];
      requestContext.responseCacheTags = cacheTags;
      return;
    }
    if (cacheValue.kind === "PAGE" || cacheValue.kind === "PAGES" || cacheValue.kind === "REDIRECT" || cacheValue.kind === "APP_PAGE" || cacheValue.kind === "ROUTE" || cacheValue.kind === "APP_ROUTE") {
      if (cacheValue.kind !== "REDIRECT" && cacheValue.headers?.[import_constants.NEXT_CACHE_TAGS_HEADER]) {
        const cacheTags = cacheValue.headers[import_constants.NEXT_CACHE_TAGS_HEADER].split(/,|%2c/gi).map(import_tags_handler.toCdnCacheTag);
        requestContext.responseCacheTags = cacheTags;
      } else if ((cacheValue.kind === "PAGE" || cacheValue.kind === "PAGES") && typeof cacheValue.pageData === "object" || cacheValue.kind === "REDIRECT" && typeof cacheValue.props === "object") {
        const cacheTags = [getPagesRouterImplicitTag(key)];
        requestContext.responseCacheTags = cacheTags;
      }
    }
  }
  async getPrerenderManifest(serverDistDir) {
    if (memoizedPrerenderManifest) {
      return memoizedPrerenderManifest;
    }
    const prerenderManifestPath = (0, import_node_path.join)(serverDistDir, "..", "prerender-manifest.json");
    try {
      const { loadManifest } = await import("next/dist/server/load-manifest.external.js");
      memoizedPrerenderManifest = loadManifest(prerenderManifestPath);
    } catch {
      const { loadManifest } = await import("next/dist/server/load-manifest.js");
      memoizedPrerenderManifest = loadManifest(prerenderManifestPath);
    }
    return memoizedPrerenderManifest;
  }
  async injectEntryToPrerenderManifest(key, { revalidate, cacheControl }) {
    if (this.options.serverDistDir && (typeof revalidate === "number" || revalidate === false || typeof cacheControl !== "undefined")) {
      try {
        const prerenderManifest = await this.getPrerenderManifest(this.options.serverDistDir);
        if (typeof cacheControl !== "undefined") {
          try {
            const { SharedCacheControls } = await import(
              // @ts-expect-error supporting multiple next version, this module is not resolvable with currently used dev dependency
              // eslint-disable-next-line import/no-unresolved, n/no-missing-import
              "next/dist/server/lib/incremental-cache/shared-cache-controls.external.js"
            );
            const sharedCacheControls = new SharedCacheControls(prerenderManifest);
            sharedCacheControls.set(key, cacheControl);
          } catch {
            const { SharedCacheControls } = await import(
              // @ts-expect-error supporting multiple next version, this module is not resolvable with currently used dev dependency
              // eslint-disable-next-line import/no-unresolved, n/no-missing-import
              "next/dist/server/lib/incremental-cache/shared-cache-controls.js"
            );
            const sharedCacheControls = new SharedCacheControls(prerenderManifest);
            sharedCacheControls.set(key, cacheControl);
          }
        } else if (typeof revalidate === "number" || revalidate === false) {
          try {
            const { normalizePagePath } = await import("next/dist/shared/lib/page-path/normalize-page-path.js");
            prerenderManifest.routes[key] = {
              experimentalPPR: void 0,
              dataRoute: (0, import_posix.join)("/_next/data", `${normalizePagePath(key)}.json`),
              srcRoute: null,
              // FIXME: provide actual source route, however, when dynamically appending it doesn't really matter
              initialRevalidateSeconds: revalidate,
              // Pages routes do not have a prefetch data route.
              prefetchDataRoute: void 0
            };
          } catch {
            const { SharedRevalidateTimings } = await import("next/dist/server/lib/incremental-cache/shared-revalidate-timings.js");
            const sharedRevalidateTimings = new SharedRevalidateTimings(prerenderManifest);
            sharedRevalidateTimings.set(key, revalidate);
          }
        }
      } catch {
      }
    }
  }
  async get(...args) {
    return (0, import_tracer.withActiveSpan)(this.tracer, "get cache key", async (span) => {
      const [key, context = {}] = args;
      (0, import_request_context.getLogger)().debug(`[NetlifyCacheHandler.get]: ${key}`);
      span?.setAttributes({ key });
      const { kind, kindHint } = context;
      if (kind !== "PAGES" && kindHint !== "pages") {
        (0, import_tags_handler.prefetchTagRevalidationMarker)();
      }
      const blob = await this.cacheStore.get(key, "blobStore.get");
      if (!blob) {
        span?.addEvent("Cache miss", { key });
        return null;
      }
      const ttl = this.getTTL(blob);
      if ((0, import_request_context.getRequestContext)()?.isBackgroundRevalidation && typeof ttl === "number" && ttl < 0) {
        span?.addEvent("Discarding stale entry due to SWR background revalidation request", {
          key,
          ttl
        });
        (0, import_request_context.getLogger)().withFields({
          ttl,
          key
        }).debug(
          `[NetlifyCacheHandler.get] Discarding stale entry due to SWR background revalidation request: ${key}`
        );
        return null;
      }
      const { stale: staleByTags, expired: expiredByTags } = await this.checkCacheEntryStaleByTags(
        blob,
        context.tags,
        context.softTags
      );
      if (expiredByTags) {
        span?.addEvent("Expired", { expiredByTags, key, ttl });
        return null;
      }
      if ((0, import_request_context.getRequestContext)()?.isBackgroundRevalidation && staleByTags) {
        span?.addEvent("Discarding tag-stale entry due to SWR background revalidation request", {
          key,
          ttl
        });
        (0, import_request_context.getLogger)().withFields({
          ttl,
          key
        }).debug(
          `[NetlifyCacheHandler.get] Discarding tag-stale entry due to SWR background revalidation request: ${key}`
        );
        return null;
      }
      this.captureResponseCacheLastModified(blob, key, span);
      if (staleByTags) {
        span?.addEvent("Stale", { staleByTags, key, ttl });
        this.markCacheEntryStaleByTags(blob);
      }
      const isDataRequest = Boolean(context.fetchUrl);
      if (!isDataRequest) {
        this.captureCacheTags(blob.value, key);
      }
      switch (blob.value?.kind) {
        case "FETCH":
          span?.addEvent("FETCH", {
            lastModified: blob.lastModified,
            revalidate: context.revalidate,
            ttl
          });
          return {
            lastModified: blob.lastModified,
            value: blob.value
          };
        case "ROUTE":
        case "APP_ROUTE": {
          span?.addEvent(blob.value?.kind, {
            lastModified: blob.lastModified,
            status: blob.value.status,
            revalidate: blob.value.revalidate,
            ttl
          });
          const valueWithoutRevalidate = this.captureRouteRevalidateAndRemoveFromObject(blob.value);
          return {
            lastModified: blob.lastModified,
            value: {
              ...valueWithoutRevalidate,
              body: import_node_buffer.Buffer.from(valueWithoutRevalidate.body, "base64")
            }
          };
        }
        case "PAGE":
        case "PAGES": {
          const { revalidate, ...restOfPageValue } = blob.value;
          const requestContext = (0, import_request_context.getRequestContext)();
          if (requestContext) {
            requestContext.pageHandlerRevalidate = revalidate;
          }
          span?.addEvent(blob.value?.kind, { lastModified: blob.lastModified, revalidate, ttl });
          await this.injectEntryToPrerenderManifest(key, blob.value);
          return {
            lastModified: blob.lastModified,
            value: restOfPageValue
          };
        }
        case "APP_PAGE": {
          const requestContext = (0, import_request_context.getRequestContext)();
          if (requestContext && blob.value?.kind === "APP_PAGE") {
            requestContext.isCacheableAppPage = true;
          }
          const { revalidate, rscData, segmentData, ...restOfPageValue } = blob.value;
          span?.addEvent(blob.value?.kind, { lastModified: blob.lastModified, revalidate, ttl });
          await this.injectEntryToPrerenderManifest(key, blob.value);
          return {
            lastModified: blob.lastModified,
            value: {
              ...restOfPageValue,
              rscData: rscData ? import_node_buffer.Buffer.from(rscData, "base64") : void 0,
              segmentData: segmentData ? new Map(
                Object.entries(segmentData).map(([segmentPath, base64EncodedSegment]) => [
                  segmentPath,
                  import_node_buffer.Buffer.from(base64EncodedSegment, "base64")
                ])
              ) : void 0
            }
          };
        }
        case "REDIRECT": {
          await this.injectEntryToPrerenderManifest(key, blob.value);
          return {
            lastModified: blob.lastModified,
            value: blob.value
          };
        }
        default:
          span?.recordException(new Error(`Unknown cache entry kind: ${blob.value?.kind}`));
      }
      return null;
    });
  }
  transformToStorableObject(data, context) {
    if (!data) {
      return null;
    }
    if ((0, import_cache_types.isCachedRouteValue)(data)) {
      return {
        ...data,
        revalidate: context.revalidate ?? context.cacheControl?.revalidate,
        cacheControl: context.cacheControl,
        body: data.body.toString("base64")
      };
    }
    if ((0, import_cache_types.isCachedPageValue)(data) || data?.kind === "REDIRECT") {
      return {
        ...data,
        revalidate: context.revalidate ?? context.cacheControl?.revalidate,
        cacheControl: context.cacheControl
      };
    }
    if (data?.kind === "APP_PAGE") {
      return {
        ...data,
        revalidate: context.revalidate ?? context.cacheControl?.revalidate,
        cacheControl: context.cacheControl,
        rscData: data.rscData?.toString("base64"),
        segmentData: data.segmentData ? Object.fromEntries(
          [...data.segmentData.entries()].map(([segmentPath, base64EncodedSegment]) => [
            segmentPath,
            base64EncodedSegment.toString("base64")
          ])
        ) : void 0
      };
    }
    return data;
  }
  async set(...args) {
    return (0, import_tracer.withActiveSpan)(this.tracer, "set cache key", async (span) => {
      const [key, data, context] = args;
      const lastModified = Date.now();
      span?.setAttributes({ key, lastModified });
      (0, import_request_context.getLogger)().debug(`[NetlifyCacheHandler.set]: ${key}`);
      const value = this.transformToStorableObject(data, context);
      const isDataReq = Boolean(context.fetchUrl);
      if (!isDataReq) {
        this.captureCacheTags(value, key);
      }
      await this.cacheStore.set(key, { lastModified, value }, "blobStore.set");
      if (data?.kind === "APP_PAGE") {
        const requestContext = (0, import_request_context.getRequestContext)();
        if (requestContext) {
          requestContext.isCacheableAppPage = true;
        }
      }
      if (!data && !isDataReq || data?.kind === "PAGE" || data?.kind === "PAGES" || data?.kind === "REDIRECT") {
        const requestContext = (0, import_request_context.getRequestContext)();
        if (requestContext?.didPagesRouterOnDemandRevalidate) {
          const tag = getPagesRouterImplicitTag(key);
          requestContext?.trackBackgroundWork((0, import_tags_handler.purgeEdgeCache)(tag));
        }
      }
    });
  }
  async revalidateTag(tagOrTags, durations) {
    return (0, import_tags_handler.markTagsAsStaleAndPurgeEdgeCache)(tagOrTags, durations);
  }
  resetRequestCache() {
  }
  /**
   * Mutates a cache entry that was found to be stale (but not yet expired) through
   * on-demand revalidated tags so that Next.js serves it stale while triggering a
   * background revalidation.
   *
   * We can NOT signal staleness with `lastModified = -1` for full-route cache
   * entries anymore: since Next.js 16 that sentinel means "entry is past its
   * `expire` → do a blocking re-render" rather than "serve stale". See the
   * `incremental-cache` `get`: `lastModified === -1` ⇒ `isStale = -1`, and the
   * response-cache treats `isStale === -1` as "skip the early stale resolve and
   * block on a fresh render".
   *
   * Instead we drive Next.js' native staleness math, which both old and new
   * Next.js resolve to `isStale === true` (serve stale + background revalidation):
   *  - `revalidate: 1` + a `lastModified` 2s in the past ⇒ `revalidateAfter = now - 1000 < now` ⇒ stale
   *  - `expire: undefined`                               ⇒ `expireAfter` undefined ⇒ never the `-1` block path
   *
   * `revalidate` must be `>= 1` (Next.js 16 rejects `revalidate: 0` with "Invalid
   * revalidate configuration provided: 0 < 1") and is needed because force-static
   * entries have `revalidate: false`, which would otherwise resolve as fresh.
   *
   * Actual expiry is still enforced by `checkCacheEntryStaleByTags`: once the tag's
   * `expireAt` is reached it reports the entry as expired and `get` returns `null`
   * (cache miss → blocking re-render), so we don't need to encode `expire` here.
   */
  markCacheEntryStaleByTags(blob) {
    if (!blob.value) {
      return;
    }
    if (blob.value.kind === "ROUTE" || blob.value.kind === "APP_ROUTE" || blob.value.kind === "PAGE" || blob.value.kind === "PAGES" || blob.value.kind === "APP_PAGE" || blob.value.kind === "REDIRECT") {
      blob.lastModified = Date.now() - 2 * 1e3;
      blob.value.cacheControl = { revalidate: 1, expire: void 0 };
      blob.value.revalidate = 1;
      return;
    }
    blob.lastModified = -1;
  }
  /**
   * Checks if a cache entry is stale through on demand revalidated tags
   */
  checkCacheEntryStaleByTags(cacheEntry, tags = [], softTags = []) {
    let cacheTags = [];
    if (cacheEntry.value?.kind === "FETCH") {
      cacheTags = [...tags, ...softTags];
    } else if (cacheEntry.value?.kind === "PAGE" || cacheEntry.value?.kind === "PAGES" || cacheEntry.value?.kind === "APP_PAGE" || cacheEntry.value?.kind === "ROUTE" || cacheEntry.value?.kind === "APP_ROUTE") {
      cacheTags = cacheEntry.value.headers?.[import_constants.NEXT_CACHE_TAGS_HEADER]?.split(/,|%2c/gi) || [];
    } else {
      return {
        stale: false,
        expired: false
      };
    }
    if (this.revalidatedTags && this.revalidatedTags.length !== 0) {
      for (const tag of this.revalidatedTags) {
        if (cacheTags.includes(tag)) {
          return {
            stale: true,
            expired: true
          };
        }
      }
    }
    return (0, import_tags_handler.isAnyTagStaleOrExpired)(cacheTags, cacheEntry.lastModified);
  }
};
var cache_default = NetlifyCacheHandler;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NetlifyCacheHandler
});
