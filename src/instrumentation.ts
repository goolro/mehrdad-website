/**
 * Next.js instrumentation — runs once per server instance at boot
 * (never during `next build`). Best-effort content seeding lives here:
 * rows in src/lib/seed-import.ts are inserted into the DB if missing,
 * so content shipped via git reaches production without any manual DB
 * access. All failures are swallowed inside the importer.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { importContentSeed } = await import('@/lib/seed-import');
  await importContentSeed();
}
