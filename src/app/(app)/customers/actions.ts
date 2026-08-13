"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import {
  CUSTOMER_IMPORT_COLUMNS,
  parseCsvText,
  type CustomerImportField,
} from "@/lib/customerImport";

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optStr(formData: FormData, key: string): string | null {
  const value = str(formData, key);
  return value === "" ? null : value;
}

function optFloat(formData: FormData, key: string): number | null {
  const value = str(formData, key);
  if (value === "") return null;
  const n = Number.parseFloat(value);
  return Number.isNaN(n) ? null : n;
}

export async function createCustomer(formData: FormData) {
  await requireUser();
  const name = str(formData, "name");
  if (!name) return;

  const customer = await prisma.customer.create({
    data: {
      name,
      kana: optStr(formData, "kana"),
      phone: optStr(formData, "phone"),
      email: optStr(formData, "email"),
      postalCode: optStr(formData, "postalCode"),
      address: optStr(formData, "address"),
      memo: optStr(formData, "memo"),
    },
  });

  revalidatePath("/customers");
  redirect(`/customers/${customer.id}`);
}

export async function updateCustomer(customerId: string, formData: FormData) {
  await requireUser();
  const name = str(formData, "name");
  if (!name) return;

  await prisma.customer.update({
    where: { id: customerId },
    data: {
      name,
      kana: optStr(formData, "kana"),
      phone: optStr(formData, "phone"),
      email: optStr(formData, "email"),
      postalCode: optStr(formData, "postalCode"),
      address: optStr(formData, "address"),
      memo: optStr(formData, "memo"),
    },
  });

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  redirect(`/customers/${customerId}`);
}

export async function archiveCustomer(customerId: string) {
  await requireUser();
  await prisma.customer.update({
    where: { id: customerId },
    data: { isActive: false },
  });
  revalidatePath("/customers");
  redirect("/customers");
}

export async function createField(customerId: string, formData: FormData) {
  await requireUser();
  const name = str(formData, "name");
  if (!name) return;

  await prisma.field.create({
    data: {
      name,
      type: (str(formData, "type") || "RAISED_BED") as "RAISED_BED" | "SOIL",
      areaSqm: optFloat(formData, "areaSqm"),
      location: optStr(formData, "location"),
      customerId,
    },
  });

  revalidatePath(`/customers/${customerId}`);
}

export async function updateField(
  customerId: string,
  fieldId: string,
  formData: FormData
) {
  await requireUser();
  const name = str(formData, "name");
  if (!name) return;

  await prisma.field.update({
    where: { id: fieldId },
    data: {
      name,
      type: (str(formData, "type") || "RAISED_BED") as "RAISED_BED" | "SOIL",
      areaSqm: optFloat(formData, "areaSqm"),
      location: optStr(formData, "location"),
    },
  });

  revalidatePath(`/customers/${customerId}`);
}

// ==================== CSV / Excel 一括インポート ====================

async function parseUploadedRows(file: File): Promise<string[][]> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();
  const isExcel =
    name.endsWith(".xlsx") ||
    name.endsWith(".xls") ||
    (buffer[0] === 0x50 && buffer[1] === 0x4b); // ZIP(xlsx)署名

  if (isExcel) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    const sheet = workbook.worksheets[0];
    const rows: string[][] = [];
    sheet?.eachRow((row) => {
      const values = (row.values as unknown[]).slice(1);
      rows.push(values.map((v) => (v == null ? "" : String(v).trim())));
    });
    return rows.filter((r) => r.some((v) => v !== ""));
  }

  return parseCsvText(buffer.toString("utf-8"));
}

export async function importCustomers(formData: FormData) {
  await requireUser();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect(`/customers/import?error=${encodeURIComponent("ファイルを選択してください。")}`);
  }

  let rows: string[][];
  try {
    rows = await parseUploadedRows(file as File);
  } catch {
    redirect(
      `/customers/import?error=${encodeURIComponent(
        "ファイルを読み込めませんでした。テンプレートに沿ったCSV/Excelファイルか確認してください。"
      )}`
    );
  }

  if (rows.length === 0) {
    redirect(`/customers/import?error=${encodeURIComponent("データが見つかりませんでした。")}`);
  }

  const headerRow = rows[0].map((h) => h.trim());
  const columnIndexByField = new Map<CustomerImportField, number>();
  for (const col of CUSTOMER_IMPORT_COLUMNS) {
    const idx = headerRow.findIndex((h) => h === col.header);
    if (idx !== -1) columnIndexByField.set(col.field, idx);
  }

  if (!columnIndexByField.has("name")) {
    redirect(
      `/customers/import?error=${encodeURIComponent(
        "「お客様名」列が見つかりません。テンプレートの1行目(見出し行)を変更していないか確認してください。"
      )}`
    );
  }

  const dataRows = rows.slice(1);
  let created = 0;
  const skipped: { row: number; reason: string }[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const rowNumber = i + 2; // 1行目は見出し
    const raw = dataRows[i];
    const get = (field: CustomerImportField): string => {
      const idx = columnIndexByField.get(field);
      if (idx === undefined) return "";
      return (raw[idx] ?? "").toString().trim();
    };

    const name = get("name");
    if (!name) {
      skipped.push({ row: rowNumber, reason: "お客様名が空欄" });
      continue;
    }

    try {
      await prisma.customer.create({
        data: {
          name,
          kana: get("kana") || null,
          phone: get("phone") || null,
          email: get("email") || null,
          postalCode: get("postalCode") || null,
          address: get("address") || null,
          memo: get("memo") || null,
        },
      });
      created++;
    } catch {
      skipped.push({ row: rowNumber, reason: "登録に失敗しました" });
    }
  }

  revalidatePath("/customers");

  const reasons = skipped
    .slice(0, 10)
    .map((s) => `${s.row}行目: ${s.reason}`);
  const params = new URLSearchParams({
    created: String(created),
    skipped: String(skipped.length),
  });
  if (reasons.length > 0) {
    params.set("reasons", JSON.stringify(reasons));
  }
  redirect(`/customers/import?${params.toString()}`);
}

export async function createVisitRecord(customerId: string, formData: FormData) {
  const user = await requireUser();
  const visitDate = str(formData, "visitDate");
  const purpose = str(formData, "purpose");
  const content = str(formData, "content");
  if (!visitDate || !purpose || !content) return;

  await prisma.visitRecord.create({
    data: {
      customerId,
      staffId: user.id,
      visitDate: new Date(visitDate),
      purpose,
      content,
      nextAction: optStr(formData, "nextAction"),
    },
  });

  revalidatePath(`/customers/${customerId}`);
}

export async function updateVisitRecord(
  customerId: string,
  visitId: string,
  formData: FormData
) {
  await requireUser();
  const visitDate = str(formData, "visitDate");
  const purpose = str(formData, "purpose");
  const content = str(formData, "content");
  if (!visitDate || !purpose || !content) return;

  await prisma.visitRecord.update({
    where: { id: visitId },
    data: {
      visitDate: new Date(visitDate),
      purpose,
      content,
      nextAction: optStr(formData, "nextAction"),
    },
  });

  revalidatePath(`/customers/${customerId}`);
}
