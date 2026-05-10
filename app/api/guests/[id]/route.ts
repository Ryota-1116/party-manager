import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// チェックイン更新
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { checkedIn } = await req.json();

    const guest = await prisma.guest.update({
      where: { id },
      data: { checkedIn },
    });

    return NextResponse.json(guest);
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// ゲスト手動追加用（当日ゲリラ参加）
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.guest.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}