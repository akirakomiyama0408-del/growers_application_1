import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const toneClasses = {
  strawberry: "bg-strawberry-50 text-strawberry-600",
  leaf: "bg-leaf-50 text-leaf-600",
  neutral: "bg-cream-200 text-ink-400",
  outline: "border border-ink-200 text-ink-400",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof toneClasses;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
