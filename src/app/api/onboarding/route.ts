import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { genres } = await req.json();
  if (!genres?.length) return NextResponse.json({ error: "No genres" }, { status: 400 });

  // Save genres to DB
  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {},
    create: { clerkId: userId, email: "" },
  });

  await prisma.userGenre.deleteMany({ where: { userId: user.id } });
  await prisma.userGenre.createMany({
    data: genres.map((genre: string) => ({ userId: user.id, genre })),
  });

  // Mark onboarded in Clerk — this is what the middleware checks
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { onboarded: true },
  });

  return NextResponse.json({ success: true });
}