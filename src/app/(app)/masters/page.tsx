import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import {
  createVariety,
  toggleVariety,
  createDestination,
  toggleDestination,
  createWorkType,
  toggleWorkType,
  createFertilizer,
  toggleFertilizer,
  createPesticide,
  togglePesticide,
  createVisitor,
  toggleVisitor,
} from "./actions";

export default async function MastersPage() {
  await requireUser();

  const [varieties, destinations, workTypes, fertilizers, pesticides, visitors] =
    await Promise.all([
      prisma.variety.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.destination.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.workType.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.fertilizerProduct.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.pesticideProduct.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.visitor.findMany({ orderBy: { createdAt: "desc" } }),
    ]);

  return (
    <div>
      <PageHeader
        title="マスタ設定"
        description="各記録のプルダウンに表示される選択肢を管理します。無効化した項目は新規入力の選択肢から外れますが、過去の記録には影響しません。"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="栽培品種" description="例: 紅ほっぺ、あきひめ" />
          <form action={createVariety} className="mb-4 flex gap-2">
            <Input name="name" placeholder="品種名" required />
            <Button type="submit" size="sm" className="shrink-0">
              追加
            </Button>
          </form>
          <MasterList
            items={varieties}
            onToggle={toggleVariety}
            subtitle={(item) => item.description ?? undefined}
          />
        </Card>

        <Card>
          <CardHeader title="販売先" description="例: JA直売所、道の駅" />
          <form action={createDestination} className="mb-4 flex flex-col gap-2">
            <div className="flex gap-2">
              <Input name="name" placeholder="販売先名" required />
              <Input name="category" placeholder="分類(任意)" className="w-32" />
            </div>
            <Button type="submit" size="sm">
              追加
            </Button>
          </form>
          <MasterList
            items={destinations}
            onToggle={toggleDestination}
            subtitle={(item) => item.category ?? undefined}
          />
        </Card>

        <Card>
          <CardHeader title="作業種別" description="作業日誌のプルダウン" />
          <form action={createWorkType} className="mb-4 flex gap-2">
            <Input name="name" placeholder="作業種別名" required />
            <Button type="submit" size="sm" className="shrink-0">
              追加
            </Button>
          </form>
          <MasterList items={workTypes} onToggle={toggleWorkType} />
        </Card>

        <Card>
          <CardHeader title="訪問者" description="訪問記録のプルダウン(社内メンバー)" />
          <form action={createVisitor} className="mb-4 flex gap-2">
            <Input name="name" placeholder="氏名" required />
            <Button type="submit" size="sm" className="shrink-0">
              追加
            </Button>
          </form>
          <MasterList items={visitors} onToggle={toggleVisitor} />
        </Card>

        <Card>
          <CardHeader title="肥料" description="肥培管理のプルダウン" />
          <form action={createFertilizer} className="mb-4 flex gap-2">
            <Input name="name" placeholder="肥料名" required />
            <Input name="type" placeholder="種類(任意)" className="w-32" />
            <Button type="submit" size="sm" className="shrink-0">
              追加
            </Button>
          </form>
          <MasterList
            items={fertilizers}
            onToggle={toggleFertilizer}
            subtitle={(item) => item.type ?? undefined}
          />
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="農薬" description="農薬使用履歴のプルダウン" />
          <form
            action={createPesticide}
            className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-5"
          >
            <Input name="name" placeholder="農薬名" required />
            <Input name="activeIngredient" placeholder="有効成分" />
            <Input name="targetPest" placeholder="適用病害虫" />
            <Input name="defaultDilution" placeholder="標準希釈倍率" />
            <div className="flex gap-2">
              <Input
                name="phiDays"
                type="number"
                min={0}
                placeholder="収穫前日数"
              />
              <Button type="submit" size="sm" className="shrink-0">
                追加
              </Button>
            </div>
          </form>
          <MasterList
            items={pesticides}
            onToggle={togglePesticide}
            subtitle={(item) =>
              [
                item.activeIngredient,
                item.targetPest,
                item.phiDays != null ? `収穫前${item.phiDays}日` : null,
              ]
                .filter(Boolean)
                .join(" ・ ") || undefined
            }
          />
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader
          title="お客様の一括登録(CSV/Excel)"
          description="既存の顧客名簿をCSVまたはExcelファイルからまとめて取り込みます。主に導入時など、一度だけ行う作業です。"
          action={
            <LinkButton href="/customers/import" variant="secondary" size="sm">
              一括登録ページへ
            </LinkButton>
          }
        />
      </Card>
    </div>
  );
}

function MasterList<T extends { id: string; name: string; isActive: boolean }>({
  items,
  onToggle,
  subtitle,
}: {
  items: T[];
  onToggle: (id: string, isActive: boolean) => Promise<void>;
  subtitle?: (item: T) => string | undefined;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-300">まだ登録されていません。</p>;
  }
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item) => {
        const sub = subtitle?.(item);
        return (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-ink-100 px-3 py-2"
          >
            <div className="min-w-0">
              <p
                className={`truncate text-sm font-medium ${
                  item.isActive ? "text-ink-500" : "text-ink-300 line-through"
                }`}
              >
                {item.name}
              </p>
              {sub && <p className="truncate text-xs text-ink-300">{sub}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {!item.isActive && <Badge tone="neutral">無効</Badge>}
              <form action={onToggle.bind(null, item.id, !item.isActive)}>
                <button
                  type="submit"
                  className="text-xs font-medium text-ink-400 hover:text-strawberry-500"
                >
                  {item.isActive ? "無効化" : "有効化"}
                </button>
              </form>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
