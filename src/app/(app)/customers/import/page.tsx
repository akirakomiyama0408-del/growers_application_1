import Link from "next/link";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import { CUSTOMER_IMPORT_COLUMNS } from "@/lib/customerImport";
import { importCustomers } from "../actions";

export default async function ImportCustomersPage({
  searchParams,
}: PageProps<"/customers/import">) {
  await requireUser();
  const params = await searchParams;

  const created =
    typeof params.created === "string" ? Number(params.created) : undefined;
  const skippedCount =
    typeof params.skipped === "string" ? Number(params.skipped) : undefined;
  const reasons: string[] =
    typeof params.reasons === "string" ? JSON.parse(params.reasons) : [];
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <div>
      <PageHeader
        title="お客様を一括登録"
        breadcrumb={<Link href="/masters">マスタ設定</Link>}
        description="既存の顧客名簿をCSVまたはExcelファイルから取り込みます"
      />

      {error && (
        <Card className="mb-6 border-strawberry-200 bg-strawberry-50">
          <p className="text-sm text-strawberry-600">{error}</p>
        </Card>
      )}

      {created !== undefined && (
        <Card className="mb-6 border-leaf-100 bg-leaf-50">
          <p className="text-sm font-medium text-leaf-600">
            {created}件のお客様を登録しました。
            {skippedCount ? `(${skippedCount}件はスキップされました)` : ""}
          </p>
          {reasons.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-xs text-ink-400">
              {reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
          {skippedCount !== undefined && skippedCount > reasons.length && (
            <p className="mt-1 text-xs text-ink-300">
              ほか{skippedCount - reasons.length}件
            </p>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="① テンプレートをダウンロード"
            description="1行目の見出しは変更しないでください。2行目はサンプルです(削除してご利用ください)。"
          />
          <div className="mb-4 flex flex-wrap gap-2">
            <LinkButton
              href="/templates/customers_template.xlsx"
              variant="secondary"
              size="sm"
            >
              Excelテンプレート(.xlsx)
            </LinkButton>
            <LinkButton
              href="/templates/customers_template.csv"
              variant="secondary"
              size="sm"
            >
              CSVテンプレート(.csv)
            </LinkButton>
          </div>
          <p className="mb-2 text-xs font-medium text-ink-400">列の説明</p>
          <ul className="flex flex-col gap-1.5">
            {CUSTOMER_IMPORT_COLUMNS.map((col) => (
              <li
                key={col.field}
                className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-1.5 text-sm"
              >
                <span className="font-medium text-ink-500">{col.header}</span>
                <span className="text-xs text-ink-300">
                  {col.required ? "必須" : "任意"}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="② ファイルをアップロード"
            description="お客様名が空欄の行はスキップされます。既存データとの重複チェックは行われません。"
          />
          <form action={importCustomers} className="flex flex-col gap-4">
            <input
              name="file"
              type="file"
              accept=".csv,.xlsx,.xls"
              required
              className="text-sm"
            />
            <Button type="submit" className="self-start">
              取り込む
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
