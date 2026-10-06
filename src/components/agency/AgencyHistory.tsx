'use client';

/**
 * History tab — revisit, export or delete past single-agent chats and team
 * runs. Team threads show which specialist produced each assistant turn.
 */
import { useState } from 'react';
import { Bot, Download, Loader2, MessageSquare, RefreshCw, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  agencyFetch,
  downloadMarkdown,
  relativeFa,
  type AgencyChatMessage,
  type SessionDetail,
  type SessionSummary,
} from '@/components/agency/agency-client';

export function AgencyHistory({
  sessions,
  onChanged,
}: {
  sessions: SessionSummary[];
  onChanged: () => void;
}) {
  const { toast } = useToast();
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<SessionSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openSession = async (s: SessionSummary) => {
    setDetailLoading(true);
    try {
      const d = await agencyFetch<SessionDetail>(`/api/agency/sessions/${encodeURIComponent(s.id)}`);
      setDetail(d);
    } catch (e) {
      toast({
        title: 'خطا در دریافت گفتگو',
        description: e instanceof Error ? e.message : String(e),
        variant: 'destructive',
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await agencyFetch(`/api/agency/sessions/${encodeURIComponent(pendingDelete.id)}`, {
        method: 'DELETE',
      });
      toast({ title: 'حذف شد' });
      setDetail(null);
      onChanged();
    } catch (e) {
      toast({
        title: 'حذف ناموفق بود',
        description: e instanceof Error ? e.message : String(e),
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  const exportSession = (d: SessionDetail) => {
    const md =
      `# ${d.session.title}\n\n` +
      `*نوع: ${d.session.kind === 'team' ? 'اجرای تیمی' : 'گفتگوی تکی'} · ${new Date(
        d.session.createdAt
      ).toLocaleString('fa-IR')}*\n\n` +
      d.messages
        .map(
          (m) =>
            `**${m.role === 'user' ? 'من' : m.agentName ?? 'ایجنت'}:**\n\n${m.content}\n`
        )
        .join('\n---\n\n');
    downloadMarkdown(`agency-${d.session.kind}-${d.session.id.slice(0, 8)}.md`, md);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-3 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">
          {sessions.length.toLocaleString('fa-IR')} گفتگو ذخیره شده
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onChanged}
          className="h-8 gap-1 text-[11px] text-zinc-400 hover:text-zinc-100"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden /> بروزرسانی
        </Button>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-800 p-10 text-center">
          <Bot className="h-8 w-8 text-zinc-700" aria-hidden />
          <p className="text-xs leading-5 text-zinc-500">
            هنوز کاری انجام نشده — از بخش «ایجنت‌ها» شروع کن یا یک اجرای تیمی بساز.
          </p>
        </div>
      ) : (
        <ul className="space-y-2" role="list">
          {sessions.map((s) => (
            <li key={s.id}>
              <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 transition-colors hover:border-emerald-500/40">
                <button onClick={() => openSession(s)} className="flex min-w-0 flex-1 items-center gap-3 text-start">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      s.kind === 'team' ? 'bg-amber-500/10 text-amber-300' : 'bg-emerald-500/10 text-emerald-400'
                    }`}
                  >
                    {s.kind === 'team' ? <Users className="h-4 w-4" aria-hidden /> : <MessageSquare className="h-4 w-4" aria-hidden />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-xs font-bold">{s.title}</span>
                      {s.kind === 'team' && (
                        <Badge variant="outline" className="shrink-0 border-amber-500/30 px-1.5 text-[9px] text-amber-300">
                          تیمی
                        </Badge>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-zinc-500">{s.preview}</span>
                  </span>
                  <span className="shrink-0 text-[10px] text-zinc-600">
                    {relativeFa(s.lastActivity)} · {s.messageCount.toLocaleString('fa-IR')} پیام
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`حذف ${s.title}`}
                  onClick={() => setPendingDelete(s)}
                  className="h-8 w-8 shrink-0 text-zinc-600 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* thread dialog */}
      <Dialog open={!!detail || detailLoading} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col gap-0 overflow-hidden border-zinc-800 bg-zinc-900 p-0 text-zinc-100 [direction:rtl]">
          {detail ? (
            <>
              <DialogHeader className="border-b border-zinc-800 p-4 pe-11 text-start">
                <DialogTitle className="text-sm font-bold">{detail.session.title}</DialogTitle>
                <DialogDescription className="text-[11px] text-zinc-500">
                  {detail.session.kind === 'team' ? 'اجرای تیمی' : 'گفتگوی تکی'} ·{' '}
                  {new Date(detail.session.createdAt).toLocaleString('fa-IR')}
                </DialogDescription>
              </DialogHeader>
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                {detail.messages.map((m) => (
                  <MessageBlock key={m.id} m={m} />
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-zinc-800 p-3">
                <span className="text-[10px] text-zinc-600">
                  {detail.messages.length.toLocaleString('fa-IR')} پیام
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportSession(detail)}
                  className="h-8 gap-1 border-zinc-700 bg-transparent text-[11px] text-zinc-300 hover:bg-zinc-800"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden /> خروجی Markdown
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 p-12 text-sm text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> در حال بارگذاری گفتگو…
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* delete confirm */}
      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 [direction:rtl]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">حذف این گفتگو؟</AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-5 text-zinc-400">
              «{pendingDelete?.title}» و همهٔ پیام‌هایش برای همیشه حذف می‌شود. این کار برگشت‌پذیر
              نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800">
              انصراف
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-500"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : 'حذف کن'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MessageBlock({ m }: { m: AgencyChatMessage }) {
  if (m.role === 'user') {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl rounded-ss-md bg-emerald-600/90 px-3.5 py-2.5 text-xs leading-5 text-white">
          {m.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-end">
      <div className="max-w-[92%] rounded-2xl rounded-se-md border border-zinc-800 bg-zinc-800/60 px-3.5 py-2.5">
        {m.agentName && <p className="mb-1 text-[10px] font-bold text-emerald-400">{m.agentName}</p>}
        <div className="whitespace-pre-wrap break-words text-xs leading-5 text-zinc-200">{m.content}</div>
      </div>
    </div>
  );
}
