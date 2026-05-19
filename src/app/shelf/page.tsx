"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ArrowLeft, Trash2, Star } from "lucide-react";

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
    <div className="min-h-screen bg-black text-white">
      <nav className="flex items-center gap-4 px-6 py-4 border-b border-white/10">
        <button
          onClick={() => router.push("/")}
          className="text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          <span className="font-semibold tracking-tight">my shelf</span>
        </div>
        <span className="text-white/30 text-sm ml-auto">{books.length} books</span>
      </nav>

      <main className="px-6 py-8 max-w-4xl mx-auto">
        {loading ? (
          <p className="text-white/40">Loading shelf...</p>
        ) : books.length === 0 ? (
          <div className="text-center mt-20">
            <p className="text-white/40 text-lg">Your shelf is empty.</p>
            <p className="text-white/30 text-sm mt-2">
              Swipe right on books you like to save them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {books.map((book) => (
              <div key={book.id} className="flex flex-col gap-2 group relative">
                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-neutral-900 relative">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-neutral-600" />
                    </div>
                  )}
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(book.googleBooksId)}
                    disabled={removing === book.googleBooksId}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight line-clamp-2">{book.title}</p>
                  <p className="text-xs text-white/50 mt-0.5">{book.author}</p>
                  {book.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-white/60">{book.rating.toFixed(1)}</span>
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