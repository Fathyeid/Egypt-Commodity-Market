import { setLessonStatusAction } from "@/lib/admin/actions";
import type { Dictionary } from "@/lib/i18n";

/** Approve / reject / back-to-draft buttons for one lesson (plain form posts, no client JS). */
export function StatusButtons({ id, status, t }: { id: string; status: string; t: Dictionary["admin"] }) {
  const btn = (to: string, label: string, cls: string) =>
    status === to ? null : (
      <form action={setLessonStatusAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value={to} />
        <button className={`${cls} px-3 py-1.5 text-sm`} data-testid={`set-${to}-${id}`}>{label}</button>
      </form>
    );
  return (
    <div className="flex flex-wrap gap-2">
      {btn("published", t.approve, "btn-primary")}
      {btn("rejected", t.reject, "btn-danger")}
      {status !== "draft" && btn("draft", t.toDraft, "btn-ghost")}
    </div>
  );
}

export function StatusBadge({ status, t }: { status: string; t: Dictionary["admin"] }) {
  const label = status === "published" ? t.published : status === "rejected" ? t.rejected : t.draft;
  const cls = status === "published" ? "bg-brand-soft text-brand" : status === "rejected" ? "bg-danger-soft text-danger" : "bg-surface-2 text-muted";
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>;
}
