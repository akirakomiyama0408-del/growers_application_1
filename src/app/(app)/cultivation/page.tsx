import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn, formatDate } from "@/lib/utils";
import type { CultivationStatus } from "@/generated/prisma/client";

const statusLabel: Record<string, string> = {
  SEEDLING: "育苗",
  PLANTED: "定植",
  GROWING: "生育中",
  HARVESTING: "収穫中",
  FINISHED: "終了",
};

const statusOrder: CultivationStatus[] = [
  "SEEDLING",
  "PLANTED",
  "GROWING",
  "HARVESTING",
  "FINISHED",
];

export default async function CultivationListPage({
  searchParams,
}: PageProps<"/cultivation">) {
  await requireUser();
  const params = await searchParams;
  const statusFilter =
    typeof params.status === "string" ? params.status : undefined;

  const cycles = await prisma.cultivationCycle.findMany({
    where: statusFilter ? { status: statusFilter as CultivationStatus } : undefined,
    orderBy: { updatedAt: "desc" },
    include: { customer: true, field: true, variety: true },
  });

  return (
    <div>
      <PageHeader
        title="栽培記録"
        description="お客様ごとの作付(育苗〜収穫)を横断的に確認できます"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/cultivation"
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium",
            !statusFilter
              ? "bg-strawberry-500 text-white"
              : "bg-white text-ink-400 border border-ink-200 hover:bg-cream-100"
          )}
        >
          すべて
        </Link>
        {statusOrder.map((status) => (
          <Link
            key={status}
            href={`/cultivation?status=${status}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium",
              statusFilter === status
                ? "bg-strawberry-500 text-white"
                : "bg-white text-ink-400 border border-ink-200 hover:bg-cream-100"
            )}
          >
            {statusLabel[status]}
          </Link>
        ))}
      </div>

      {cycles.length === 0 ? (
        <EmptyState
          title="該当する作付はありません"
          description="お客様の詳細ページから新しい作付を開始できます"
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cycles.map((cycle) => (
            <Link key={cycle.id} href={`/cultivation/${cycle.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <div className="mb-2 flex items-center justify-between">
                  <Badge tone="leaf">{statusLabel[cycle.status]}</Badge>
                  <span className="text-xs text-ink-300">{cycle.season}</span>
                </div>
                <p className="font-bold text-ink-500">{cycle.customer.name}</p>
                <p className="mt-0.5 text-sm text-ink-400">
                  {cycle.field.name} ・ {cycle.variety.name}
                </p>
                <p className="mt-2 text-xs text-ink-300">
                  更新日: {formatDate(cycle.updatedAt)}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
