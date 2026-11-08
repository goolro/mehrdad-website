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

// src/run/storage/storage.cts
var storage_exports = {};
__export(storage_exports, {
  getMemoizedKeyValueStoreBackedByRegionalBlobStore: () => getMemoizedKeyValueStoreBackedByRegionalBlobStore,
  setFetchBeforeNextPatchedIt: () => import_regional_blob_store2.setFetchBeforeNextPatchedIt,
  setInMemoryCacheMaxSizeFromNextConfig: () => import_request_scoped_in_memory_cache2.setInMemoryCacheMaxSizeFromNextConfig
});
module.exports = __toCommonJS(storage_exports);
var import_tracer = require("../handlers/tracer.cjs");
var import_regional_blob_store = require("./regional-blob-store.cjs");
var import_request_scoped_in_memory_cache = require("./request-scoped-in-memory-cache.cjs");
var import_request_scoped_in_memory_cache2 = require("./request-scoped-in-memory-cache.cjs");
var import_regional_blob_store2 = require("./regional-blob-store.cjs");
var encodeBlobKey = async (key) => {
  const { encodeBlobKey: encodeBlobKeyImpl } = await import("../../shared/blobkey.js");
  return await encodeBlobKeyImpl(key);
};
var getMemoizedKeyValueStoreBackedByRegionalBlobStore = (...args) => {
  const store = (0, import_regional_blob_store.getRegionalBlobStore)(...args);
  const tracer = (0, import_tracer.getTracer)();
  return {
    async get(key, otelSpanTitle) {
      const inMemoryCache = (0, import_request_scoped_in_memory_cache.getRequestScopedInMemoryCache)();
      const memoizedValue = inMemoryCache.get(key);
      if (memoizedValue?.conditional === false && typeof memoizedValue?.currentRequestValue !== "undefined") {
        return memoizedValue.currentRequestValue;
      }
      const getPromise = (0, import_tracer.withActiveSpan)(tracer, otelSpanTitle, async (span) => {
        const blobKey = await encodeBlobKey(key);
        const { etag: previousEtag, globalValue: previousBlob } = memoizedValue?.conditional ? memoizedValue : {};
        span?.setAttributes({ key });
        const result = await store.getWithMetadata(blobKey, {
          type: "json",
          etag: previousEtag,
          span
        });
        const shouldReuseMemoizedBlob = result?.etag && previousEtag === result?.etag;
        const blob = shouldReuseMemoizedBlob ? previousBlob : result?.data;
        if (result?.etag && blob) {
          inMemoryCache.set(key, {
            data: blob,
            etag: result?.etag
          });
        } else {
          inMemoryCache.set(key, blob);
        }
        return blob;
      });
      inMemoryCache.set(key, getPromise);
      return getPromise;
    },
    async set(key, value, otelSpanTitle) {
      const inMemoryCache = (0, import_request_scoped_in_memory_cache.getRequestScopedInMemoryCache)();
      inMemoryCache.set(key, value);
      const blobKey = await encodeBlobKey(key);
      return (0, import_tracer.withActiveSpan)(tracer, otelSpanTitle, async (span) => {
        span?.setAttributes({ key });
        const writeResult = await store.setJSON(blobKey, value, { span });
        if (writeResult?.etag) {
          inMemoryCache.set(key, {
            data: value,
            etag: writeResult.etag
          });
        }
        return writeResult;
      });
    }
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getMemoizedKeyValueStoreBackedByRegionalBlobStore,
  setFetchBeforeNextPatchedIt,
  setInMemoryCacheMaxSizeFromNextConfig
});
