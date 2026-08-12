"use client";

import { useState } from "react";
import { Input, Select } from "@/components/ui/Field";

const OTHER_VALUE = "__other__";

/**
 * プルダウンで選択肢を提示しつつ、一覧に無い値は「その他」を選ぶと
 * 自由入力欄に切り替わる複合入力。name は隠しinputとして送信される。
 */
export function SelectOrOther({
  name,
  options,
  defaultValue,
  placeholder,
  required,
}: {
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const matchesOption = options.some((o) => o.value === defaultValue);
  const [mode, setMode] = useState<"select" | "other">(
    defaultValue && !matchesOption ? "other" : "select"
  );
  const [freeText, setFreeText] = useState(
    defaultValue && !matchesOption ? defaultValue : ""
  );

  if (mode === "other") {
    return (
      <div className="flex gap-2">
        <Input
          name={name}
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder={placeholder ?? "自由入力"}
          required={required}
          autoFocus
        />
        <button
          type="button"
          onClick={() => {
            setMode("select");
            setFreeText("");
          }}
          className="shrink-0 rounded-xl border border-ink-200 px-3 text-xs text-ink-400 hover:bg-cream-100"
        >
          一覧から選ぶ
        </button>
      </div>
    );
  }

  return (
    <Select
      name={name}
      defaultValue={matchesOption ? defaultValue : ""}
      required={required}
      onChange={(e) => {
        if (e.target.value === OTHER_VALUE) {
          setMode("other");
        }
      }}
    >
      <option value="" disabled>
        選択してください
      </option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
      <option value={OTHER_VALUE}>その他（自由入力）</option>
    </Select>
  );
}
