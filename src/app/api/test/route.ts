import { NextResponse } from "next/server";
import { fetchBooksByGenre } from "@/lib/books";

export async function GET() {
  const books = await fetchBooksByGenre("Fantasy", 5);
  return NextResponse.json({ count: books.length, books });
}