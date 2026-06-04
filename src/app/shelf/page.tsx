"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Trash2, Star } from "lucide-react";
import Navbar from "@/components/Navbar";

interface ShelfBook {
  id: string;
  googleBooksId: string;
  title: string;
  author: string;
  coverUrl: string;
  rating: number | null;
  genres: string[];
}

export default function ShelfPage() {
  const router = useRouter();
  const [books, setBooks] = useState<ShelfBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/shelf")
      .then((r) => r.json())
      .then((d) => setBooks(d.books ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (googleBooksId: string) => {
    setRemoving(googleBooksId);
    await fetch("/api/shelf", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ googleBooksId }),
    });
    setBooks((prev) => prev.filter((b) => b.googleBooksId !== googleBooksId));
    setRemoving(null);
  };

  return (
    <div className="bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
        <Navbar />
        <main className="min-h-screen py-24 px-12 max-w-7xl mx-auto">
            {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 animate-pulse">
                {[...Array(10)].map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                    <div className="aspect-[2/3] rounded-xl bg-stone-200 dark:bg-stone-800" />
                    <div className="flex flex-col gap-1.5">
                    <div className="h-3 w-full rounded-full bg-stone-200 dark:bg-stone-800" />
                    <div className="h-3 w-2/3 rounded-full bg-stone-200 dark:bg-stone-800" />
                    <div className="h-2.5 w-1/2 rounded-full bg-stone-200 dark:bg-stone-800 mt-0.5" />
                    </div>
                </div>
                ))}
            </div>
            ) : books.length === 0 ? (
            <div className="text-center mt-24">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-stone-300 dark:text-stone-600" />
                </div>
                <p className="text-stone-500 text-lg font-medium">Your shelf is empty</p>
                <p className="text-stone-400 text-sm mt-1">Swipe right on books you like to save them here.</p>
                <button
                onClick={() => router.push("/")}
                className="mt-6 px-5 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:opacity-80 transition-opacity"
                >
                Start swiping →
                </button>
            </div>
            ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {books.map((book) => (
                <div key={book.id} className="flex flex-col gap-2 group">
                    <div className="aspect-[2/3] rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 relative shadow-sm">
                    {book.coverUrl ? (
                        <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-stone-300 dark:text-stone-600" />
                        </div>
                    )}
                    <button
                        onClick={() => handleRemove(book.googleBooksId)}
                        disabled={removing === book.googleBooksId}
                        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white/80 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-950 border border-stone-200 dark:border-stone-700"
                    >
                        <Trash2 className="w-3.5 h-3.5 text-stone-400 hover:text-red-500 transition-colors" />
                    </button>
                    </div>
                    <div>
                    <p className="text-sm font-semibold leading-tight line-clamp-2">{book.title}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{book.author}</p>
                    {book.rating && (
                        <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs text-stone-400">{book.rating.toFixed(1)}</span>
                        </div>
                    )}
                    </div>
                </div>
                ))}
            </div>
            )}
        </main>
    </div>
  );
}