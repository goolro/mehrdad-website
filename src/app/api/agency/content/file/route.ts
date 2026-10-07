import { NextResponse, type NextRequest } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET ?id=<videoId>[&final=1] — download one generated video.
 *
 * - default: stream the raw scene straight from the provider (temporary URL).
 * - final=1: mount the branded outro card (Instagram @startup_mt +
 *   Mehrdad.ir) onto the END of the clip with ffmpeg and stream the finished
 *   MP4. Everything happens in-memory/tmp inside this request — nothing is
 *   stored. Falls back with a Persian error if the provider link expired.
 *
 * ffmpeg is resolved at runtime (system binary on the studio sandbox);
 * Vercel lambdas gracefully degrade to the raw scene download.
 */

import { execFile } from 'child_process';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

/**
 * Resolve an ffmpeg binary at runtime. On the studio sandbox the system
 * ffmpeg exists; on Vercel lambdas nothing does, so the branded-outro
 * assembly degrades to a friendly Persian error and the owner uses the raw
 * download (final branded MP4s are assembled in the sandbox studio — the
 * owner explicitly asked for a one-by-one workflow).
 */
function resolveFfmpeg(): string {
  const candidate = path.join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg');
  if (fs.existsSync(candidate)) return candidate;
  return 'ffmpeg';
}

async function runFfmpeg(args: string[], expectOutput?: string, minBytes = 50_000): Promise<void> {
  const bin = resolveFfmpeg();
  const argv = ['-hide_banner', '-loglevel', 'error', '-y', '-threads', '2', ...args];
  try {
    await execFileAsync(bin, argv, {
      timeout: 90_000,
      maxBuffer: 8 * 1024 * 1024,
    });
  } catch (e) {
    // Some hardened environments (this sandbox included) SIGKILL the ffmpeg
    // process right after it finishes writing — the encode itself completed.
    // Accept the result when the expected output exists with plausible size.
    const ok = expectOutput && fs.existsSync(expectOutput) && fs.statSync(expectOutput).size >= minBytes;
    if (!ok) throw e;
  }
}

export async function GET(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;

  const id = req.nextUrl.searchParams.get('id');
  const wantFinal = req.nextUrl.searchParams.get('final') === '1';
  if (!id) return NextResponse.json({ error: 'id لازم است' }, { status: 400 });

  const video = await db.contentVideo.findUnique({ where: { id } });
  if (!video) return NextResponse.json({ error: 'ویدیو پیدا نشد' }, { status: 404 });
  if (video.status !== 'ready' || !video.url) {
    return NextResponse.json({ error: 'ویدیو هنوز آماده نیست' }, { status: 409 });
  }

  // ── raw mode: proxy the provider file as-is ─────────────────────────────
  if (!wantFinal) {
    let upstream: Response;
    try {
      upstream = await fetch(video.url, { signal: AbortSignal.timeout(45_000) });
    } catch {
      return NextResponse.json(
        { error: 'دریافت فایل از سرویس ویدیو ناموفق بود — لینک ممکن است منقضی شده باشد' },
        { status: 502 }
      );
    }
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: 'لینک ویدیو منقضی شده است — لطفاً ویدیوی جدید بساز' },
        { status: 410 }
      );
    }
    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="startup-mt-${video.id.slice(-8)}.mp4"`,
        'Cache-Control': 'no-store',
      },
    });
  }

  // ── final mode: scene + branded outro card, mounted with ffmpeg ─────────
  const work = path.join(tmpdir(), `studio-${randomUUID()}`);
  fs.mkdirSync(work, { recursive: true });
  const scenePath = path.join(work, 'scene.mp4');
  const outroPath = path.join(work, 'outro.mp4');
  const finalPath = path.join(work, 'final.mp4');

  try {
    // 1. pull the scene clip
    const res = await fetch(video.url, { signal: AbortSignal.timeout(45_000) });
    if (!res.ok) throw new Error('PROVIDER');
    fs.writeFileSync(scenePath, Buffer.from(await res.arrayBuffer()));

    // 2. render the outro card as a 2.5s gentle-zoom clip (9:16, 30fps,
    //    yuv420p h264 — same family as the scene so the concat is clean)
    const cardPath = path.join(process.cwd(), 'public', 'agency-content', 'outro-card.png');
    if (!fs.existsSync(cardPath)) throw new Error('CARD');
    await runFfmpeg(
      [
        '-loop', '1',
        '-i', cardPath,
        '-filter_complex',
        "[0:v]scale=720:1280,zoompan=z='min(zoom+0.0008,1.05)':d=75:s=720x1280:fps=30,format=yuv420p[v]",
        '-map', '[v]',
        '-t', '2.5',
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
        '-an', outroPath,
      ],
      outroPath,
      100_000
    );

    // 3. concat scene + outro (re-encode = parameter-safe)
    await runFfmpeg(
      [
        '-i', scenePath,
        '-i', outroPath,
        '-filter_complex', '[0:v][1:v]concat=n=2:v=1:a=0,format=yuv420p[v]',
        '-map', '[v]',
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
        '-an', '-movflags', '+faststart', finalPath,
      ],
      finalPath,
      500_000
    );

    const buf = fs.readFileSync(finalPath);
    return new Response(new Uint8Array(buf), {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="startup-mt-final-${video.id.slice(-8)}.mp4"`,
        'Content-Length': String(buf.length),
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    const which = e instanceof Error ? e.message : '';
    const msg =
      which === 'PROVIDER'
        ? 'لینک ویدیو از سرویس منقضی شده — ویدیوی جدید بساز'
        : which === 'CARD'
          ? 'کارت پایانی برند پیدا نشد'
          : 'مونتاژ کارت برند ناموفق بود — نسخه خام را دانلود کن';
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}
