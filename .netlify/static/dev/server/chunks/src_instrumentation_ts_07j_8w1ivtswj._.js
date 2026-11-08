module.exports = [
"[project]/src/instrumentation.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Next.js instrumentation — runs once per server instance at boot
 * (never during `next build`). Best-effort content seeding lives here:
 * rows in src/lib/seed-import.ts are inserted into the DB if missing,
 * so content shipped via git reaches production without any manual DB
 * access. All failures are swallowed inside the importer.
 */ __turbopack_context__.s([
    "register",
    ()=>register
]);
async function register() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const { importContentSeed } = await __turbopack_context__.A("[project]/src/lib/seed-import.ts [instrumentation] (ecmascript, async loader)");
    await importContentSeed();
}
}),
];

//# sourceMappingURL=src_instrumentation_ts_07j_8w1ivtswj._.js.map