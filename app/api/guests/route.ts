import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ゲスト登録
export async function POST(req: NextRequest) {
  try {
    const { partyId, instagramId, paymentMethod, transferReference, manuallyAdded, checkedIn } = await req.json();

    // 同じパーティに同じインスタIDで登録できないようにする
    const existing = await prisma.guest.findFirst({
      where: { partyId, instagramId },
    });

    if (existing) {
      return NextResponse.json({ error: "Already registered" }, { status: 409 });
    }

    const guest = await prisma.guest.create({
      data: {
        partyId,
        instagramId,
        paymentMethod,
        transferReference: transferReference || null,
        manuallyAdded: manuallyAdded ?? false,
        checkedIn: checkedIn ?? false,
      },
    });

    return NextResponse.json(guest, { status: 201 });
  } catch (error) {
  console.error("Guest creation error:", error);
  return NextResponse.json({ error: "Failed to register" }, { status: 500 });
}
  }
