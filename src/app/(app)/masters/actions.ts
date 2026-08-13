"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optStr(formData: FormData, key: string): string | null {
  const value = str(formData, key);
  return value === "" ? null : value;
}

function optInt(formData: FormData, key: string): number | null {
  const value = str(formData, key);
  if (value === "") return null;
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? null : n;
}

async function guard() {
  await requireUser();
}

// ---- 品種 ----
export async function createVariety(formData: FormData) {
  await guard();
  const name = str(formData, "name");
  if (!name) return;
  await prisma.variety.create({
    data: { name, description: optStr(formData, "description") },
  });
  revalidatePath("/masters");
}

export async function toggleVariety(id: string, isActive: boolean) {
  await guard();
  await prisma.variety.update({ where: { id }, data: { isActive } });
  revalidatePath("/masters");
}

// ---- 販売先 ----
export async function createDestination(formData: FormData) {
  await guard();
  const name = str(formData, "name");
  if (!name) return;
  await prisma.destination.create({
    data: {
      name,
      category: optStr(formData, "category"),
      memo: optStr(formData, "memo"),
    },
  });
  revalidatePath("/masters");
}

export async function toggleDestination(id: string, isActive: boolean) {
  await guard();
  await prisma.destination.update({ where: { id }, data: { isActive } });
  revalidatePath("/masters");
}

// ---- 作業種別 ----
export async function createWorkType(formData: FormData) {
  await guard();
  const name = str(formData, "name");
  if (!name) return;
  await prisma.workType.create({ data: { name } });
  revalidatePath("/masters");
}

export async function toggleWorkType(id: string, isActive: boolean) {
  await guard();
  await prisma.workType.update({ where: { id }, data: { isActive } });
  revalidatePath("/masters");
}

// ---- 肥料 ----
export async function createFertilizer(formData: FormData) {
  await guard();
  const name = str(formData, "name");
  if (!name) return;
  await prisma.fertilizerProduct.create({
    data: { name, type: optStr(formData, "type") },
  });
  revalidatePath("/masters");
}

export async function toggleFertilizer(id: string, isActive: boolean) {
  await guard();
  await prisma.fertilizerProduct.update({ where: { id }, data: { isActive } });
  revalidatePath("/masters");
}

// ---- 農薬 ----
export async function createPesticide(formData: FormData) {
  await guard();
  const name = str(formData, "name");
  if (!name) return;
  await prisma.pesticideProduct.create({
    data: {
      name,
      activeIngredient: optStr(formData, "activeIngredient"),
      targetPest: optStr(formData, "targetPest"),
      defaultDilution: optStr(formData, "defaultDilution"),
      phiDays: optInt(formData, "phiDays"),
    },
  });
  revalidatePath("/masters");
}

export async function togglePesticide(id: string, isActive: boolean) {
  await guard();
  await prisma.pesticideProduct.update({ where: { id }, data: { isActive } });
  revalidatePath("/masters");
}

// ---- 訪問者 ----
export async function createVisitor(formData: FormData) {
  await guard();
  const name = str(formData, "name");
  if (!name) return;
  await prisma.visitor.create({ data: { name } });
  revalidatePath("/masters");
}

export async function toggleVisitor(id: string, isActive: boolean) {
  await guard();
  await prisma.visitor.update({ where: { id }, data: { isActive } });
  revalidatePath("/masters");
}
