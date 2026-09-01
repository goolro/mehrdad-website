/**
 * Migrate WordPress comments into the new DB.
 * - Maps WP post id → new Post (via wpId)
 * - Preserves threading (parentWpId), original dates, author names
 * - All WP comments approved=true, EXCEPT obvious spam (email-like author names)
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const db = new PrismaClient();

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, '’')
    .replace(/&#8230;/g, '…')
    .trim();
}

function isSpam(author: string, content: string): boolean {
  // email-like author names from bots
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(author.trim())) return true;
  // link-heavy comments
  const links = (content.match(/https?:\/\//g) || []).length;
  const words = content.split(/\s+/).length;
  if (words > 5 && links / Math.max(words, 1) > 0.15) return true;
  return false;
}

async function main() {
  const raw = JSON.parse(fs.readFileSync('/home/z/my-project/analysis/wp_comments.json', 'utf-8'));
  console.log(`Loaded ${raw.length} WP comments`);

  const posts = await db.post.findMany({ where: { wpId: { not: null } }, select: { id: true, wpId: true } });
  const wpToPost = new Map<number, string>();
  posts.forEach((p) => wpToPost.set(p.wpId!, p.id));
  console.log(`Posts with wpId in DB: ${wpToPost.size}`);

  let created = 0, skippedNoPost = 0, skippedExists = 0, markedSpam = 0;

  for (const c of raw) {
    const postId = wpToPost.get(c.post);
    if (!postId) {
      skippedNoPost++;
      console.log(`  skip (post ${c.post} not migrated): wpId=${c.id}`);
      continue;
    }
    const exists = await db.comment.findUnique({ where: { wpId: c.id } });
    if (exists) {
      skippedExists++;
      continue;
    }
    const content = stripHtml(c.content?.rendered || '');
    const spam = isSpam(c.author_name, content);
    if (spam) markedSpam++;
    await db.comment.create({
      data: {
        postId,
        wpId: c.id,
        parentWpId: c.parent > 0 ? c.parent : null,
        author: c.author_name || 'Unknown',
        content,
        date: new Date(c.date_gmt ? c.date_gmt + 'Z' : c.date),
        approved: !spam,
      },
    });
    created++;
    console.log(`  ✓ wpId=${c.id} → ${spam ? 'UNAPPROVED (spam?)' : 'approved'}`);
  }

  console.log(`\nDone: created=${created}, spam-flagged=${markedSpam}, noPost=${skippedNoPost}, exists=${skippedExists}`);
  const total = await db.comment.count();
  const approved = await db.comment.count({ where: { approved: true } });
  console.log(`DB now has ${total} comments (${approved} approved)`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
