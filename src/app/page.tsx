"use client";

import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import SwipeStack from "@/components/SwipeStack";
import { Book } from "@/lib/books";
import { BookOpen } from "lucide-react";

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState<string[]>([]);
  const [currentGenreIndex, setCurrentGenreIndex] = useState(0);

  useEffect(() => {
    if (isLoaded && !user) router.push("/sign-in");
  }, [isLoaded, user]);

  useEffect(() => {
    if (user) {
      fetch("/api/user", { method: "POST" })
        .then((r) => r.json())
        .then((data) => {
          const userGenres = data.user?.genres?.map((g: any) => g.genre) ?? [];
          if (userGenres.length > 0) {
            setGenres(userGenres);
          } else {
            setGenres(["fiction"]);
          }
        });
    }
  }, [user]);

  useEffect(() => {
    if (genres.length > 0) fetchBooks();
  }, [genres, currentGenreIndex]);

  const fetchBooks = async () => {
    setLoading(true);
    const genre = genres[currentGenreIndex % genres.length];
    try {
      const res = await fetch(`/api/books?genre=${genre}`);
      const data = await res.json();
      setBooks(data.books ?? []);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEmpty = () => {
    setCurrentGenreIndex((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          <span className="font-semibold tracking-tight">verso</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/shelf")}
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            My Shelf
          </button>
          <UserButton />
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {loading ? (
          <p className="text-white/40">Loading books...</p>
        ) : books.length === 0 ? (
          <p className="text-white/40">No books found.</p>
        ) : (
          <>
            <p className="text-white/30 text-xs mb-4 uppercase tracking-widest">
              {genres[currentGenreIndex % genres.length]}
            </p>
            <SwipeStack books={books} onEmpty={handleEmpty} />
          </>
        )}
      </main>
    </div>
  );
}