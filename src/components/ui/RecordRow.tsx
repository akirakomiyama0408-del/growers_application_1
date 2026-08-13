import type { ReactNode } from "react";

// リスト項目をクリックすると編集フォームが展開される汎用行コンポーネント
export function RecordRow({
  summary,
  editForm,
}: {
  summary: ReactNode;
  editForm: ReactNode;
}) {
  return (
    <li className="rounded-xl border border-ink-100">
      <details className="group">
        <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 select-none">
          <div className="min-w-0 flex-1">{summary}</div>
          <span className="shrink-0 rounded-full border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-400 group-open:border-strawberry-200 group-open:text-strawberry-500">
            編集
          </span>
        </summary>
        <div className="border-t border-ink-100 bg-cream-50 px-4 py-3">
          {editForm}
        </div>
      </details>
    </li>
  );
}
