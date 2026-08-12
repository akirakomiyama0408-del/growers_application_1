import type { NextAuthConfig } from "next-auth";

// Edge Runtime(middleware)でも読み込めるよう、Node.js専用の依存(Prisma, bcrypt)を
// 含まない設定のみをここに切り出す。Providers は auth.ts 側で追加する。
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as { role: string }).role;
        token.id = user.id as string;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
