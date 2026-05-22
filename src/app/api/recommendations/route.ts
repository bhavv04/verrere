import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const RELATED_GENRES: Record<string, string[]> = {
  "Science Fiction": ["Fantasy", "Adventure", "Thriller"],
  "Fantasy": ["Science Fiction", "Adventure", "Historical Fiction"],
  "Mystery": ["Thriller", "Crime", "Psychology"],
  "Thriller": ["Mystery", "Crime", "Horror"],
  "Romance": ["Historical Fiction", "Fiction", "Classic"],
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

// Generic genres that shouldn't dominate
const GENERIC_GENRES = new Set(["Fiction", "Juvenile Fiction", "Juvenile Nonfiction", "Nonfiction", "General"]);

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ genre: "Fantasy" });

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      genres: true,
      shelf: { select: { genres: true } },
    },
  });

  if (!user) return NextResponse.json({ genre: "Fantasy" });

  const weights: Record<string, number> = {};

  // User's explicitly chosen genres get strong base weight
  for (const g of user.genres) {
    weights[g.genre] = (weights[g.genre] ?? 0) + 5;
  }

  // Liked books boost genres but cap generic ones
  for (const book of user.shelf) {
    for (const genre of book.genres) {
      const normalized = genre.split("/")[0].trim();
      if (GENERIC_GENRES.has(normalized)) {
        // Cap generic genres at 2
        weights[normalized] = Math.min(weights[normalized] ?? 0, 2);
      } else {
        weights[normalized] = (weights[normalized] ?? 0) + 1;
      }
    }
  }

  // Related genres with low weight, skip if already present
  for (const [genre, weight] of Object.entries(weights)) {
    if (GENERIC_GENRES.has(genre)) continue;
    const related = RELATED_GENRES[genre] ?? [];
    for (const r of related) {
      if (!weights[r]) {
        weights[r] = Math.max(1, Math.floor(weight * 0.2));
      }
    }
  }

  // Remove generic genres entirely if user has specific ones
  const specificGenres = Object.keys(weights).filter(g => !GENERIC_GENRES.has(g));
  if (specificGenres.length > 0) {
    for (const g of GENERIC_GENRES) {
      delete weights[g];
    }
  }

  if (Object.keys(weights).length === 0) {
    return NextResponse.json({ genre: "Fantasy" });
  }

  // Weighted random pick
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (const [genre, weight] of Object.entries(weights)) {
    rand -= weight;
    if (rand <= 0) {
      return NextResponse.json({ genre, weights });
    }
  }

  return NextResponse.json({ genre: specificGenres[0], weights });
}