"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Trash2, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";

interface ShelfBook {
  id: string;
  googleBooksId: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  rating: number | null;
  genres: string[];
}

export default function ShelfPage() {
  const router = useRouter();
  const [books, setBooks] = useState<ShelfBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<ShelfBook | null>(null);

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
    <div className="bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100">
        <Navbar />
        <main className="min-h-screen py-26 max-w-7xl mx-auto">
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
                onClick={() => router.push("/app")}
                className="mt-6 px-5 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:opacity-80 transition-opacity"
                >
                Start swiping →
                </button>
            </div>
            ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {books.map((book) => (
                <div
                    key={book.id}
                    className="flex flex-col gap-2 group cursor-pointer"
                    onClick={() => setSelectedBook(book)}
                >
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

        {/* Book Detail Modal */}
        <AnimatePresence>
            {selectedBook && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
                onClick={() => setSelectedBook(null)}
            >
                <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white dark:bg-[#1a1916] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 flex flex-col gap-5"
                onClick={(e) => e.stopPropagation()}
                >
                {/* Header */}
                <div className="flex gap-4">
                    <div className="w-24 h-36 rounded-xl overflow-hidden flex-shrink-0 bg-[#f0ece4] dark:bg-[#0f0e0c]">
                    {selectedBook.coverUrl ? (
                        <img src={selectedBook.coverUrl} alt={selectedBook.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-[#c8c0b0]" />
                        </div>
                    )}
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                    <h2 className="text-xl font-bold text-[#1a1a2e] dark:text-[#f0ece4] leading-tight">{selectedBook.title}</h2>
                    <p className="text-amber-600 dark:text-amber-400 text-sm font-medium">{selectedBook.author}</p>
                    {selectedBook.rating && (
                        <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-3 h-3 ${
                                star <= Math.round(selectedBook.rating!)
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-[#e8e4dc] dark:text-[#2a2825] fill-[#e8e4dc] dark:fill-[#2a2825]"
                                }`}
                            />
                            ))}
                        </div>
                        <span className="text-[#9ca3af] text-xs">{selectedBook.rating.toFixed(1)}</span>
                        </div>
                    )}
                    {selectedBook.genres && selectedBook.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                        {selectedBook.genres.slice(0, 3).map((g) => (
                            <span
                            key={g}
                            className="px-2 py-0.5 rounded-full text-xs border border-[#e8e4dc] dark:border-[#2a2825] text-[#6b7280] dark:text-[#9ca3af]"
                            >
                            {g}
                            </span>
                        ))}
                        </div>
                    )}
                    </div>
                </div>

                <div className="h-px bg-[#e8e4dc] dark:bg-[#2a2825]" />

                {/* Description */}
                {selectedBook.description && (
                    <div>
                    <p className="text-xs font-semibold text-[#9ca3af] uppercase mb-2">About</p>
                    <p className="text-[#4b5563] dark:text-[#9ca3af] text-sm leading-relaxed">{selectedBook.description}</p>
                    </div>
                )}

                {/* Remove button */}
                <button
                    onClick={() => {
                    handleRemove(selectedBook.googleBooksId);
                    setSelectedBook(null);
                    }}
                    className="w-full py-2.5 rounded-xl border border-red-200 dark:border-red-900 text-red-500 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                >
                    Remove from shelf
                </button>
                </motion.div>
            </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}