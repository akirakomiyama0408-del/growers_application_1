import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { Input, Label } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const callbackUrl =
    typeof params.callbackUrl === "string" ? params.callbackUrl : "/dashboard";
  const error = typeof params.error === "string" ? params.error : undefined;

  async function login(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: callbackUrl,
      });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect(`/login?error=1&callbackUrl=${encodeURIComponent(callbackUrl)}`);
      }
      throw err;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl">🍓</div>
          <h1 className="text-2xl font-black text-ink-500">農園手帖</h1>
          <p className="mt-1 text-sm text-ink-300">
            いちご農家のための顧客管理・栽培記録アプリ
          </p>
        </div>
        <form
          action={login}
          className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm"
        >
          {error && (
            <p className="mb-4 rounded-lg bg-strawberry-50 px-3 py-2 text-sm text-strawberry-600">
              メールアドレスまたはパスワードが正しくありません。
            </p>
          )}
          <div className="mb-4">
            <Label htmlFor="email" required>
              メールアドレス
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="mb-6">
            <Label htmlFor="password" required>
              パスワード
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full">
            ログイン
          </Button>
        </form>
      </div>
    </div>
  );
}
