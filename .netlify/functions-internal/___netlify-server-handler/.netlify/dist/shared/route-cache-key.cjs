"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/shared/route-cache-key.cts
var route_cache_key_exports = {};
__export(route_cache_key_exports, {
  ROUTE_CACHE_DIRECTORY: () => ROUTE_CACHE_DIRECTORY,
  ROUTE_CACHE_KEY_NEXT_VERSION_RANGE: () => ROUTE_CACHE_KEY_NEXT_VERSION_RANGE,
  getOwnerSourceRoute: () => getOwnerSourceRoute,
  getRouteCacheKey: () => getRouteCacheKey,
  isRouteCacheKey: () => isRouteCacheKey,
  normalizePagePath: () => normalizePagePath,
  routeCacheKeyToPathname: () => routeCacheKeyToPathname
});
module.exports = __toCommonJS(route_cache_key_exports);
var import_node_crypto = require("node:crypto");
var ROUTE_CACHE_DIRECTORY = "route-cache";
var ROUTE_CACHE_KEY_NEXT_VERSION_RANGE = ">=15.5.27 <15.6.0-0 || >=16.3.8 <16.4.0-0 || >=16.4.0-canary.54";
var DYNAMIC_SEGMENT = /\/\[[^/]+?](?=\/|$)/;
function ensureLeadingSlash(page) {
  return page.startsWith("/") ? page : `/${page}`;
}
function normalizePagePath(page) {
  return /^\/index(\/|$)/.test(page) && !DYNAMIC_SEGMENT.test(page) ? `/index${page}` : page === "/" ? "/index" : ensureLeadingSlash(page);
}
function getOwnerSourceRoute(baseSourceRoute, kind) {
  const base = baseSourceRoute.startsWith("/") ? baseSourceRoute : `/${baseSourceRoute}`;
  const suffix = kind === "APP_PAGE" ? "page" : kind === "APP_ROUTE" ? "route" : void 0;
  if (!suffix) {
    return base;
  }
  return base === "/" ? `/${suffix}` : `${base}/${suffix}`;
}
function hashSourceRoute(sourceRoute) {
  return (0, import_node_crypto.createHash)("sha256").update(sourceRoute).digest("hex");
}
function getRouteCacheKey(pathname, owner) {
  return `/${ROUTE_CACHE_DIRECTORY}/${owner.kind}/${hashSourceRoute(owner.sourceRoute)}/$${normalizePagePath(
    pathname
  )}`;
}
function isRouteCacheKey(key) {
  return key.startsWith(`/${ROUTE_CACHE_DIRECTORY}/`);
}
function routeCacheKeyToPathname(key) {
  if (!isRouteCacheKey(key)) {
    return key;
  }
  const marker = key.indexOf("/$/");
  if (marker === -1) {
    return key;
  }
  const pathname = key.slice(marker + 2);
  return pathname === "/index" ? "/" : pathname;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ROUTE_CACHE_DIRECTORY,
  ROUTE_CACHE_KEY_NEXT_VERSION_RANGE,
  getOwnerSourceRoute,
  getRouteCacheKey,
  isRouteCacheKey,
  normalizePagePath,
  routeCacheKeyToPathname
});
