
      var require = await (async () => {
        var { createRequire } = await import("node:module");
        return createRequire(import.meta.url);
      })();
    
import "../esm-chunks/chunk-VJBIAOVP.js";

// src/run/augment-next-response.ts
import { isPromise } from "node:util/types";
function isRevalidateMethod(key, nextResponseField) {
  return key === "revalidate" && typeof nextResponseField === "function";
}
function isAppendHeaderMethod(key, nextResponseField) {
  return key === "appendHeader" && typeof nextResponseField === "function";
}
var augmentNextResponse = (response, requestContext) => {
  return new Proxy(response, {
    get(target, key) {
      const originalValue = Reflect.get(target, key);
      if (isRevalidateMethod(key, originalValue)) {
        return function newRevalidate(...args) {
          requestContext.didPagesRouterOnDemandRevalidate = true;
          const result = originalValue.apply(target, args);
          if (result && isPromise(result)) {
            requestContext.trackBackgroundWork(result);
          }
          return result;
        };
      }
      if (isAppendHeaderMethod(key, originalValue)) {
        return function patchedAppendHeader(...args) {
          if (typeof args[0] === "string" && (args[0] === "location" || args[0] === "Location")) {
            let existing = target.getHeader("location");
            if (typeof existing !== "undefined") {
              if (!Array.isArray(existing)) {
                existing = [String(existing)];
              }
              if (existing.includes(String(args[1]))) {
                return target;
              }
            }
          }
          return originalValue.apply(target, args);
        };
      }
      return originalValue;
    }
  });
};
export {
  augmentNextResponse
};
