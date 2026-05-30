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
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1a2e]">
      <nav className="flex items-center gap-4 px-8 py-4 bg-white border-b border-[#e8e4dc] sticky top-0 z-10 shadow-sm">
        <button onClick={() => router.push("/")} className="text-[#6b7280] hover:text-[#1a1a2e] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1a1a2e] flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">my shelf</span>
        </div>
        <span className="text-[#9ca3af] text-sm ml-auto">{books.length} books</span>
      </nav>

      <main className="px-8 py-8 max-w-5xl mx-auto">
        {loading ? (
          <div className="flex justify-center mt-20">
            <div className="w-8 h-8 rounded-full border-4 border-[#e8e4dc] border-t-[#1a1a2e] animate-spin" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center mt-24">
            <div className="w-16 h-16 rounded-2xl bg-[#f0ece4] flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-[#c8c0b0]" />
            </div>
            <p className="text-[#6b7280] text-lg font-medium">Your shelf is empty</p>
            <p className="text-[#9ca3af] text-sm mt-1">Swipe right on books you like to save them here.</p>
            <button
              onClick={() => router.push("/")}
              className="mt-6 px-5 py-2.5 rounded-xl bg-[#1a1a2e] text-white text-sm font-medium hover:bg-[#2d2d4e] transition-colors"
            >
              Start swiping →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {books.map((book) => (
              <div key={book.id} className="flex flex-col gap-2 group">
                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[#f0ece4] relative shadow-sm border border-[#e8e4dc]">
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-[#c8c0b0]" />
                    </div>
                  )}
                  <button
                    onClick={() => handleRemove(book.googleBooksId)}
                    disabled={removing === book.googleBooksId}
                    className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 border border-[#e8e4dc]"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#6b7280] hover:text-red-500" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1a1a2e] leading-tight line-clamp-2">{book.title}</p>
                  <p className="text-xs text-amber-600 mt-0.5">{book.author}</p>
                  {book.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-[#9ca3af]">{book.rating.toFixed(1)}</span>
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