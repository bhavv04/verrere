import { NextRequest, NextResponse } from "next/server";
import { fetchBooksByGenre } from "@/lib/books";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const genre = searchParams.get("genre") ?? "fiction";

  const { userId } = await auth();

  try {
    const books = await fetchBooksByGenre(genre, 40);

    if (userId) {
      const user = await prisma.user.findUnique({ where: { clerkId: userId } });
      if (user) {
        const swipedBooks = await prisma.swipe.findMany({
          where: { userId: user.id },
          select: { googleBooksId: true },
        });
        const swipedIds = new Set(swipedBooks.map((s) => s.googleBooksId));
        const filtered = books.filter((b) => !swipedIds.has(b.id));
        return NextResponse.json({ books: filtered });
      }
    }

    return NextResponse.json({ books });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}