import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 訪問者マスタの初期データを本番DBへ投入する一時エンドポイント。実行後は削除する想定。
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token || token !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await prisma.visitor.createMany({
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

  return NextResponse.json({ ok: true, created: result.count });
}
