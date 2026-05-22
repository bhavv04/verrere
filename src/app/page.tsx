"use client";

import { useEffect, useState, useRef } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import SwipeStack from "@/components/SwipeStack";
import { Book } from "@/lib/books";
import { BookOpen, Settings } from "lucide-react";

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const genresRef = useRef<string[]>([]);

  useEffect(() => {
    if (isLoaded && !user) router.push("/sign-in");
  }, [isLoaded, user]);

  useEffect(() => {
    if (user) {
      fetch("/api/user", { method: "POST" })
        .then((r) => r.json())
        .then((data) => {
          const userGenres = data.user?.genres ?? [];
          if (userGenres.length === 0) {
            router.push("/onboarding");
          } else {
            fetchBooks();
          }
        });
    }
  }, [user]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const picks = await Promise.all([
        fetch("/api/recommendations").then((r) => r.json()),
        fetch("/api/recommendations").then((r) => r.json()),
        fetch("/api/recommendations").then((r) => r.json()),
        fetch("/api/recommendations").then((r) => r.json()),
      ]);

      const genres = [...new Set(picks.map((p) => p.genre).filter(Boolean))];
      genresRef.current = genres;

      const res = await fetch(`/api/books?genres=${genres.map(encodeURIComponent).join(",")}`);
      const data = await res.json();
      setBooks(data.books ?? []);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-gray-900 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900">verso</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/shelf")}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
          >
            My Shelf
          </button>
          <button
            onClick={() => router.push("/preferences")}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
          <UserButton />
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
            <p className="text-gray-400 text-sm">Finding books for you...</p>
          </div>
        ) : books.length === 0 ? (
          <p className="text-gray-400">No books found.</p>
        ) : (
          <SwipeStack books={books} onEmpty={fetchBooks} />
        )}
      </main>
    </div>
  );
}