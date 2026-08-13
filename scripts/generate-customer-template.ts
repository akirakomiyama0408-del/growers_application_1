// お客様一括インポート用のテンプレートファイル(CSV/Excel)を public/templates に生成する。
// 列定義を変更した場合はこのスクリプトを再実行してテンプレートを更新すること。
//   npx tsx scripts/generate-customer-template.ts
import { writeFileSync, mkdirSync } from "fs";
import path from "path";
import ExcelJS from "exceljs";
import {
  CUSTOMER_IMPORT_COLUMNS,
  CUSTOMER_IMPORT_SAMPLE_ROW,
} from "../src/lib/customerImport";

const outDir = path.join(__dirname, "../public/templates");
mkdirSync(outDir, { recursive: true });

const headers = CUSTOMER_IMPORT_COLUMNS.map((c) => c.header);
const sampleRow = CUSTOMER_IMPORT_COLUMNS.map(
  (c) => CUSTOMER_IMPORT_SAMPLE_ROW[c.field]
);

// ---- CSV ----
function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
const csvContent =
  [headers, sampleRow].map((row) => row.map(csvEscape).join(",")).join("\r\n") +
  "\r\n";
// Excelで開いた際に文字化けしないようUTF-8 BOMを付与
writeFileSync(path.join(outDir, "customers_template.csv"), "﻿" + csvContent);

// ---- Excel (.xlsx) ----
async function generateXlsx() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("お客様");
  sheet.addRow(headers);
  sheet.addRow(sampleRow);
  sheet.getRow(1).font = { bold: true };
  sheet.columns.forEach((col, i) => {
    const headerLen = headers[i].length;
    const sampleLen = sampleRow[i]?.length ?? 0;
    col.width = Math.max(headerLen, sampleLen, 10) + 4;
  });
  await workbook.xlsx.writeFile(path.join(outDir, "customers_template.xlsx"));
}

generateXlsx()
  .then(() => {
    console.log("テンプレートを生成しました:", outDir);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
