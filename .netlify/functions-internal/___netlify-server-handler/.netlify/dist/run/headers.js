
      var require = await (async () => {
        var { createRequire } = await import("node:module");
        return createRequire(import.meta.url);
      })();
    
import "../esm-chunks/chunk-VJBIAOVP.js";

// edge-runtime/lib/private-request-meta.ts
var REQUEST_META_HEADER = "x-next-request-meta";

// src/run/headers.ts
import { recordWarning } from "./handlers/tracer.cjs";
import { getMemoizedKeyValueStoreBackedByRegionalBlobStore } from "./storage/storage.cjs";
var getRequestMeta = (request) => {
  const header = request.headers.get(REQUEST_META_HEADER);
  const requestID = request.headers.get("x-nf-request-id");
  if (!header || !requestID) {
    return;
  }
  try {
    const meta = JSON.parse(header);
    return meta?.requestID === requestID ? meta : void 0;
  } catch {
  }
};
var getRewritePublicUrl = (request) => {
  const publicUrlHeader = getRequestMeta(request)?.publicUrl;
  if (!publicUrlHeader) {
    return;
  }
  try {
    const publicUrl = new URL(publicUrlHeader, request.url);
    const url = new URL(request.url);
    url.pathname = publicUrl.pathname;
    const search = new URLSearchParams(publicUrl.search);
    for (const [key, value] of new URL(request.url).searchParams) {
      if (!search.has(key)) {
        search.append(key, value);
      }
    }
    url.search = search.toString();
    return url;
  } catch {
  }
};
var ALL_VARIATIONS = /* @__PURE__ */ Symbol.for("ALL_VARIATIONS");
var NetlifyVaryKeys = /* @__PURE__ */ new Set(["header", "language", "cookie", "query", "country"]);
var isNetlifyVaryKey = (key) => NetlifyVaryKeys.has(key);
var generateNetlifyVaryValues = ({
  header,
  language,
  cookie,
  query,
  country
}) => {
  const values = [];
  if (query.length !== 0) {
    if (query.includes(ALL_VARIATIONS)) {
      values.push(`query`);
    } else {
      values.push(`query=${query.join(`|`)}`);
    }
  }
  if (header.length !== 0) {
    const uniqueHeaderNames = [
      ...new Set(
        header.map(
          (headerName) => (
            // header names are case insensitive
            headerName.toLowerCase()
          )
        )
      )
    ];
    values.push(`header=${uniqueHeaderNames.join(`|`)}`);
  }
  if (language.length !== 0) {
    values.push(`language=${language.join(`|`)}`);
  }
  if (cookie.length !== 0) {
    values.push(`cookie=${cookie.join(`|`)}`);
  }
  if (country.length !== 0) {
    values.push(`country=${country.join(`|`)}`);
  }
  return values.join(",");
};
var getHeaderValueArray = (header) => {
  return header.split(",").map((value) => value.trim()).filter(Boolean);
};
var omitHeaderValues = (header, values) => {
  const headerValues = getHeaderValueArray(header);
  const filteredValues = headerValues.filter(
    (value) => !values.some((val) => value.startsWith(val))
  );
  return filteredValues.join(", ");
};
var setVaryHeaders = (headers, request, { basePath, i18n }) => {
  const netlifyVaryValues = {
    header: [
      "x-nextjs-data",
      "x-next-debug-logging",
      // using _rsc query param might not be enough because it is stripped for middleware redirect and rewrites
      // so adding all request headers that are used to produce the _rsc query param
      // https://github.com/vercel/next.js/blob/e5fe535ed17cee5e1d5576ccc33e4c49b5da1273/packages/next/src/client/components/router-reducer/set-cache-busting-search-param.ts#L32-L39
      "Next-Router-Prefetch",
      "Next-Router-Segment-Prefetch",
      "Next-Router-State-Tree",
      "Next-Url",
      // and exact header that actually instruct Next.js to produce RSC response
      "RSC"
    ],
    language: [],
    cookie: ["__prerender_bypass", "__next_preview_data"],
    query: ["__nextDataReq", "_rsc"],
    country: []
  };
  const vary = headers.get("vary");
  if (vary !== null) {
    netlifyVaryValues.header.push(...getHeaderValueArray(vary));
  }
  const path = new URL(request.url).pathname;
  const locales = i18n && i18n.localeDetection !== false ? i18n.locales : [];
  if (locales.length > 1 && (path === "/" || path === basePath)) {
    netlifyVaryValues.language.push(...locales);
    netlifyVaryValues.cookie.push(`NEXT_LOCALE`);
  }
  const userNetlifyVary = headers.get("netlify-vary");
  if (userNetlifyVary) {
    const directives = getHeaderValueArray(userNetlifyVary);
    for (const directive of directives) {
      const [key, value] = directive.split("=");
      if (key === "query" && !value) {
        netlifyVaryValues.query.push(ALL_VARIATIONS);
      } else if (value && isNetlifyVaryKey(key)) {
        netlifyVaryValues[key].push(...value.split("|"));
      }
    }
  }
  headers.set(`netlify-vary`, generateNetlifyVaryValues(netlifyVaryValues));
};
var adjustDateHeader = async ({
  headers,
  request,
  span,
  requestContext
}) => {
  const key = new URL(request.url).pathname;
  let lastModified;
  if (requestContext.responseCacheGetLastModified) {
    lastModified = requestContext.responseCacheGetLastModified;
  } else {
    recordWarning(
      new Error("lastModified not found in requestContext, falling back to trying blobs"),
      span
    );
    const cacheStore = getMemoizedKeyValueStoreBackedByRegionalBlobStore({ consistency: "strong" });
    const cacheEntry = await cacheStore.get(
      key,
      "get cache to calculate date header"
    );
    lastModified = cacheEntry?.lastModified;
  }
  if (!lastModified) {
    recordWarning(
      new Error(
        "lastModified not found in either requestContext or blobs, date header for cached response is not set"
      ),
      span
    );
    return;
  }
  const lastModifiedDate = new Date(lastModified);
  headers.set("x-nextjs-date", headers.get("date") ?? lastModifiedDate.toUTCString());
  headers.set("date", lastModifiedDate.toUTCString());
};
function setCacheControlFromRequestContext(headers, revalidate) {
  const cdnCacheControl = (
    // if we are serving already stale response, instruct edge to not attempt to cache that response
    headers.get("x-nextjs-cache") === "STALE" ? "public, max-age=0, must-revalidate, durable" : `s-maxage=${revalidate || 31536e3}, stale-while-revalidate=31536000, durable`
  );
  headers.set("netlify-cdn-cache-control", cdnCacheControl);
}
var setCacheControlHeaders = ({ headers, status }, request, requestContext) => {
  if (typeof requestContext.routeHandlerRevalidate !== "undefined" && ["GET", "HEAD"].includes(request.method) && (headers.has("x-nextjs-cache") || !headers.has("cdn-cache-control") && !headers.has("netlify-cdn-cache-control"))) {
    setCacheControlFromRequestContext(headers, requestContext.routeHandlerRevalidate);
    return;
  }
  if (status === 404) {
    if (request.url.endsWith(".php")) {
      headers.set("cache-control", "public, max-age=0, must-revalidate");
      headers.set("netlify-cdn-cache-control", `max-age=31536000, durable`);
      return;
    }
    if (process.env.CACHE_404_PAGE && request.url.endsWith("/404") && ["GET", "HEAD"].includes(request.method)) {
      setCacheControlFromRequestContext(headers, requestContext.pageHandlerRevalidate);
      return;
    }
  }
  const cacheControl = headers.get("cache-control");
  if (cacheControl !== null && ["GET", "HEAD"].includes(request.method) && (headers.has("x-nextjs-cache") || !headers.has("cdn-cache-control") && !headers.has("netlify-cdn-cache-control"))) {
    const browserCacheControl = omitHeaderValues(cacheControl, [
      "s-maxage",
      "stale-while-revalidate"
    ]);
    const cacheControlForCdnFromNext = headers.get("cdn-cache-control") ?? cacheControl;
    const cdnCacheControl = (
      // if we are serving already stale response, instruct edge to not attempt to cache that response
      headers.get("x-nextjs-cache") === "STALE" ? "public, max-age=0, must-revalidate, durable" : [
        ...getHeaderValueArray(cacheControlForCdnFromNext).map(
          (value) => value === "stale-while-revalidate" ? "stale-while-revalidate=31536000" : value
        ),
        "durable"
      ].join(", ")
    );
    headers.set("cache-control", browserCacheControl || "public, max-age=0, must-revalidate");
    headers.delete("cdn-cache-control");
    headers.set("netlify-cdn-cache-control", cdnCacheControl);
    return;
  }
  if (cacheControl === null && ["GET", "HEAD"].includes(request.method) && !headers.has("cdn-cache-control") && !headers.has("netlify-cdn-cache-control") && requestContext.usedFsReadForNonFallback && !requestContext.didPagesRouterOnDemandRevalidate) {
    headers.set("cache-control", "public, max-age=0, must-revalidate");
    headers.set("netlify-cdn-cache-control", `max-age=31536000, durable`);
  }
};
var setCacheTagsHeaders = (headers, requestContext) => {
  if (!headers.has("cache-control") && !headers.has("netlify-cdn-cache-control")) {
    return;
  }
  if (requestContext.responseCacheTags) {
    headers.set("netlify-cache-tag", requestContext.responseCacheTags.join(","));
  }
};
var NEXT_CACHE_TO_CACHE_STATUS = {
  HIT: `hit`,
  MISS: `fwd=miss`,
  STALE: `hit; fwd=stale`
};
var setCacheStatusHeader = (headers, nextCache) => {
  if (typeof nextCache === "string") {
    if (nextCache in NEXT_CACHE_TO_CACHE_STATUS) {
      const cacheStatus = NEXT_CACHE_TO_CACHE_STATUS[nextCache];
      headers.set("cache-status", `"Next.js"; ${cacheStatus}`);
    }
    headers.delete("x-nextjs-cache");
  }
};
export {
  adjustDateHeader,
  getRewritePublicUrl,
  setCacheControlHeaders,
  setCacheStatusHeader,
  setCacheTagsHeaders,
  setVaryHeaders
};
