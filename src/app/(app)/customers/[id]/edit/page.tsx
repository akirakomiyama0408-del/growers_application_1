import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { updateCustomer, archiveCustomer } from "../../actions";

export default async function EditCustomerPage({
  params,
}: PageProps<"/customers/[id]/edit">) {
  await requireUser();
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) notFound();

  const action = updateCustomer.bind(null, customer.id);
  const archiveAction = archiveCustomer.bind(null, customer.id);

  return (
    <div>
      <PageHeader
        title="お客様情報を編集"
        breadcrumb={
          <Link href={`/customers/${customer.id}`}>{customer.name}</Link>
        }
      />
      <Card className="max-w-2xl">
        <CustomerForm action={action} customer={customer} />
      </Card>

      <Card className="mt-6 max-w-2xl border-strawberry-100">
        <p className="mb-2 text-sm font-bold text-strawberry-600">
          お客様の削除(無効化)
        </p>
        <p className="mb-3 text-xs text-ink-300">
          一覧から表示されなくなりますが、過去の記録データは保持されます。
        </p>
        <form action={archiveAction}>
          <button
            type="submit"
            className="rounded-full border border-strawberry-200 px-4 py-2 text-xs font-medium text-strawberry-600 hover:bg-strawberry-50"
          >
            このお客様を無効化する
          </button>
        </form>
      </Card>
    </div>
  );
}
