import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { requireUser } from "@/lib/session";
import { createCustomer } from "../actions";

export default async function NewCustomerPage() {
  await requireUser();
  return (
    <div>
      <PageHeader
        title="お客様を登録"
        breadcrumb={<Link href="/customers">お客様一覧</Link>}
      />
      <Card className="max-w-2xl">
        <CustomerForm action={createCustomer} />
      </Card>
    </div>
  );
}
