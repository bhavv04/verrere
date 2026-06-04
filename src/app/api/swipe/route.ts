import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { googleBooksId, direction, book } = await req.json();

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await prisma.swipe.upsert({
    where: { userId_googleBooksId: { userId: user.id, googleBooksId } },
    update: { direction },
    create: { userId: user.id, googleBooksId, direction },
  });

  if (direction === "RIGHT") {
    await prisma.shelfBook.upsert({
      where: { userId_googleBooksId: { userId: user.id, googleBooksId } },
      update: {},
      create: {
        userId: user.id,
        googleBooksId,
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        description: book.description,
        rating: book.rating,
        genres: book.genres,
      },
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { googleBooksId } = await req.json();

  await prisma.swipe.deleteMany({
    where: { userId: (await prisma.user.findUnique({ where: { clerkId: userId } }))?.id, googleBooksId },
  });

  return NextResponse.json({ success: true });
}