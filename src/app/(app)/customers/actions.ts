"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
