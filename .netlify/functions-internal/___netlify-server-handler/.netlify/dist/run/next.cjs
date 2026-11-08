"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
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

// node_modules/fs-monkey/lib/util/lists.js
var require_lists = __commonJS({
  "node_modules/fs-monkey/lib/util/lists.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.fsSyncMethods = exports2.fsProps = exports2.fsAsyncMethods = void 0;
    var fsProps = exports2.fsProps = ["constants", "F_OK", "R_OK", "W_OK", "X_OK", "Stats"];
    var fsSyncMethods = exports2.fsSyncMethods = ["renameSync", "ftruncateSync", "truncateSync", "chownSync", "fchownSync", "lchownSync", "chmodSync", "fchmodSync", "lchmodSync", "statSync", "lstatSync", "fstatSync", "linkSync", "symlinkSync", "readlinkSync", "realpathSync", "unlinkSync", "rmdirSync", "mkdirSync", "mkdirpSync", "readdirSync", "closeSync", "openSync", "utimesSync", "futimesSync", "fsyncSync", "writeSync", "readSync", "readFileSync", "writeFileSync", "appendFileSync", "existsSync", "accessSync", "fdatasyncSync", "mkdtempSync", "copyFileSync", "rmSync", "createReadStream", "createWriteStream"];
    var fsAsyncMethods = exports2.fsAsyncMethods = ["rename", "ftruncate", "truncate", "chown", "fchown", "lchown", "chmod", "fchmod", "lchmod", "stat", "lstat", "fstat", "link", "symlink", "readlink", "realpath", "unlink", "rmdir", "mkdir", "mkdirp", "readdir", "close", "open", "utimes", "futimes", "fsync", "write", "read", "readFile", "writeFile", "appendFile", "exists", "access", "fdatasync", "mkdtemp", "copyFile", "rm", "watchFile", "unwatchFile", "watch"];
  }
});

// node_modules/fs-monkey/lib/patchFs.js
var require_patchFs = __commonJS({
  "node_modules/fs-monkey/lib/patchFs.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = patchFs2;
    var _lists = require_lists();
    function _createForOfIteratorHelper(r, e) {
      var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
      if (!t) {
        if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) {
          t && (r = t);
          var _n = 0, F = function F2() {
          };
          return { s: F, n: function n() {
            return _n >= r.length ? { done: true } : { done: false, value: r[_n++] };
          }, e: function e2(r2) {
            throw r2;
          }, f: F };
        }
        throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
      }
      var o, a = true, u = false;
      return { s: function s() {
        t = t.call(r);
      }, n: function n() {
        var r2 = t.next();
        return a = r2.done, r2;
      }, e: function e2(r2) {
        u = true, o = r2;
      }, f: function f() {
        try {
          a || null == t["return"] || t["return"]();
        } finally {
          if (u) throw o;
        }
      } };
    }
    function _unsupportedIterableToArray(r, a) {
      if (r) {
        if ("string" == typeof r) return _arrayLikeToArray(r, a);
        var t = {}.toString.call(r).slice(8, -1);
        return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
      }
    }
    function _arrayLikeToArray(r, a) {
      (null == a || a > r.length) && (a = r.length);
      for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
      return n;
    }
    function patchFs2(vol) {
      var fs2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : require("fs");
      var bkp = {};
      var patch = function patch2(key, newValue) {
        bkp[key] = fs2[key];
        fs2[key] = newValue;
      };
      var patchMethod = function patchMethod2(key) {
        return patch(key, vol[key].bind(vol));
      };
      var _iterator = _createForOfIteratorHelper(_lists.fsProps), _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done; ) {
          var prop = _step.value;
          if (typeof vol[prop] !== "undefined") patch(prop, vol[prop]);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      if (typeof vol.StatWatcher === "function") {
        patch("StatWatcher", vol.FSWatcher.bind(null, vol));
      }
      if (typeof vol.FSWatcher === "function") {
        patch("FSWatcher", vol.StatWatcher.bind(null, vol));
      }
      if (typeof vol.ReadStream === "function") {
        patch("ReadStream", vol.ReadStream.bind(null, vol));
      }
      if (typeof vol.WriteStream === "function") {
        patch("WriteStream", vol.WriteStream.bind(null, vol));
      }
      if (typeof vol._toUnixTimestamp === "function") patchMethod("_toUnixTimestamp");
      var _iterator2 = _createForOfIteratorHelper(_lists.fsAsyncMethods), _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done; ) {
          var method = _step2.value;
          if (typeof vol[method] === "function") patchMethod(method);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      var _iterator3 = _createForOfIteratorHelper(_lists.fsSyncMethods), _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done; ) {
          var _method = _step3.value;
          if (typeof vol[_method] === "function") patchMethod(_method);
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      var promisesBackup;
      try {
        promisesBackup = fs2.promises;
        Object.defineProperty(fs2, "promises", {
          get: function get2() {
            return vol.promises;
          }
        });
      } catch (_unused) {
      }
      return function unpatch() {
        for (var key in bkp) fs2[key] = bkp[key];
        if (promisesBackup) {
          Object.defineProperty(fs2, "promises", {
            get: function get2() {
              return promisesBackup;
            }
          });
        }
      };
    }
  }
});

// node_modules/fs-monkey/lib/correctPath.js
var require_correctPath = __commonJS({
  "node_modules/fs-monkey/lib/correctPath.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.correctPath = correctPath;
    exports2.unixify = unixify;
    var isWin = process.platform === "win32";
    function removeTrailingSeparator(str) {
      var i = str.length - 1;
      if (i < 2) {
        return str;
      }
      while (isSeparator(str, i)) {
        i--;
      }
      return str.substr(0, i + 1);
    }
    function isSeparator(str, i) {
      var _char = str[i];
      return i > 0 && (_char === "/" || isWin && _char === "\\");
    }
    function normalizePath(str, stripTrailing) {
      if (typeof str !== "string") {
        throw new TypeError("expected a string");
      }
      str = str.replace(/[\\\/]+/g, "/");
      if (stripTrailing !== false) {
        str = removeTrailingSeparator(str);
      }
      return str;
    }
    function unixify(filepath) {
      var stripTrailing = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
      if (isWin) {
        filepath = normalizePath(filepath, stripTrailing);
        return filepath.replace(/^([a-zA-Z]+:|\.\/)/, "");
      }
      return filepath;
    }
    function correctPath(filepath) {
      return unixify(filepath.replace(/^\\\\\?\\.:\\/, "\\"));
    }
  }
});

// node_modules/fs-monkey/lib/patchRequire.js
var require_patchRequire = __commonJS({
  "node_modules/fs-monkey/lib/patchRequire.js"(exports2) {
    "use strict";
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = patchRequire;
    var path = _interopRequireWildcard(require("path"));
    function _interopRequireWildcard(e, t) {
      if ("function" == typeof WeakMap) var r = /* @__PURE__ */ new WeakMap(), n = /* @__PURE__ */ new WeakMap();
      return (_interopRequireWildcard = function _interopRequireWildcard2(e2, t2) {
        if (!t2 && e2 && e2.__esModule) return e2;
        var o, i, f = { __proto__: null, "default": e2 };
        if (null === e2 || "object" != _typeof(e2) && "function" != typeof e2) return f;
        if (o = t2 ? n : r) {
          if (o.has(e2)) return o.get(e2);
          o.set(e2, f);
        }
        for (var _t in e2) "default" !== _t && {}.hasOwnProperty.call(e2, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e2, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e2[_t]);
        return f;
      })(e, t);
    }
    var isWin32 = process.platform === "win32";
    var correctPath = isWin32 ? require_correctPath().correctPath : function(p) {
      return p;
    };
    function stripBOM(content) {
      if (content.charCodeAt(0) === 65279) {
        content = content.slice(1);
      }
      return content;
    }
    function patchRequire(vol) {
      var unixifyPaths = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
      var Module = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : require("module");
      if (isWin32 && unixifyPaths) {
        var original = vol;
        vol = {
          readFileSync: function readFileSync(path2, options) {
            return original.readFileSync(correctPath(path2), options);
          },
          realpathSync: function realpathSync(path2) {
            return original.realpathSync(correctPath(path2));
          },
          statSync: function statSync(path2) {
            return original.statSync(correctPath(path2));
          }
        };
      }
      function internalModuleReadFile(path2) {
        try {
          return vol.readFileSync(path2, "utf8");
        } catch (err) {
        }
      }
      function internalModuleStat(filename) {
        try {
          return vol.statSync(filename).isDirectory() ? 1 : 0;
        } catch (err) {
          return -2;
        }
      }
      function stat(filename) {
        filename = path._makeLong(filename);
        var cache = stat.cache;
        if (cache !== null) {
          var _result = cache.get(filename);
          if (_result !== void 0) return _result;
        }
        var result = internalModuleStat(filename);
        if (cache !== null) cache.set(filename, result);
        return result;
      }
      stat.cache = null;
      var preserveSymlinks = false;
      function toRealPath(requestPath) {
        return vol.realpathSync(requestPath);
      }
      var packageMainCache = /* @__PURE__ */ Object.create(null);
      function readPackage(requestPath) {
        var entry = packageMainCache[requestPath];
        if (entry) return entry;
        var jsonPath = path.resolve(requestPath, "package.json");
        var json = internalModuleReadFile(path._makeLong(jsonPath));
        if (json === void 0) {
          return false;
        }
        var pkg;
        try {
          var pkgJson = JSON.parse(json);
          pkg = packageMainCache[requestPath] = pkgJson.exports && pkgJson.exports.require || pkgJson.main;
        } catch (e) {
          e.path = jsonPath;
          e.message = "Error parsing " + jsonPath + ": " + e.message;
          throw e;
        }
        return pkg;
      }
      function tryFile(requestPath, isMain) {
        var rc = stat(requestPath);
        if (preserveSymlinks && !isMain) {
          return rc === 0 && path.resolve(requestPath);
        }
        return rc === 0 && toRealPath(requestPath);
      }
      function tryExtensions(p, exts, isMain) {
        for (var i = 0; i < exts.length; i++) {
          var filename = tryFile(p + exts[i], isMain);
          if (filename) {
            return filename;
          }
        }
        return false;
      }
      function tryPackage(requestPath, exts, isMain) {
        var pkg = readPackage(requestPath);
        if (!pkg) return false;
        var filename = path.resolve(requestPath, pkg);
        return tryFile(filename, isMain) || tryExtensions(filename, exts, isMain) || tryExtensions(path.resolve(filename, "index"), exts, isMain);
      }
      Module._extensions[".js"] = function(module3, filename) {
        var content = vol.readFileSync(filename, "utf8");
        module3._compile(stripBOM(content), filename);
      };
      Module._extensions[".json"] = function(module3, filename) {
        var content = vol.readFileSync(filename, "utf8");
        try {
          module3.exports = JSON.parse(stripBOM(content));
        } catch (err) {
          err.message = filename + ": " + err.message;
          throw err;
        }
      };
      var warned = true;
      Module._findPath = function(request, paths, isMain) {
        if (path.isAbsolute(request)) {
          paths = [""];
        } else if (!paths || paths.length === 0) {
          return false;
        }
        var cacheKey = request + "\0" + (paths.length === 1 ? paths[0] : paths.join("\0"));
        var entry = Module._pathCache[cacheKey];
        if (entry) return entry;
        var exts;
        var trailingSlash = request.length > 0 && request.charCodeAt(request.length - 1) === 47;
        for (var i = 0; i < paths.length; i++) {
          var curPath = paths[i];
          if (curPath && stat(curPath) < 1) continue;
          var basePath = correctPath(path.resolve(curPath, request));
          var filename;
          var rc = stat(basePath);
          if (!trailingSlash) {
            if (rc === 0) {
              if (preserveSymlinks && !isMain) {
                filename = path.resolve(basePath);
              } else {
                filename = toRealPath(basePath);
              }
            } else if (rc === 1) {
              if (exts === void 0) exts = Object.keys(Module._extensions);
              filename = tryPackage(basePath, exts, isMain);
            }
            if (!filename) {
              if (exts === void 0) exts = Object.keys(Module._extensions);
              filename = tryExtensions(basePath, exts, isMain);
            }
          }
          if (!filename && rc === 1) {
            if (exts === void 0) exts = Object.keys(Module._extensions);
            filename = tryPackage(basePath, exts, isMain);
          }
          if (!filename && rc === 1) {
            if (exts === void 0) exts = Object.keys(Module._extensions);
            filename = tryExtensions(path.resolve(basePath, "index"), exts, isMain);
          }
          if (filename) {
            if (request === "." && i > 0) {
              if (!warned) {
                warned = true;
                process.emitWarning("warning: require('.') resolved outside the package directory. This functionality is deprecated and will be removed soon.", "DeprecationWarning", "DEP0019");
              }
            }
            Module._pathCache[cacheKey] = filename;
            return filename;
          }
        }
        return false;
      };
    }
  }
});

// node_modules/fs-monkey/lib/index.js
var require_lib = __commonJS({
  "node_modules/fs-monkey/lib/index.js"(exports2) {
    "use strict";
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    Object.defineProperty(exports2, "patchFs", {
      enumerable: true,
      get: function get2() {
        return _patchFs["default"];
      }
    });
    Object.defineProperty(exports2, "patchRequire", {
      enumerable: true,
      get: function get2() {
        return _patchRequire["default"];
      }
    });
    Object.defineProperty(exports2, "unixify", {
      enumerable: true,
      get: function get2() {
        return _correctPath.unixify;
      }
    });
    exports2.util = void 0;
    var _patchFs = _interopRequireDefault(require_patchFs());
    var _patchRequire = _interopRequireDefault(require_patchRequire());
    var _correctPath = require_correctPath();
    var util = _interopRequireWildcard(require_lists());
    exports2.util = util;
    function _interopRequireWildcard(e, t) {
      if ("function" == typeof WeakMap) var r = /* @__PURE__ */ new WeakMap(), n = /* @__PURE__ */ new WeakMap();
      return (_interopRequireWildcard = function _interopRequireWildcard2(e2, t2) {
        if (!t2 && e2 && e2.__esModule) return e2;
        var o, i, f = { __proto__: null, "default": e2 };
        if (null === e2 || "object" != _typeof(e2) && "function" != typeof e2) return f;
        if (o = t2 ? n : r) {
          if (o.has(e2)) return o.get(e2);
          o.set(e2, f);
        }
        for (var _t in e2) "default" !== _t && {}.hasOwnProperty.call(e2, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e2, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e2[_t]);
        return f;
      })(e, t);
    }
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { "default": e };
    }
  }
});

// src/run/next.cts
var next_exports = {};
__export(next_exports, {
  getMockedRequestHandler: () => getMockedRequestHandler
});
module.exports = __toCommonJS(next_exports);
var import_node_async_hooks = require("node:async_hooks");
var import_promises = __toESM(require("node:fs/promises"));
var import_node_path = require("node:path");
var import_fs_monkey = __toESM(require_lib());
var import_request_context = require("./handlers/request-context.cjs");
var import_tracer = require("./handlers/tracer.cjs");
var import_storage = require("./storage/storage.cjs");
process.env.NODE_ENV = "production";
process.env.NEXT_OTEL_FETCH_DISABLED = "1";
var { getRequestHandlers } = require("next/dist/server/lib/start-server.js");
var ResponseCache = require("next/dist/server/response-cache/index.js").default;
var originalGet = ResponseCache.prototype.get;
ResponseCache.prototype.get = function get(...getArgs) {
  if (!this.didAddBackgroundWorkTracking) {
    if (typeof this.batcher !== "undefined") {
      const originalBatcherBatch = this.batcher.batch;
      this.batcher.batch = async (key, fn) => {
        const trackedFn = async (...workFnArgs) => {
          const workPromise = fn(...workFnArgs);
          const requestContext = (0, import_request_context.getRequestContext)();
          if (requestContext && workPromise instanceof Promise) {
            requestContext.trackBackgroundWork(workPromise);
          }
          return await workPromise;
        };
        return originalBatcherBatch.call(this.batcher, key, trackedFn);
      };
    } else if (typeof this.pendingResponses !== "undefined") {
      const backgroundWork = /* @__PURE__ */ new Map();
      const originalPendingResponsesSet = this.pendingResponses.set;
      this.pendingResponses.set = async (key, value) => {
        const requestContext = (0, import_request_context.getRequestContext)();
        if (requestContext && !this.pendingResponses.has(key)) {
          const workPromise = new Promise((_resolve) => {
            backgroundWork.set(key, _resolve);
          });
          requestContext.trackBackgroundWork(workPromise);
        }
        return originalPendingResponsesSet.call(this.pendingResponses, key, value);
      };
      const originalPendingResponsesDelete = this.pendingResponses.delete;
      this.pendingResponses.delete = async (key) => {
        const _resolve = backgroundWork.get(key);
        if (_resolve) {
          _resolve();
        }
        return originalPendingResponsesDelete.call(this.pendingResponses, key);
      };
    }
    this.didAddBackgroundWorkTracking = true;
  }
  return originalGet.apply(this, getArgs);
};
async function getMockedRequestHandler(nextConfig, ...args) {
  const initContext = { initializingServer: true };
  const initAsyncLocalStorage = new import_node_async_hooks.AsyncLocalStorage();
  return (0, import_tracer.withActiveSpan)((0, import_tracer.getTracer)(), "mocked request handler", async () => {
    const ofs = { ...import_promises.default };
    async function readFileFallbackBlobStore(...fsargs) {
      const [path, options] = fsargs;
      try {
        return await ofs.readFile(path, options);
      } catch (error) {
        if (typeof path === "string" && path.endsWith(".html")) {
          const cacheStore = (0, import_storage.getMemoizedKeyValueStoreBackedByRegionalBlobStore)();
          const relPath = (0, import_node_path.relative)((0, import_node_path.resolve)(nextConfig.distDir, "server/pages"), path);
          const file = await cacheStore.get(relPath, "staticHtml.get");
          if (file !== null) {
            if (file.isFullyStaticPage) {
              const requestContext = (0, import_request_context.getRequestContext)();
              const { initializingServer } = initAsyncLocalStorage.getStore() ?? {};
              if (!initializingServer && requestContext) {
                requestContext.usedFsReadForNonFallback = true;
              }
            }
            return file.html;
          }
        }
        throw error;
      }
    }
    (0, import_fs_monkey.patchFs)(
      {
        readFile: readFileFallbackBlobStore
      },
      // eslint-disable-next-line n/global-require, @typescript-eslint/no-var-requires
      require("fs").promises
    );
    const requestHandlers = await initAsyncLocalStorage.run(initContext, async () => {
      return await getRequestHandlers(...args);
    });
    return Array.isArray(requestHandlers) ? requestHandlers[0] : requestHandlers.requestHandler;
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getMockedRequestHandler
});
