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

// src/run/handlers/wait-until.cts
var wait_until_exports = {};
__export(wait_until_exports, {
  setupWaitUntil: () => setupWaitUntil
});
module.exports = __toCommonJS(wait_until_exports);
var import_request_context = require("./request-context.cjs");
var NEXT_REQUEST_CONTEXT_SYMBOL = /* @__PURE__ */ Symbol.for("@next/request-context");
function setupWaitUntil() {
  ;
  globalThis[NEXT_REQUEST_CONTEXT_SYMBOL] = {
    get() {
      return { waitUntil: (0, import_request_context.getRequestContext)()?.trackBackgroundWork };
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  setupWaitUntil
});
