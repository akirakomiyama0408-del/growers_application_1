import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { Button, LinkButton } from "@/components/ui/Button";
import { createCultivationCycle } from "../actions";

export default async function NewCultivationCyclePage({
  searchParams,
}: PageProps<"/cultivation/new">) {
  await requireUser();
  const params = await searchParams;
  const customerId =
    typeof params.customerId === "string" ? params.customerId : undefined;
  if (!customerId) notFound();

  const [customer, varieties] = await Promise.all([
    prisma.customer.findUnique({
      where: { id: customerId },
      include: { fields: { where: { isActive: true } } },
    }),
    prisma.variety.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  if (!customer) notFound();

  const currentYear = new Date().getFullYear();

  return (
    <div>
      <PageHeader
        title="新しい作付を開始"
        breadcrumb={<Link href={`/customers/${customer.id}`}>{customer.name}</Link>}
      />
      <Card className="max-w-2xl">
        <form action={createCultivationCycle} className="flex flex-col gap-4">
          <input type="hidden" name="customerId" value={customer.id} />

          <div>
            <Label htmlFor="fieldId" required>
              圃場・ハウス区画
            </Label>
            <Select id="fieldId" name="fieldId" required defaultValue="">
              <option value="" disabled>
                選択してください
              </option>
              {customer.fields.map((field) => (
                <option key={field.id} value={field.id}>
                  {field.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="varietyId" required>
              栽培品種
            </Label>
            <Select id="varietyId" name="varietyId" required defaultValue="">
              <option value="" disabled>
                選択してください
              </option>
              {varieties.map((variety) => (
                <option key={variety.id} value={variety.id}>
                  {variety.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="season" required>
                作期
              </Label>
              <Input
                id="season"
                name="season"
                required
                defaultValue={`${currentYear}年度 冬春作`}
              />
            </div>
            <div>
              <Label htmlFor="status">現在の状態</Label>
              <Select id="status" name="status" defaultValue="SEEDLING">
                <option value="SEEDLING">育苗</option>
                <option value="PLANTED">定植</option>
                <option value="GROWING">生育中</option>
                <option value="HARVESTING">収穫中</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="seedlingDate">育苗開始日</Label>
              <Input id="seedlingDate" name="seedlingDate" type="date" />
            </div>
            <div>
              <Label htmlFor="plantingDate">定植日</Label>
              <Input id="plantingDate" name="plantingDate" type="date" />
            </div>
          </div>

          <div>
            <Label htmlFor="memo">メモ</Label>
            <Textarea id="memo" name="memo" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <LinkButton href={`/customers/${customer.id}`} variant="secondary">
              キャンセル
            </LinkButton>
            <Button type="submit">作付を開始する</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
