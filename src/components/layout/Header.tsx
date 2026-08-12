import { auth, signOut } from "@/lib/auth";

const roleLabel: Record<string, string> = {
  ADMIN: "管理者",
  STAFF: "スタッフ",
};

export async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="flex items-center justify-between border-b border-ink-100 bg-white px-6 py-3">
      <div className="md:hidden flex items-center gap-2">
        <span className="text-xl">🍓</span>
        <span className="font-black text-ink-500">農園手帖</span>
      </div>
      <div className="hidden md:block" />
      <div className="flex items-center gap-3">
        {user && (
          <div className="text-right leading-tight">
            <p className="text-sm font-medium text-ink-500">{user.name}</p>
            <p className="text-xs text-ink-300">
              {roleLabel[user.role] ?? user.role}
            </p>
          </div>
        )}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-400 hover:bg-cream-100"
          >
            ログアウト
          </button>
        </form>
      </div>
    </header>
  );
}
