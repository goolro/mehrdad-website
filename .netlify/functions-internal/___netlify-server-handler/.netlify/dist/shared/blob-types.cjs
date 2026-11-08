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

// src/shared/blob-types.cts
var blob_types_exports = {};
__export(blob_types_exports, {
  isHtmlBlob: () => isHtmlBlob,
  isTagManifest: () => isTagManifest,
  isTagRevalidationMarker: () => isTagRevalidationMarker
});
module.exports = __toCommonJS(blob_types_exports);
var isTagManifest = (value) => {
  return typeof value === "object" && value !== null && "staleAt" in value && typeof value.staleAt === "number" && "expireAt" in value && typeof value.expireAt === "number" && Object.keys(value).length === 2;
};
var isTagRevalidationMarker = (value) => {
  return typeof value === "object" && value !== null && "revalidatedAt" in value && typeof value.revalidatedAt === "number" && Object.keys(value).length === 1;
};
var isHtmlBlob = (value) => {
  return typeof value === "object" && value !== null && "html" in value && "isFullyStaticPage" in value && typeof value.html === "string" && typeof value.isFullyStaticPage === "boolean" && Object.keys(value).length === 2;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isHtmlBlob,
  isTagManifest,
  isTagRevalidationMarker
});
