import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// パーティ作成
export async function POST(req: NextRequest) {
  try {
    const { name, date, fee } = await req.json();

    const party = await prisma.party.create({
      data: {
        name,
        date: new Date(date),
        fee,
      },
    });

    return NextResponse.json(party, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create party" }, { status: 500 });
  }
}

// パーティ一覧取得
export async function GET() {
  try {
    const parties = await prisma.party.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json(parties);
  } catch {
    return NextResponse.json({ error: "Failed to fetch parties" }, { status: 500 });
  }
}