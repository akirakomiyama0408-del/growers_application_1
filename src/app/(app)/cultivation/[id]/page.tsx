import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import { SelectOrOther } from "@/components/ui/SelectOrOther";
import {
  cn,
  formatCurrency,
  formatDate,
  formatNumber,
} from "@/lib/utils";
import {
  updateCycleStatus,
  createWorkLog,
  createFertilization,
  createPestDisease,
  createPesticideApplication,
  createHarvestRecord,
  createSalesRecord,
  createCostRecord,
  uploadPhoto,
} from "../actions";

const statusLabel: Record<string, string> = {
  SEEDLING: "育苗",
  PLANTED: "定植",
  GROWING: "生育中",
  HARVESTING: "収穫中",
  FINISHED: "終了",
};

const costCategoryLabel: Record<string, string> = {
  MATERIAL: "資材費",
  LABOR: "人件費",
  UTILITY: "光熱費",
  OTHER: "その他",
};

const sections = [
  { id: "overview", label: "概要" },
  { id: "worklogs", label: "作業日誌" },
  { id: "fertilization", label: "肥培管理" },
  { id: "pest", label: "病害虫" },
  { id: "pesticide", label: "農薬履歴" },
  { id: "harvest", label: "収穫" },
  { id: "sales", label: "販売" },
  { id: "cost", label: "コスト" },
  { id: "photos", label: "写真" },
];

export default async function CultivationDetailPage({
  params,
}: PageProps<"/cultivation/[id]">) {
  await requireUser();
  const { id } = await params;

  const cycle = await prisma.cultivationCycle.findUnique({
    where: { id },
    include: {
      customer: true,
      field: true,
      variety: true,
      workLogs: {
        orderBy: { workDate: "desc" },
        include: { workType: true, staff: true, photos: true },
      },
      fertilizations: {
        orderBy: { date: "desc" },
        include: { fertilizerProduct: true, staff: true },
      },
      pestDiseases: {
        orderBy: { date: "desc" },
        include: { staff: true, photos: true },
      },
      pesticides: {
        orderBy: { date: "desc" },
        include: { pesticideProduct: true, staff: true },
      },
      harvestRecords: {
        orderBy: { date: "desc" },
        include: { staff: true, photos: true },
      },
      salesRecords: {
        orderBy: { date: "desc" },
        include: { destination: true, staff: true, harvestRecord: true },
      },
      costRecords: { orderBy: { date: "desc" }, include: { staff: true } },
      photos: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!cycle) notFound();

  const [workTypes, fertilizerProducts, pesticideProducts, destinations] =
    await Promise.all([
      prisma.workType.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
      prisma.fertilizerProduct.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      }),
      prisma.pesticideProduct.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      }),
      prisma.destination.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    ]);

  const totalHarvestKg = cycle.harvestRecords.reduce((s, h) => s + h.amountKg, 0);
  const avgBrix = (() => {
    const withBrix = cycle.harvestRecords.filter((h) => h.brixLevel != null);
    if (withBrix.length === 0) return null;
    return (
      withBrix.reduce((s, h) => s + (h.brixLevel ?? 0), 0) / withBrix.length
    );
  })();
  const totalSales = cycle.salesRecords.reduce((s, r) => s + r.totalAmount, 0);
  const totalCost = cycle.costRecords.reduce((s, r) => s + r.amount, 0);
  const profit = totalSales - totalCost;

  const boundUpdateStatus = updateCycleStatus.bind(null, cycle.id);
  const boundWorkLog = createWorkLog.bind(null, cycle.id);
  const boundFertilization = createFertilization.bind(null, cycle.id);
  const boundPestDisease = createPestDisease.bind(null, cycle.id);
  const boundPesticide = createPesticideApplication.bind(null, cycle.id);
  const boundHarvest = createHarvestRecord.bind(null, cycle.id);
  const boundSales = createSalesRecord.bind(null, cycle.id);
  const boundCost = createCostRecord.bind(null, cycle.id);
  const boundPhoto = uploadPhoto.bind(null, cycle.id);

  return (
    <div>
      <PageHeader
        title={`${cycle.field.name} ・ ${cycle.variety.name}`}
        breadcrumb={
          <Link href={`/customers/${cycle.customerId}`}>
            {cycle.customer.name}
          </Link>
        }
        description={cycle.season}
        action={<Badge tone="leaf">{statusLabel[cycle.status]}</Badge>}
      />

      <nav className="mb-6 flex flex-wrap gap-1.5 rounded-2xl border border-ink-100 bg-white p-2">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-ink-400 hover:bg-cream-100 hover:text-strawberry-500"
          >
            {s.label}
          </a>
        ))}
      </nav>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <p className="text-xs font-medium text-ink-300">累計収穫量</p>
          <p className="mt-1 text-xl font-bold text-ink-500">
            {formatNumber(totalHarvestKg, "kg")}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-ink-300">平均糖度</p>
          <p className="mt-1 text-xl font-bold text-ink-500">
            {avgBrix != null ? `${avgBrix.toFixed(1)} Brix` : "-"}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-ink-300">売上合計</p>
          <p className="mt-1 text-xl font-bold text-ink-500">
            {formatCurrency(totalSales)}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-ink-300">収支(売上-コスト)</p>
          <p
            className={cn(
              "mt-1 text-xl font-bold",
              profit >= 0 ? "text-leaf-600" : "text-strawberry-600"
            )}
          >
            {formatCurrency(profit)}
          </p>
        </Card>
      </div>

      {/* 概要 */}
      <section id="overview" className="scroll-mt-4">
        <Card className="mb-6">
          <CardHeader title="概要" />
          <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <InfoItem label="育苗開始日" value={formatDate(cycle.seedlingDate)} />
            <InfoItem label="定植日" value={formatDate(cycle.plantingDate)} />
            <InfoItem label="お客様" value={cycle.customer.name} />
            <InfoItem label="区画" value={cycle.field.name} />
          </div>
          {cycle.memo && (
            <p className="mb-4 whitespace-pre-wrap rounded-xl bg-cream-50 p-3 text-sm text-ink-500">
              {cycle.memo}
            </p>
          )}
          <form action={boundUpdateStatus} className="flex items-end gap-2">
            <div className="w-48">
              <Label htmlFor="status">状態を更新</Label>
              <Select id="status" name="status" defaultValue={cycle.status}>
                {Object.entries(statusLabel).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" size="md" variant="secondary">
              更新
            </Button>
          </form>
        </Card>
      </section>

      {/* 作業日誌 */}
      <RecordSection
        id="worklogs"
        title="作業日誌"
        description="灌水・整枝・摘果・誘引などの日々の作業記録"
        form={
          <form action={boundWorkLog} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Label required>作業日</Label>
              <Input name="workDate" type="date" required />
            </div>
            <div>
              <Label required>作業種別</Label>
              <SelectOrOther
                name="workTypeId"
                options={workTypes.map((w) => ({ value: w.id, label: w.name }))}
                placeholder="作業種別を入力"
                required
              />
            </div>
            <div className="sm:col-span-1">
              <Label>内容メモ</Label>
              <Input name="content" placeholder="任意" />
            </div>
            <div className="sm:col-span-3">
              <Button type="submit" size="sm">
                記録する
              </Button>
            </div>
          </form>
        }
      >
        {cycle.workLogs.length === 0 ? (
          <EmptyState title="作業日誌はまだありません" />
        ) : (
          <ul className="flex flex-col gap-2">
            {cycle.workLogs.map((log) => (
              <li key={log.id} className="rounded-xl border border-ink-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Badge tone="leaf">{log.workType.name}</Badge>
                  <span className="text-xs text-ink-300">
                    {formatDate(log.workDate)} ・ {log.staff.name}
                  </span>
                </div>
                {log.content && (
                  <p className="mt-1.5 text-sm text-ink-500">{log.content}</p>
                )}
                <PhotoThumbs photos={log.photos} />
              </li>
            ))}
          </ul>
        )}
      </RecordSection>

      {/* 肥培管理 */}
      <RecordSection
        id="fertilization"
        title="肥培管理"
        description="施肥の種類・量・方法の記録"
        form={
          <form
            action={boundFertilization}
            className="grid grid-cols-1 gap-3 sm:grid-cols-4"
          >
            <div>
              <Label required>施肥日</Label>
              <Input name="date" type="date" required />
            </div>
            <div>
              <Label required>肥料</Label>
              <SelectOrOther
                name="fertilizerProductId"
                options={fertilizerProducts.map((f) => ({
                  value: f.id,
                  label: f.name,
                }))}
                placeholder="肥料名を入力"
                required
              />
            </div>
            <div>
              <Label>施用量</Label>
              <Input name="amount" placeholder="例: 10kg/10a" />
            </div>
            <div>
              <Label>施用方法</Label>
              <SelectOrOther
                name="method"
                options={[
                  { value: "元肥", label: "元肥" },
                  { value: "追肥", label: "追肥" },
                  { value: "液肥灌注", label: "液肥灌注" },
                ]}
              />
            </div>
            <div className="sm:col-span-4">
              <Button type="submit" size="sm">
                記録する
              </Button>
            </div>
          </form>
        }
      >
        {cycle.fertilizations.length === 0 ? (
          <EmptyState title="肥培記録はまだありません" />
        ) : (
          <ul className="flex flex-col gap-2">
            {cycle.fertilizations.map((f) => (
              <li key={f.id} className="rounded-xl border border-ink-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Badge tone="leaf">{f.fertilizerProduct.name}</Badge>
                  <span className="text-xs text-ink-300">
                    {formatDate(f.date)} ・ {f.staff.name}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-ink-500">
                  {[f.amount, f.method].filter(Boolean).join(" ・ ") || "-"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </RecordSection>

      {/* 病害虫記録 */}
      <RecordSection
        id="pest"
        title="病害虫記録"
        description="発生した病気・害虫と対応の記録"
        form={
          <form action={boundPestDisease} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Label required>発生日</Label>
              <Input name="date" type="date" required />
            </div>
            <div>
              <Label required>種別</Label>
              <Select name="type" required defaultValue="DISEASE">
                <option value="DISEASE">病気</option>
                <option value="PEST">害虫</option>
              </Select>
            </div>
            <div>
              <Label required>病害虫名</Label>
              <Input name="name" placeholder="例: うどんこ病、ハダニ" required />
            </div>
            <div>
              <Label>発生程度</Label>
              <SelectOrOther
                name="severity"
                options={[
                  { value: "軽微", label: "軽微" },
                  { value: "中程度", label: "中程度" },
                  { value: "重度", label: "重度" },
                ]}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>対応内容</Label>
              <Input name="action" placeholder="任意" />
            </div>
            <div className="sm:col-span-3">
              <Button type="submit" size="sm">
                記録する
              </Button>
            </div>
          </form>
        }
      >
        {cycle.pestDiseases.length === 0 ? (
          <EmptyState title="病害虫記録はまだありません" />
        ) : (
          <ul className="flex flex-col gap-2">
            {cycle.pestDiseases.map((p) => (
              <li key={p.id} className="rounded-xl border border-ink-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Badge tone="strawberry">
                    {p.type === "DISEASE" ? "病気" : "害虫"}: {p.name}
                  </Badge>
                  {p.severity && <Badge tone="neutral">{p.severity}</Badge>}
                  <span className="text-xs text-ink-300">
                    {formatDate(p.date)} ・ {p.staff.name}
                  </span>
                </div>
                {p.action && (
                  <p className="mt-1.5 text-sm text-ink-500">対応: {p.action}</p>
                )}
                <PhotoThumbs photos={p.photos} />
              </li>
            ))}
          </ul>
        )}
      </RecordSection>

      {/* 農薬使用履歴 */}
      <RecordSection
        id="pesticide"
        title="農薬使用履歴"
        description="使用した農薬・希釈倍率・収穫前日数の記録"
        form={
          <form action={boundPesticide} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Label required>散布日</Label>
              <Input name="date" type="date" required />
            </div>
            <div className="sm:col-span-2">
              <Label required>農薬</Label>
              <SelectOrOther
                name="pesticideProductId"
                options={pesticideProducts.map((p) => ({
                  value: p.id,
                  label: p.phiDays != null ? `${p.name}(収穫前${p.phiDays}日)` : p.name,
                }))}
                placeholder="農薬名を入力"
                required
              />
            </div>
            <div>
              <Label>希釈倍率</Label>
              <Input name="dilution" placeholder="例: 1000倍" />
            </div>
            <div>
              <Label>散布量</Label>
              <Input name="amount" placeholder="例: 200L" />
            </div>
            <div>
              <Label>対象病害虫</Label>
              <Input name="targetPest" />
            </div>
            <div className="sm:col-span-3">
              <Button type="submit" size="sm">
                記録する
              </Button>
            </div>
          </form>
        }
      >
        {cycle.pesticides.length === 0 ? (
          <EmptyState title="農薬使用履歴はまだありません" />
        ) : (
          <ul className="flex flex-col gap-2">
            {cycle.pesticides.map((p) => (
              <li key={p.id} className="rounded-xl border border-ink-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Badge tone="leaf">{p.pesticideProduct.name}</Badge>
                  <span className="text-xs text-ink-300">
                    {formatDate(p.date)} ・ {p.staff.name}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-ink-500">
                  {[p.dilution, p.amount, p.targetPest].filter(Boolean).join(" ・ ") ||
                    "-"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </RecordSection>

      {/* 収穫記録 */}
      <RecordSection
        id="harvest"
        title="収穫記録"
        description="収穫量・等級・糖度の記録"
        form={
          <form action={boundHarvest} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div>
              <Label required>収穫日</Label>
              <Input name="date" type="date" required />
            </div>
            <div>
              <Label required>収穫量(kg)</Label>
              <Input name="amountKg" type="number" step="0.1" min="0" required />
            </div>
            <div>
              <Label>等級</Label>
              <SelectOrOther
                name="grade"
                options={[
                  { value: "秀", label: "秀" },
                  { value: "優", label: "優" },
                  { value: "良", label: "良" },
                  { value: "規格外", label: "規格外" },
                ]}
              />
            </div>
            <div>
              <Label>糖度(Brix)</Label>
              <Input name="brixLevel" type="number" step="0.1" min="0" />
            </div>
            <div className="sm:col-span-4">
              <Button type="submit" size="sm">
                記録する
              </Button>
            </div>
          </form>
        }
      >
        {cycle.harvestRecords.length === 0 ? (
          <EmptyState title="収穫記録はまだありません" />
        ) : (
          <ul className="flex flex-col gap-2">
            {cycle.harvestRecords.map((h) => (
              <li key={h.id} className="rounded-xl border border-ink-100 px-4 py-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge tone="strawberry">{formatNumber(h.amountKg, "kg")}</Badge>
                  {h.grade && <Badge tone="neutral">等級: {h.grade}</Badge>}
                  {h.brixLevel != null && (
                    <Badge tone="leaf">{h.brixLevel} Brix</Badge>
                  )}
                  <span className="text-xs text-ink-300">
                    {formatDate(h.date)} ・ {h.staff.name}
                  </span>
                </div>
                <PhotoThumbs photos={h.photos} />
              </li>
            ))}
          </ul>
        )}
      </RecordSection>

      {/* 販売記録 */}
      <RecordSection
        id="sales"
        title="販売記録"
        description="販売先・単価・出荷ロット(トレーサビリティ)の記録"
        form={
          <form action={boundSales} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Label required>販売日</Label>
              <Input name="date" type="date" required />
            </div>
            <div>
              <Label required>販売先</Label>
              <SelectOrOther
                name="destinationId"
                options={destinations.map((d) => ({ value: d.id, label: d.name }))}
                placeholder="販売先を入力"
                required
              />
            </div>
            <div>
              <Label>紐づく収穫記録</Label>
              <Select name="harvestRecordId" defaultValue="">
                <option value="">指定なし</option>
                {cycle.harvestRecords.map((h) => (
                  <option key={h.id} value={h.id}>
                    {formatDate(h.date)} ・ {formatNumber(h.amountKg, "kg")}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label required>数量(kg)</Label>
              <Input name="quantityKg" type="number" step="0.1" min="0" required />
            </div>
            <div>
              <Label required>単価(円/kg)</Label>
              <Input name="unitPrice" type="number" step="1" min="0" required />
            </div>
            <div>
              <Label>出荷ロット番号</Label>
              <Input name="lotNumber" placeholder="トレーサビリティ用" />
            </div>
            <div className="sm:col-span-3">
              <Button type="submit" size="sm">
                記録する
              </Button>
            </div>
          </form>
        }
      >
        {cycle.salesRecords.length === 0 ? (
          <EmptyState title="販売記録はまだありません" />
        ) : (
          <ul className="flex flex-col gap-2">
            {cycle.salesRecords.map((s) => (
              <li key={s.id} className="rounded-xl border border-ink-100 px-4 py-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge tone="strawberry">{s.destination.name}</Badge>
                  <span className="text-sm font-bold text-ink-500">
                    {formatCurrency(s.totalAmount)}
                  </span>
                  <span className="text-xs text-ink-300">
                    ({formatNumber(s.quantityKg, "kg")} × {formatCurrency(s.unitPrice)})
                  </span>
                  {s.lotNumber && <Badge tone="neutral">ロット: {s.lotNumber}</Badge>}
                  <span className="text-xs text-ink-300">{formatDate(s.date)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </RecordSection>

      {/* コスト記録 */}
      <RecordSection
        id="cost"
        title="コスト・収支管理"
        description={`累計コスト: ${formatCurrency(totalCost)}`}
        form={
          <form action={boundCost} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div>
              <Label required>日付</Label>
              <Input name="date" type="date" required />
            </div>
            <div>
              <Label required>費目区分</Label>
              <Select name="category" required defaultValue="MATERIAL">
                <option value="MATERIAL">資材費</option>
                <option value="LABOR">人件費</option>
                <option value="UTILITY">光熱費</option>
                <option value="OTHER">その他</option>
              </Select>
            </div>
            <div>
              <Label required>費目名</Label>
              <Input name="item" placeholder="例: 苗代、防除委託費" required />
            </div>
            <div>
              <Label required>金額(円)</Label>
              <Input name="amount" type="number" step="1" min="0" required />
            </div>
            <div className="sm:col-span-4">
              <Button type="submit" size="sm">
                記録する
              </Button>
            </div>
          </form>
        }
      >
        {cycle.costRecords.length === 0 ? (
          <EmptyState title="コスト記録はまだありません" />
        ) : (
          <ul className="flex flex-col gap-2">
            {cycle.costRecords.map((c) => (
              <li key={c.id} className="rounded-xl border border-ink-100 px-4 py-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge tone="neutral">{costCategoryLabel[c.category]}</Badge>
                  <span className="text-sm font-medium text-ink-500">{c.item}</span>
                  <span className="text-sm font-bold text-strawberry-600">
                    {formatCurrency(c.amount)}
                  </span>
                  <span className="text-xs text-ink-300">{formatDate(c.date)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </RecordSection>

      {/* 写真 */}
      <RecordSection
        id="photos"
        title="写真"
        description="生育状況などの写真を記録できます"
        form={
          <form action={boundPhoto} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="target" value="cycle" />
            <div>
              <Label required>画像ファイル</Label>
              <input
                name="file"
                type="file"
                accept="image/*"
                required
                className="text-sm"
              />
            </div>
            <div>
              <Label>キャプション</Label>
              <Input name="caption" placeholder="任意" />
            </div>
            <Button type="submit" size="sm">
              アップロード
            </Button>
          </form>
        }
      >
        {cycle.photos.length === 0 ? (
          <EmptyState title="写真はまだありません" />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {cycle.photos.map((photo) => (
              <figure key={photo.id} className="overflow-hidden rounded-xl border border-ink-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.caption ?? "生育写真"}
                  className="aspect-square w-full object-cover"
                />
                {photo.caption && (
                  <figcaption className="p-2 text-xs text-ink-400">
                    {photo.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </RecordSection>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-ink-300">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ink-500">{value}</p>
    </div>
  );
}

function RecordSection({
  id,
  title,
  description,
  form,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  form: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-4">
      <Card className="mb-6">
        <CardHeader title={title} description={description} />
        <details className="group mb-4 rounded-xl bg-cream-50 p-3 open:pb-4">
          <summary className="cursor-pointer text-sm font-medium text-strawberry-500 select-none">
            ＋ 新規記録を追加
          </summary>
          <div className="mt-3">{form}</div>
        </details>
        {children}
      </Card>
    </section>
  );
}

function PhotoThumbs({ photos }: { photos: { id: string; url: string }[] }) {
  if (photos.length === 0) return null;
  return (
    <div className="mt-2 flex gap-2">
      {photos.map((p) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={p.id}
          src={p.url}
          alt=""
          className="h-14 w-14 rounded-lg object-cover"
        />
      ))}
    </div>
  );
}
