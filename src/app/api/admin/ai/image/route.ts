import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { checkAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    const b = await req.json();
    const topic = (b.prompt || '').trim().slice(0, 500);
    if (!topic) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });

    const prompt = `${topic}, professional editorial illustration, modern tech aesthetic, purple and violet color palette, clean composition, high quality, detailed`;
    const zai = await ZAI.create();
    const response = await zai.images.generations.create({ prompt, size: '1344x768' });

    const base64 = response.data?.[0]?.base64;
    if (!base64) throw new Error('No image returned');

    const dir = path.join(process.cwd(), 'public', 'media', 'generated');
    fs.mkdirSync(dir, { recursive: true });
    const name = `ai_${Date.now()}_${crypto.randomBytes(3).toString('hex')}.png`;
    fs.writeFileSync(path.join(dir, name), Buffer.from(base64, 'base64'));

    return NextResponse.json({ ok: true, url: `/media/generated/${name}` });
  } catch (e) {
    console.error('ai image error:', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Image generation failed' }, { status: 500 });
  }
}
