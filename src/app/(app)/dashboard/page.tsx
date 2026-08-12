import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";

const statusLabel: Record<string, string> = {
  SEEDLING: "育苗",
  PLANTED: "定植",
  GROWING: "生育中",
  HARVESTING: "収穫中",
  FINISHED: "終了",
};

export default async function DashboardPage() {
  await requireUser();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    customerCount,
    activeCycleCount,
    monthlyHarvest,
    monthlySales,
    recentVisits,
    activeCycles,
  ] = await Promise.all([
    prisma.customer.count({ where: { isActive: true } }),
    prisma.cultivationCycle.count({
      where: { status: { in: ["PLANTED", "GROWING", "HARVESTING"] } },
    }),
    prisma.harvestRecord.aggregate({
      _sum: { amountKg: true },
      where: { date: { gte: monthStart } },
    }),
    prisma.salesRecord.aggregate({
      _sum: { totalAmount: true },
      where: { date: { gte: monthStart } },
    }),
    prisma.visitRecord.findMany({
      take: 5,
      orderBy: { visitDate: "desc" },
      include: { customer: true, staff: true },
    }),
    prisma.cultivationCycle.findMany({
      where: { status: { in: ["PLANTED", "GROWING", "HARVESTING"] } },
      take: 6,
      orderBy: { updatedAt: "desc" },
      include: { customer: true, field: true, variety: true },
    }),
  ]);

  const kpis = [
    { label: "登録お客様数", value: formatNumber(customerCount, "件") },
    { label: "栽培中の作付", value: formatNumber(activeCycleCount, "件") },
    {
      label: "今月の収穫量",
      value: formatNumber(monthlyHarvest._sum.amountKg ?? 0, "kg"),
    },
    {
      label: "今月の売上",
      value: formatCurrency(monthlySales._sum.totalAmount ?? 0),
    },
  ];

  return (
    <div>
      <PageHeader
        title="ダッシュボード"
        description="農園全体の状況をひと目で確認できます"
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <p className="text-xs font-medium text-ink-300">{kpi.label}</p>
            <p className="mt-2 text-2xl font-bold text-ink-500">{kpi.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="栽培中の作付"
            description="現在進行中の栽培サイクル"
            action={
              <Link
                href="/cultivation"
                className="text-xs font-medium text-strawberry-500 hover:underline"
              >
                すべて見る
              </Link>
            }
          />
          {activeCycles.length === 0 ? (
            <EmptyState title="栽培中の作付はまだありません" />
          ) : (
            <ul className="flex flex-col gap-2">
              {activeCycles.map((cycle) => (
                <li key={cycle.id}>
                  <Link
                    href={`/cultivation/${cycle.id}`}
                    className="flex items-center justify-between rounded-xl border border-ink-100 px-3 py-2.5 hover:bg-cream-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink-500">
                        {cycle.customer.name} / {cycle.field.name}
                      </p>
                      <p className="text-xs text-ink-300">
                        {cycle.variety.name} ・ {cycle.season}
                      </p>
                    </div>
                    <Badge tone="leaf">{statusLabel[cycle.status]}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="最近の訪問記録"
            description="直近5件の訪問記録"
            action={
              <Link
                href="/customers"
                className="text-xs font-medium text-strawberry-500 hover:underline"
              >
                お客様一覧
              </Link>
            }
          />
          {recentVisits.length === 0 ? (
            <EmptyState title="訪問記録はまだありません" />
          ) : (
            <ul className="flex flex-col gap-2">
              {recentVisits.map((visit) => (
                <li key={visit.id}>
                  <Link
                    href={`/customers/${visit.customerId}`}
                    className="block rounded-xl border border-ink-100 px-3 py-2.5 hover:bg-cream-50"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-ink-500">
                        {visit.customer.name}
                      </p>
                      <p className="text-xs text-ink-300">
                        {formatDate(visit.visitDate)}
                      </p>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-ink-300">
                      {visit.purpose} ・ {visit.content}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
