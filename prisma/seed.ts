import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
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

  await prisma.visitor.createMany({
    data: [
      { name: "江﨑専務" },
      { name: "坂田" },
      { name: "加藤" },
      { name: "小寺" },
      { name: "杉原" },
      { name: "藤田" },
      { name: "小宮山" },
    ],
    skipDuplicates: true,
  });

  console.log(`シードデータを投入しました。管理者アカウント: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
