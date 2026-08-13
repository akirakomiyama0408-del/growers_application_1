import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { CustomerSearchInput } from "@/components/customers/CustomerSearchInput";

export default async function CustomersPage({
  searchParams,
}: PageProps<"/customers">) {
  await requireUser();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";

  const totalCount = await prisma.customer.count({ where: { isActive: true } });

  const customers = await prisma.customer.findMany({
    where: {
      isActive: true,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { address: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { cultivationCycles: true, visitRecords: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="お客様"
        description={
          q
            ? `「${q}」の検索結果: ${customers.length}件`
            : `登録件数: ${totalCount}件`
        }
        action={
          <LinkButton href="/customers/new">＋ お客様を登録</LinkButton>
        }
      />

      <div className="mb-4">
        <CustomerSearchInput />
      </div>

      {totalCount === 0 ? (
        <EmptyState
          title="お客様がまだ登録されていません"
          description="最初のお客様を登録しましょう"
          action={
            <LinkButton href="/customers/new" size="sm">
              お客様を登録
            </LinkButton>
          }
        />
      ) : customers.length === 0 ? (
        <EmptyState
          title="該当するお客様が見つかりませんでした"
          description="お客様名または住所で再度検索してみてください"
        />
      ) : (
        <Card className="p-0">
          <Table>
            <Thead>
              <Tr className="border-t-0 hover:bg-transparent">
                <Th>お客様名</Th>
                <Th>電話番号</Th>
                <Th>住所</Th>
                <Th>作付</Th>
                <Th>訪問記録</Th>
              </Tr>
            </Thead>
            <tbody>
              {customers.map((customer) => (
                <Tr key={customer.id}>
                  <Td>
                    <Link
                      href={`/customers/${customer.id}`}
                      className="font-medium text-strawberry-600 hover:underline"
                    >
                      {customer.name}
                    </Link>
                    {customer.kana && (
                      <p className="text-xs text-ink-300">{customer.kana}</p>
                    )}
                  </Td>
                  <Td>{customer.phone ?? "-"}</Td>
                  <Td className="max-w-64 truncate">
                    {customer.address ?? "-"}
                  </Td>
                  <Td>
                    <Badge tone="leaf">
                      {customer._count.cultivationCycles}件
                    </Badge>
                  </Td>
                  <Td>
                    <Badge tone="neutral">
                      {customer._count.visitRecords}件
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
}
