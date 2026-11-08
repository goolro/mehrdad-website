module.exports = [
"[project]/src/lib/seed-import.ts [instrumentation] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/src_lib_1pvi12qiyi1fi._.js",
  "server/chunks/[externals]_@prisma_150m4xbigf5y9._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/src/lib/seed-import.ts [instrumentation] (ecmascript)");
    });
});
}),
];