import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// 初回デプロイ後にDBへ管理者アカウント・マスタ初期データを投入するための
// 一時的なエンドポイント。AUTH_SECRETをトークンとして要求し、実行後は削除する想定。
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token || token !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "password123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "管理者",
      email: adminEmail,
      password: passwordHash,
      role: "ADMIN",
    },
  });

  await prisma.variety.createMany({
    data: [
      { name: "紅ほっぺ" },
      { name: "あきひめ" },
      { name: "とちおとめ" },
      { name: "章姫" },
      { name: "やよいひめ" },
    ],
    skipDuplicates: true,
  });

  await prisma.workType.createMany({
    data: [
      { name: "灌水" },
      { name: "整枝" },
      { name: "摘果" },
      { name: "誘引" },
      { name: "除草" },
      { name: "受粉作業" },
      { name: "葉かき" },
      { name: "収穫" },
    ],
    skipDuplicates: true,
  });

  await prisma.destination.createMany({
    data: [
      { name: "JA直売所", category: "直売" },
      { name: "道の駅", category: "直売" },
      { name: "個人宅配", category: "EC" },
      { name: "卸売市場", category: "卸売" },
    ],
    skipDuplicates: true,
  });

  await prisma.fertilizerProduct.createMany({
    data: [
      { name: "液肥(液体肥料A)", type: "液肥" },
      { name: "有機質肥料", type: "有機肥料" },
      { name: "酸素爆誕", type: "化成肥料" },
      { name: "IB化成", type: "化成肥料" },
    ],
    skipDuplicates: true,
  });

  await prisma.pesticideProduct.createMany({
    data: [
      {
        name: "ダコニール1000",
        activeIngredient: "TPN",
        targetPest: "うどんこ病",
        phiDays: 3,
      },
      {
        name: "コテツフロアブル",
        activeIngredient: "シエノピラフェン",
        targetPest: "ハダニ類",
        phiDays: 1,
      },
    ],
    skipDuplicates: true,
  });

  return NextResponse.json({ ok: true, adminEmail });
}
