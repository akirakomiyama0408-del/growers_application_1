"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

export function CustomerSearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function handleChange(next: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.trim()) {
        params.set("q", next.trim());
      } else {
        params.delete("q");
      }
      router.replace(`/customers${params.toString() ? `?${params.toString()}` : ""}`);
    }, 300);
  }

  return (
    <div className="relative w-full sm:w-72">
      <svg
        className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
        />
      </svg>
      <input
        type="search"
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="お客様名・住所で検索"
        className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pr-3.5 pl-10 text-sm text-ink-500 placeholder:text-ink-300 focus:border-strawberry-400 focus:outline-none focus:ring-2 focus:ring-strawberry-100"
      />
    </div>
  );
}
