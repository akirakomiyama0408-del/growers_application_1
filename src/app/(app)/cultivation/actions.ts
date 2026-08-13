"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import type { CultivationStatus, PestDiseaseType, CostCategory } from "@/generated/prisma/client";

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

function num(formData: FormData, key: string): number {
  const value = str(formData, key);
  const n = Number.parseFloat(value);
  return Number.isNaN(n) ? 0 : n;
}

// ==================== 作付(栽培サイクル) ====================

export async function createCultivationCycle(formData: FormData) {
  await requireUser();
  const customerId = str(formData, "customerId");
  const fieldId = str(formData, "fieldId");
  const varietyId = str(formData, "varietyId");
  const season = str(formData, "season");
  if (!customerId || !fieldId || !varietyId || !season) return;

  const seedlingDate = optStr(formData, "seedlingDate");
  const plantingDate = optStr(formData, "plantingDate");

  const cycle = await prisma.cultivationCycle.create({
    data: {
      customerId,
      fieldId,
      varietyId,
      season,
      status: (str(formData, "status") || "SEEDLING") as CultivationStatus,
      seedlingDate: seedlingDate ? new Date(seedlingDate) : null,
      plantingDate: plantingDate ? new Date(plantingDate) : null,
      memo: optStr(formData, "memo"),
    },
  });

  revalidatePath("/cultivation");
  revalidatePath(`/customers/${customerId}`);
  redirect(`/cultivation/${cycle.id}`);
}

export async function updateCycleStatus(cycleId: string, formData: FormData) {
  await requireUser();
  const status = str(formData, "status") as CultivationStatus;
  if (!status) return;
  await prisma.cultivationCycle.update({
    where: { id: cycleId },
    data: { status },
  });
  revalidatePath(`/cultivation/${cycleId}`);
  revalidatePath("/cultivation");
}

export async function updateCultivationCycleInfo(
  cycleId: string,
  formData: FormData
) {
  await requireUser();
  const fieldId = str(formData, "fieldId");
  const varietyId = str(formData, "varietyId");
  const season = str(formData, "season");
  const status = str(formData, "status") as CultivationStatus;
  if (!fieldId || !varietyId || !season || !status) return;

  const seedlingDate = optStr(formData, "seedlingDate");
  const plantingDate = optStr(formData, "plantingDate");

  const cycle = await prisma.cultivationCycle.update({
    where: { id: cycleId },
    data: {
      fieldId,
      varietyId,
      season,
      status,
      seedlingDate: seedlingDate ? new Date(seedlingDate) : null,
      plantingDate: plantingDate ? new Date(plantingDate) : null,
      memo: optStr(formData, "memo"),
    },
    select: { customerId: true },
  });

  revalidatePath(`/customers/${cycle.customerId}`);
  revalidatePath(`/cultivation/${cycleId}`);
  revalidatePath("/cultivation");
}

// ==================== 作業日誌 ====================

export async function createWorkLog(cycleId: string, formData: FormData) {
  const user = await requireUser();
  const workDate = str(formData, "workDate");
  const workTypeId = str(formData, "workTypeId");
  if (!workDate || !workTypeId) return;

  await prisma.workLog.create({
    data: {
      cultivationCycleId: cycleId,
      workTypeId,
      staffId: user.id,
      workDate: new Date(workDate),
      content: optStr(formData, "content"),
    },
  });
  revalidatePath(`/cultivation/${cycleId}`);
}

export async function updateWorkLog(
  cycleId: string,
  logId: string,
  formData: FormData
) {
  await requireUser();
  const workDate = str(formData, "workDate");
  const workTypeId = str(formData, "workTypeId");
  if (!workDate || !workTypeId) return;

  await prisma.workLog.update({
    where: { id: logId },
    data: {
      workTypeId,
      workDate: new Date(workDate),
      content: optStr(formData, "content"),
    },
  });
  revalidatePath(`/cultivation/${cycleId}`);
}

// ==================== 肥培管理 ====================

export async function createFertilization(cycleId: string, formData: FormData) {
  const user = await requireUser();
  const date = str(formData, "date");
  const fertilizerProductId = str(formData, "fertilizerProductId");
  if (!date || !fertilizerProductId) return;

  await prisma.fertilizationRecord.create({
    data: {
      cultivationCycleId: cycleId,
      fertilizerProductId,
      staffId: user.id,
      date: new Date(date),
      amount: optStr(formData, "amount"),
      method: optStr(formData, "method"),
      memo: optStr(formData, "memo"),
    },
  });
  revalidatePath(`/cultivation/${cycleId}`);
}

export async function updateFertilization(
  cycleId: string,
  recordId: string,
  formData: FormData
) {
  await requireUser();
  const date = str(formData, "date");
  const fertilizerProductId = str(formData, "fertilizerProductId");
  if (!date || !fertilizerProductId) return;

  await prisma.fertilizationRecord.update({
    where: { id: recordId },
    data: {
      fertilizerProductId,
      date: new Date(date),
      amount: optStr(formData, "amount"),
      method: optStr(formData, "method"),
      memo: optStr(formData, "memo"),
    },
  });
  revalidatePath(`/cultivation/${cycleId}`);
}

// ==================== 病害虫記録 ====================

export async function createPestDisease(cycleId: string, formData: FormData) {
  const user = await requireUser();
  const date = str(formData, "date");
  const type = str(formData, "type") as PestDiseaseType;
  const name = str(formData, "name");
  if (!date || !type || !name) return;

  await prisma.pestDiseaseRecord.create({
    data: {
      cultivationCycleId: cycleId,
      staffId: user.id,
      date: new Date(date),
      type,
      name,
      severity: optStr(formData, "severity"),
      action: optStr(formData, "action"),
      memo: optStr(formData, "memo"),
    },
  });
  revalidatePath(`/cultivation/${cycleId}`);
}

export async function updatePestDisease(
  cycleId: string,
  recordId: string,
  formData: FormData
) {
  await requireUser();
  const date = str(formData, "date");
  const type = str(formData, "type") as PestDiseaseType;
  const name = str(formData, "name");
  if (!date || !type || !name) return;

  await prisma.pestDiseaseRecord.update({
    where: { id: recordId },
    data: {
      date: new Date(date),
      type,
      name,
      severity: optStr(formData, "severity"),
      action: optStr(formData, "action"),
      memo: optStr(formData, "memo"),
    },
  });
  revalidatePath(`/cultivation/${cycleId}`);
}

// ==================== 農薬使用履歴 ====================

export async function createPesticideApplication(
  cycleId: string,
  formData: FormData
) {
  const user = await requireUser();
  const date = str(formData, "date");
  const pesticideProductId = str(formData, "pesticideProductId");
  if (!date || !pesticideProductId) return;

  await prisma.pesticideApplication.create({
    data: {
      cultivationCycleId: cycleId,
      pesticideProductId,
      staffId: user.id,
      date: new Date(date),
      dilution: optStr(formData, "dilution"),
      amount: optStr(formData, "amount"),
      targetPest: optStr(formData, "targetPest"),
      weather: optStr(formData, "weather"),
    },
  });
  revalidatePath(`/cultivation/${cycleId}`);
}

export async function updatePesticideApplication(
  cycleId: string,
  recordId: string,
  formData: FormData
) {
  await requireUser();
  const date = str(formData, "date");
  const pesticideProductId = str(formData, "pesticideProductId");
  if (!date || !pesticideProductId) return;

  await prisma.pesticideApplication.update({
    where: { id: recordId },
    data: {
      pesticideProductId,
      date: new Date(date),
      dilution: optStr(formData, "dilution"),
      amount: optStr(formData, "amount"),
      targetPest: optStr(formData, "targetPest"),
      weather: optStr(formData, "weather"),
    },
  });
  revalidatePath(`/cultivation/${cycleId}`);
}

// ==================== 収穫記録 ====================

export async function createHarvestRecord(cycleId: string, formData: FormData) {
  const user = await requireUser();
  const date = str(formData, "date");
  const amountKg = num(formData, "amountKg");
  if (!date || amountKg <= 0) return;

  await prisma.harvestRecord.create({
    data: {
      cultivationCycleId: cycleId,
      staffId: user.id,
      date: new Date(date),
      amountKg,
      grade: optStr(formData, "grade"),
      brixLevel: optFloat(formData, "brixLevel"),
      memo: optStr(formData, "memo"),
    },
  });
  revalidatePath(`/cultivation/${cycleId}`);
}

export async function updateHarvestRecord(
  cycleId: string,
  recordId: string,
  formData: FormData
) {
  await requireUser();
  const date = str(formData, "date");
  const amountKg = num(formData, "amountKg");
  if (!date || amountKg <= 0) return;

  await prisma.harvestRecord.update({
    where: { id: recordId },
    data: {
      date: new Date(date),
      amountKg,
      grade: optStr(formData, "grade"),
      brixLevel: optFloat(formData, "brixLevel"),
      memo: optStr(formData, "memo"),
    },
  });
  revalidatePath(`/cultivation/${cycleId}`);
}

// ==================== 販売記録 ====================

export async function createSalesRecord(cycleId: string, formData: FormData) {
  const user = await requireUser();
  const date = str(formData, "date");
  const destinationId = str(formData, "destinationId");
  const quantityKg = num(formData, "quantityKg");
  const unitPrice = num(formData, "unitPrice");
  if (!date || !destinationId || quantityKg <= 0) return;

  const harvestRecordId = optStr(formData, "harvestRecordId");

  await prisma.salesRecord.create({
    data: {
      cultivationCycleId: cycleId,
      destinationId,
      staffId: user.id,
      harvestRecordId: harvestRecordId ?? undefined,
      date: new Date(date),
      quantityKg,
      unitPrice,
      totalAmount: Math.round(quantityKg * unitPrice),
      lotNumber: optStr(formData, "lotNumber"),
      memo: optStr(formData, "memo"),
    },
  });
  revalidatePath(`/cultivation/${cycleId}`);
}

export async function updateSalesRecord(
  cycleId: string,
  recordId: string,
  formData: FormData
) {
  await requireUser();
  const date = str(formData, "date");
  const destinationId = str(formData, "destinationId");
  const quantityKg = num(formData, "quantityKg");
  const unitPrice = num(formData, "unitPrice");
  if (!date || !destinationId || quantityKg <= 0) return;

  const harvestRecordId = optStr(formData, "harvestRecordId");

  await prisma.salesRecord.update({
    where: { id: recordId },
    data: {
      destinationId,
      harvestRecordId: harvestRecordId ?? null,
      date: new Date(date),
      quantityKg,
      unitPrice,
      totalAmount: Math.round(quantityKg * unitPrice),
      lotNumber: optStr(formData, "lotNumber"),
      memo: optStr(formData, "memo"),
    },
  });
  revalidatePath(`/cultivation/${cycleId}`);
}

// ==================== コスト記録 ====================

export async function createCostRecord(cycleId: string, formData: FormData) {
  const user = await requireUser();
  const date = str(formData, "date");
  const category = str(formData, "category") as CostCategory;
  const item = str(formData, "item");
  const amount = num(formData, "amount");
  if (!date || !category || !item || amount <= 0) return;

  await prisma.costRecord.create({
    data: {
      cultivationCycleId: cycleId,
      staffId: user.id,
      date: new Date(date),
      category,
      item,
      amount,
      memo: optStr(formData, "memo"),
    },
  });
  revalidatePath(`/cultivation/${cycleId}`);
}

export async function updateCostRecord(
  cycleId: string,
  recordId: string,
  formData: FormData
) {
  await requireUser();
  const date = str(formData, "date");
  const category = str(formData, "category") as CostCategory;
  const item = str(formData, "item");
  const amount = num(formData, "amount");
  if (!date || !category || !item || amount <= 0) return;

  await prisma.costRecord.update({
    where: { id: recordId },
    data: {
      date: new Date(date),
      category,
      item,
      amount,
      memo: optStr(formData, "memo"),
    },
  });
  revalidatePath(`/cultivation/${cycleId}`);
}

// ==================== 写真添付 ====================

export async function uploadPhoto(cycleId: string, formData: FormData) {
  const user = await requireUser();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "写真アップロードには Vercel Blob の設定 (BLOB_READ_WRITE_TOKEN) が必要です。"
    );
  }

  const blob = await put(`cultivation/${cycleId}/${Date.now()}-${file.name}`, file, {
    access: "public",
  });

  const target = str(formData, "target");
  const caption = optStr(formData, "caption");

  await prisma.photo.create({
    data: {
      url: blob.url,
      caption,
      uploadedById: user.id,
      cultivationCycleId: target === "cycle" ? cycleId : undefined,
      workLogId: target === "workLog" ? optStr(formData, "targetId") : undefined,
      pestDiseaseRecordId:
        target === "pestDisease" ? optStr(formData, "targetId") : undefined,
      harvestRecordId:
        target === "harvest" ? optStr(formData, "targetId") : undefined,
    },
  });
  revalidatePath(`/cultivation/${cycleId}`);
}
