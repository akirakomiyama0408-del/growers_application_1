import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
  breadcrumb,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  breadcrumb?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        {breadcrumb && (
          <div className="mb-1 text-xs text-ink-300">{breadcrumb}</div>
        )}
        <h1 className="text-2xl font-bold text-ink-500">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-ink-300">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-200 bg-cream-50 px-6 py-14 text-center">
      <span className="text-3xl">🍓</span>
      <p className="font-medium text-ink-500">{title}</p>
      {description && <p className="text-sm text-ink-300">{description}</p>}
      {action}
    </div>
  );
}
