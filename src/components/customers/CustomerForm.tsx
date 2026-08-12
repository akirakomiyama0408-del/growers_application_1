import { Input, Label, Textarea } from "@/components/ui/Field";
import { Button, LinkButton } from "@/components/ui/Button";
import type { Customer } from "@/generated/prisma/client";

export function CustomerForm({
  action,
  customer,
}: {
  action: (formData: FormData) => Promise<void>;
  customer?: Customer;
}) {
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name" required>
            お客様名
          </Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={customer?.name}
            placeholder="例: 山田農園 / 山田太郎"
          />
        </div>
        <div>
          <Label htmlFor="kana">ふりがな</Label>
          <Input id="kana" name="kana" defaultValue={customer?.kana ?? ""} />
        </div>
        <div>
          <Label htmlFor="phone">電話番号</Label>
          <Input id="phone" name="phone" defaultValue={customer?.phone ?? ""} />
        </div>
        <div>
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={customer?.email ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="postalCode">郵便番号</Label>
          <Input
            id="postalCode"
            name="postalCode"
            defaultValue={customer?.postalCode ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="address">住所</Label>
          <Input id="address" name="address" defaultValue={customer?.address ?? ""} />
        </div>
      </div>
      <div>
        <Label htmlFor="memo">メモ</Label>
        <Textarea id="memo" name="memo" defaultValue={customer?.memo ?? ""} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <LinkButton
          href={customer ? `/customers/${customer.id}` : "/customers"}
          variant="secondary"
        >
          キャンセル
        </LinkButton>
        <Button type="submit">{customer ? "更新する" : "登録する"}</Button>
      </div>
    </form>
  );
}
