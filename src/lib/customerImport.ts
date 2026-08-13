// お客様一括インポート機能の共通定義
// テンプレート生成・アップロード時のパース処理の両方から参照する

export const CUSTOMER_IMPORT_COLUMNS = [
  { header: "お客様名", field: "name", required: true },
  { header: "ふりがな", field: "kana", required: false },
  { header: "電話番号", field: "phone", required: false },
  { header: "メールアドレス", field: "email", required: false },
  { header: "郵便番号", field: "postalCode", required: false },
  { header: "住所", field: "address", required: false },
  { header: "メモ", field: "memo", required: false },
] as const;

export type CustomerImportField = (typeof CUSTOMER_IMPORT_COLUMNS)[number]["field"];

export const CUSTOMER_IMPORT_SAMPLE_ROW: Record<CustomerImportField, string> = {
  name: "山田農園",
  kana: "ヤマダノウエン",
  phone: "090-1234-5678",
  email: "yamada@example.com",
  postalCode: "123-4567",
  address: "〇〇県〇〇市〇〇1-2-3",
  memo: "毎週水曜日に巡回",
};

export type ParsedCustomerRow = {
  rowNumber: number;
  values: Partial<Record<CustomerImportField, string>>;
};

export type CustomerImportRowResult =
  | { rowNumber: number; status: "created"; name: string }
  | { rowNumber: number; status: "skipped"; reason: string };

// シンプルなCSVパーサ(ダブルクォート・エスケープ・CRLF対応)
export function parseCsvText(text: string): string[][] {
  const clean = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (inQuotes) {
      if (c === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c === "\r") {
      // \r\n の \r は無視 (次の \n で改行処理)
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}
