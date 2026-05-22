import { NextRequest, NextResponse } from "next/server";
import { fetchBooksByGenre } from "@/lib/books";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

function shuffle<T>(arr: T[]): T[] {
  return arr
    .map((v) => ({ v, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ v }) => v);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const genresParam = searchParams.get("genres") ?? "fiction";
  const genres = genresParam.split(",").slice(0, 5);

  const { userId } = await auth();

  try {
    // Fetch from all genres in parallel
    const results = await Promise.all(
      genres.map((g) => fetchBooksByGenre(g.trim(), 10))
    );

    // Flatten and deduplicate by id
    const seen = new Set<string>();
    const allBooks = results.flat().filter((b) => {
      if (seen.has(b.id)) return false;
      seen.add(b.id);
      return true;
    });

    // Filter out already swiped
    if (userId) {
      const user = await prisma.user.findUnique({ where: { clerkId: userId } });
      if (user) {
        const swipedBooks = await prisma.swipe.findMany({
          where: { userId: user.id },
          select: { googleBooksId: true },
        });
        const swipedIds = new Set(
          swipedBooks.map((s: { googleBooksId: string }) => s.googleBooksId)
        );
        const filtered = shuffle(allBooks.filter((b) => !swipedIds.has(b.id)));
        return NextResponse.json({ books: filtered });
      }
    }

    return NextResponse.json({ books: shuffle(allBooks) });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}