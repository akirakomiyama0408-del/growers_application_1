import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { RecordRow } from "@/components/ui/RecordRow";
import { formatDate, toDateInputValue } from "@/lib/utils";
import {
  createField,
  updateField,
  createVisitRecord,
  updateVisitRecord,
} from "../actions";
import { updateCultivationCycleInfo } from "../../cultivation/actions";

const statusLabel: Record<string, string> = {
  SEEDLING: "育苗",
  PLANTED: "定植",
  GROWING: "生育中",
  HARVESTING: "収穫中",
  FINISHED: "終了",
};

const fieldTypeLabel: Record<string, string> = {
  RAISED_BED: "高設栽培",
  SOIL: "土耕栽培",
};

export default async function CustomerDetailPage({
  params,
}: PageProps<"/customers/[id]">) {
  await requireUser();
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      fields: { orderBy: { createdAt: "desc" } },
      visitRecords: {
        orderBy: { visitDate: "desc" },
        include: { staff: true },
      },
      cultivationCycles: {
        orderBy: { createdAt: "desc" },
        include: { field: true, variety: true },
      },
    },
  });

  if (!customer) notFound();

  const varieties = await prisma.variety.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  const addField = createField.bind(null, customer.id);
  const addVisit = createVisitRecord.bind(null, customer.id);

  return (
    <div>
      <PageHeader
        title={customer.name}
        breadcrumb={<Link href="/customers">お客様一覧</Link>}
        description={customer.kana ?? undefined}
        action={
          <LinkButton href={`/customers/${customer.id}/edit`} variant="secondary">
            編集
          </LinkButton>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-medium text-ink-300">電話番号</p>
          <p className="mt-1 text-sm font-medium text-ink-500">
            {customer.phone ?? "-"}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-ink-300">メール</p>
          <p className="mt-1 text-sm font-medium text-ink-500">
            {customer.email ?? "-"}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-ink-300">住所</p>
          <p className="mt-1 text-sm font-medium text-ink-500">
            {customer.postalCode ? `〒${customer.postalCode} ` : ""}
            {customer.address ?? "-"}
          </p>
        </Card>
      </div>

      {customer.memo && (
        <Card className="mb-6">
          <p className="text-xs font-medium text-ink-300">メモ</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-ink-500">
            {customer.memo}
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 圃場・ハウス区画 */}
        <Card>
          <CardHeader title="圃場・ハウス区画" description="このお客様の栽培区画" />
          {customer.fields.length === 0 ? (
            <p className="mb-4 text-sm text-ink-300">
              まだ区画が登録されていません。
            </p>
          ) : (
            <ul className="mb-4 flex flex-col gap-1.5">
              {customer.fields.map((field) => (
                <RecordRow
                  key={field.id}
                  summary={
                    <div>
                      <p className="text-sm font-medium text-ink-500">
                        {field.name}
                      </p>
                      <p className="text-xs text-ink-300">
                        {fieldTypeLabel[field.type]}
                        {field.areaSqm ? ` ・ ${field.areaSqm}㎡` : ""}
                      </p>
                    </div>
                  }
                  editForm={
                    <form
                      action={updateField.bind(null, customer.id, field.id)}
                      className="flex flex-col gap-2"
                    >
                      <Input
                        name="name"
                        defaultValue={field.name}
                        placeholder="区画名 (例: 第一ハウスA)"
                        required
                      />
                      <div className="flex gap-2">
                        <Select
                          name="type"
                          defaultValue={field.type}
                          className="w-32"
                        >
                          <option value="RAISED_BED">高設栽培</option>
                          <option value="SOIL">土耕栽培</option>
                        </Select>
                        <Input
                          name="areaSqm"
                          type="number"
                          step="0.1"
                          defaultValue={field.areaSqm ?? ""}
                          placeholder="面積(㎡)"
                        />
                      </div>
                      <Input
                        name="location"
                        defaultValue={field.location ?? ""}
                        placeholder="所在地・位置メモ(任意)"
                      />
                      <Button type="submit" size="sm" className="self-start">
                        更新する
                      </Button>
                    </form>
                  }
                />
              ))}
            </ul>
          )}
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-strawberry-500 select-none">
              ＋ 区画を追加
            </summary>
            <form action={addField} className="mt-3 flex flex-col gap-2">
              <Input name="name" placeholder="区画名 (例: 第一ハウスA)" required />
              <div className="flex gap-2">
                <Select name="type" defaultValue="RAISED_BED" className="w-32">
                  <option value="RAISED_BED">高設栽培</option>
                  <option value="SOIL">土耕栽培</option>
                </Select>
                <Input
                  name="areaSqm"
                  type="number"
                  step="0.1"
                  placeholder="面積(㎡)"
                />
              </div>
              <Input name="location" placeholder="所在地・位置メモ(任意)" />
              <Button type="submit" size="sm" className="self-start">
                追加する
              </Button>
            </form>
          </details>
        </Card>

        {/* 作付(栽培記録) */}
        <Card>
          <CardHeader
            title="栽培記録(作付)"
            description="育苗から収穫までの栽培サイクル"
            action={
              customer.fields.length > 0 && (
                <LinkButton
                  href={`/cultivation/new?customerId=${customer.id}`}
                  size="sm"
                >
                  ＋ 新しい作付
                </LinkButton>
              )
            }
          />
          {customer.fields.length === 0 ? (
            <p className="text-sm text-ink-300">
              作付を開始するには、先に圃場・ハウス区画を登録してください。
            </p>
          ) : customer.cultivationCycles.length === 0 ? (
            <EmptyState title="作付はまだありません" />
          ) : (
            <ul className="flex flex-col gap-1.5">
              {customer.cultivationCycles.map((cycle) => (
                <RecordRow
                  key={cycle.id}
                  summary={
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-medium text-ink-500">
                          {cycle.field.name} ・ {cycle.variety.name}
                        </p>
                        <p className="text-xs text-ink-300">{cycle.season}</p>
                      </div>
                      <Badge tone="leaf">{statusLabel[cycle.status]}</Badge>
                    </div>
                  }
                  editForm={
                    <div>
                      <Link
                        href={`/cultivation/${cycle.id}`}
                        className="mb-3 inline-block text-xs font-medium text-strawberry-500 hover:underline"
                      >
                        作業日誌・収穫・販売などの詳細記録を見る →
                      </Link>
                      <form
                        action={updateCultivationCycleInfo.bind(null, cycle.id)}
                        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                      >
                        <div>
                          <Label required>圃場・ハウス区画</Label>
                          <Select
                            name="fieldId"
                            defaultValue={cycle.fieldId}
                            required
                          >
                            {customer.fields.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name}
                              </option>
                            ))}
                          </Select>
                        </div>
                        <div>
                          <Label required>栽培品種</Label>
                          <Select
                            name="varietyId"
                            defaultValue={cycle.varietyId}
                            required
                          >
                            {varieties.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.name}
                              </option>
                            ))}
                          </Select>
                        </div>
                        <div>
                          <Label required>作期</Label>
                          <Input name="season" defaultValue={cycle.season} required />
                        </div>
                        <div>
                          <Label>状態</Label>
                          <Select name="status" defaultValue={cycle.status}>
                            {Object.entries(statusLabel).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </Select>
                        </div>
                        <div>
                          <Label>育苗開始日</Label>
                          <Input
                            name="seedlingDate"
                            type="date"
                            defaultValue={toDateInputValue(cycle.seedlingDate)}
                          />
                        </div>
                        <div>
                          <Label>定植日</Label>
                          <Input
                            name="plantingDate"
                            type="date"
                            defaultValue={toDateInputValue(cycle.plantingDate)}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label>メモ</Label>
                          <Textarea name="memo" defaultValue={cycle.memo ?? ""} />
                        </div>
                        <div className="sm:col-span-2">
                          <Button type="submit" size="sm">
                            更新する
                          </Button>
                        </div>
                      </form>
                    </div>
                  }
                />
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* 訪問記録 */}
      <Card className="mt-6">
        <CardHeader title="訪問記録" description="お客様との対応履歴" />
        <details className="group mb-4">
          <summary className="cursor-pointer text-sm font-medium text-strawberry-500 select-none">
            ＋ 訪問記録を追加
          </summary>
          <form
            action={addVisit}
            className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            <div>
              <Label htmlFor="visitDate" required>
                訪問日
              </Label>
              <Input id="visitDate" name="visitDate" type="date" required />
            </div>
            <div>
              <Label htmlFor="purpose" required>
                訪問目的
              </Label>
              <Select id="purpose" name="purpose" required defaultValue="">
                <option value="" disabled>
                  選択してください
                </option>
                <option value="定期巡回">定期巡回</option>
                <option value="資材提案">資材提案</option>
                <option value="栽培相談対応">栽培相談対応</option>
                <option value="クレーム対応">クレーム対応</option>
                <option value="その他">その他</option>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="content" required>
                訪問内容
              </Label>
              <Textarea id="content" name="content" required />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="nextAction">次回アクション</Label>
              <Input id="nextAction" name="nextAction" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" size="sm">
                記録する
              </Button>
            </div>
          </form>
        </details>

        {customer.visitRecords.length === 0 ? (
          <EmptyState title="訪問記録はまだありません" />
        ) : (
          <ul className="flex flex-col gap-2">
            {customer.visitRecords.map((visit) => (
              <RecordRow
                key={visit.id}
                summary={
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge tone="strawberry">{visit.purpose}</Badge>
                      <span className="text-xs text-ink-300">
                        {formatDate(visit.visitDate)} ・ {visit.staff.name}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-ink-500">
                      {visit.content}
                    </p>
                    {visit.nextAction && (
                      <p className="mt-1 text-xs text-leaf-600">
                        次回: {visit.nextAction}
                      </p>
                    )}
                  </div>
                }
                editForm={
                  <form
                    action={updateVisitRecord.bind(null, customer.id, visit.id)}
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                  >
                    <div>
                      <Label required>訪問日</Label>
                      <Input
                        name="visitDate"
                        type="date"
                        defaultValue={toDateInputValue(visit.visitDate)}
                        required
                      />
                    </div>
                    <div>
                      <Label required>訪問目的</Label>
                      <Select name="purpose" defaultValue={visit.purpose} required>
                        <option value="定期巡回">定期巡回</option>
                        <option value="資材提案">資材提案</option>
                        <option value="栽培相談対応">栽培相談対応</option>
                        <option value="クレーム対応">クレーム対応</option>
                        <option value="その他">その他</option>
                      </Select>
                    </div>
                    <div className="sm:col-span-2">
                      <Label required>訪問内容</Label>
                      <Textarea name="content" defaultValue={visit.content} required />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>次回アクション</Label>
                      <Input name="nextAction" defaultValue={visit.nextAction ?? ""} />
                    </div>
                    <div className="sm:col-span-2">
                      <Button type="submit" size="sm">
                        更新する
                      </Button>
                    </div>
                  </form>
                }
              />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
