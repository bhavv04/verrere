import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { fetchBulkBooks, Book } from "@/lib/books";

const GENERIC = new Set(["Fiction", "Juvenile Fiction", "Juvenile Nonfiction", "Nonfiction", "General"]);
const FALLBACK_GENRES = ["Fantasy", "Science Fiction", "Mystery", "Thriller", "Historical Fiction"];

const RELATED_GENRES: Record<string, string[]> = {
  "Science Fiction": ["Fantasy", "Adventure", "Thriller"],
  "Fantasy": ["Science Fiction", "Adventure", "Historical Fiction"],
  "Mystery": ["Thriller", "Crime", "Psychology"],
  "Thriller": ["Mystery", "Crime", "Horror"],
  "Romance": ["Historical Fiction", "Classic"],
  "Horror": ["Thriller", "Mystery", "Fantasy"],
  "Historical Fiction": ["Classic", "Biography", "Adventure"],
  "Biography": ["Psychology", "Philosophy"],
  "Self Help": ["Psychology", "Philosophy"],
  "Philosophy": ["Psychology", "Classic"],
  "Psychology": ["Philosophy", "Self Help"],
  "Classic": ["Historical Fiction", "Fiction"],
  "Adventure": ["Science Fiction", "Fantasy", "Thriller"],
  "Crime": ["Mystery", "Thriller"],
  "Fiction": ["Classic", "Historical Fiction"],
};

function shuffle<T>(arr: T[]): T[] {
  return arr.map((v) => ({ v, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ v }) => v);
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ books: [] });

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
        genres: true,
        shelf: { select: { genres: true, googleBooksId: true } },
        swipes: { select: { googleBooksId: true } },
    },
    });

  if (!user) return NextResponse.json({ books: [] });

  // Build weights
  const weights: Record<string, number> = {};
  for (const g of user.genres) {
    weights[g.genre] = (weights[g.genre] ?? 0) + 5;
  }
  for (const book of user.shelf) {
    for (const genre of book.genres) {
      const n = genre.split("/")[0].trim();
      if (!GENERIC.has(n)) weights[n] = (weights[n] ?? 0) + 1;
    }
  }
  for (const [genre, weight] of Object.entries(weights)) {
    if (GENERIC.has(genre)) continue;
    for (const r of RELATED_GENRES[genre] ?? []) {
      if (!weights[r]) weights[r] = Math.max(1, Math.floor(weight * 0.2));
    }
  }
  const specific = Object.keys(weights).filter((g) => !GENERIC.has(g));
  if (specific.length > 0) {
    for (const g of GENERIC) delete weights[g];
  }

  let topGenres = Object.entries(weights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([g]) => g);

  if (topGenres.length < 3) {
    for (const g of FALLBACK_GENRES) {
      if (!topGenres.includes(g)) topGenres.push(g);
      if (topGenres.length >= 5) break;
    }
  }

    const swipedIds = new Set([
    ...user.swipes.map((s) => s.googleBooksId),
    ...user.shelf.map((s) => s.googleBooksId),
    ]);

  // Single bulk query — fetch 60 books across all genres at once
  const books = await fetchBulkBooks(topGenres, 60);

  const seen = new Set<string>();
  const filtered: Book[] = books.filter((b) => {
    if (seen.has(b.id) || swipedIds.has(b.id)) return false;
    seen.add(b.id);
    return true;
  });

  // Fallback if bulk returns nothing
  if (filtered.length === 0) {
    const fallback = await fetchBulkBooks(FALLBACK_GENRES, 60);
    return NextResponse.json({ books: shuffle(fallback), genres: FALLBACK_GENRES });
  }

  return NextResponse.json({ books: shuffle(filtered), genres: topGenres });
}