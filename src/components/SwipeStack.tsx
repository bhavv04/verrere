"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BookCard from "./BookCard";
import { Book } from "@/lib/books";
import { X, Heart, BookOpen, Star, Calendar, Layers } from "lucide-react";

interface SwipeStackProps {
  books: Book[];
  onEmpty: () => void;
}

export default function SwipeStack({ books, onEmpty }: SwipeStackProps) {
  const [stack, setStack] = useState<Book[]>(books);
  const [lastDirection, setLastDirection] = useState<"LEFT" | "RIGHT" | null>(null);
  const [expanded, setExpanded] = useState(false);

  const currentBook = stack[stack.length - 1];

  const handleSwipe = async (direction: "LEFT" | "RIGHT") => {
    const book = stack[stack.length - 1];
    if (!book) return;

    setLastDirection(direction);
    setExpanded(false);
    setStack((prev) => prev.slice(0, -1));

    if (stack.length === 1) onEmpty();

    await fetch("/api/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ googleBooksId: book.id, direction, book }),
    });
  };

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-12 w-full max-w-5xl mx-auto">

      {/* LEFT — Card + Buttons */}
      <div className="flex flex-col items-center gap-6 flex-shrink-0">
        <div className="relative w-[260px] h-[390px]">
          <AnimatePresence>
            {stack.slice(-2).map((book, i) => {
              const isTop = i === stack.slice(-2).length - 1;
              return (
                <motion.div
                  key={book.id}
                  className="absolute inset-0"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{
                    x: lastDirection === "RIGHT" ? 400 : -400,
                    rotate: lastDirection === "RIGHT" ? 25 : -25,
                    opacity: 0,
                    transition: { duration: 0.3 },
                  }}
                >
                  <BookCard book={book} onSwipe={handleSwipe} isTop={isTop} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => handleSwipe("LEFT")}
            className="group flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[#e8e4dc] bg-white hover:border-red-300 hover:bg-red-50 transition-all shadow-sm"
          >
            <X className="w-5 h-5 text-[#9ca3af] group-hover:text-red-500 transition-colors" />
            <span className="text-sm font-medium text-[#6b7280] group-hover:text-red-500 transition-colors">Pass</span>
          </button>
          <button
            onClick={() => handleSwipe("RIGHT")}
            className="group flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 hover:border-amber-400 transition-all shadow-sm"
          >
            <Heart className="w-5 h-5 text-amber-500 group-hover:text-amber-700 transition-colors" />
            <span className="text-sm font-medium text-amber-600 group-hover:text-amber-800 transition-colors">Save</span>
          </button>
        </div>

        <p className="text-[#9ca3af] text-xs">{stack.length} books in queue</p>
      </div>

      {/* RIGHT — Details */}
      {currentBook && (
        <motion.div
          key={currentBook.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 min-w-0 pt-1"
        >
          <div className="mb-4">
            <h2 className="text-4xl font-bold text-[#1a1a2e] leading-tight tracking-tight">
              {currentBook.title}
            </h2>
            <p className="text-amber-600 text-lg font-medium mt-1">{currentBook.author}</p>
          </div>

          {currentBook.rating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(currentBook.rating!)
                        ? "text-amber-400 fill-amber-400"
                        : "text-[#e8e4dc] fill-[#e8e4dc]"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[#9ca3af] text-sm">{currentBook.rating.toFixed(1)}</span>
            </div>
          )}

          {currentBook.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {currentBook.genres.slice(0, 5).map((g, i) => {
                const colors = [
                  "bg-[#1a1a2e]/10 text-[#1a1a2e] border-[#1a1a2e]/20",
                  "bg-amber-100 text-amber-800 border-amber-200",
                  "bg-emerald-100 text-emerald-800 border-emerald-200",
                  "bg-rose-100 text-rose-800 border-rose-200",
                  "bg-sky-100 text-sky-800 border-sky-200",
                ];
                return (
                  <span
                    key={g}
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[i % colors.length]}`}
                  >
                    {g}
                  </span>
                );
              })}
            </div>
          )}

          <div className="h-px bg-[#e8e4dc] mb-5" />

          <div className="mb-5">
            <p className="text-xs font-semibold text-[#9ca3af] uppercase tracking-widest mb-2">About</p>
            <p className={`text-[#374151] text-sm leading-relaxed ${expanded ? "" : "line-clamp-6"}`}>
              {currentBook.description}
            </p>
            {currentBook.description.length > 300 && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="text-amber-600 text-xs mt-2 hover:text-amber-800 transition-colors font-medium"
              >
                {expanded ? "Show less ↑" : "Read more ↓"}
              </button>
            )}
          </div>

          {currentBook.subjects && currentBook.subjects.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-[#9ca3af] uppercase tracking-widest mb-2">Subjects</p>
              <div className="flex flex-wrap gap-1.5">
                {currentBook.subjects.slice(0, 8).map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-lg text-xs bg-[#f0ece4] text-[#6b7280] hover:bg-[#e8e4dc] transition-colors"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-6 text-[#9ca3af] text-sm">
            {currentBook.pageCount && (
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                {currentBook.pageCount.toLocaleString()} pages
              </span>
            )}
            {currentBook.publishedDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {currentBook.publishedDate.slice(0, 4)}
              </span>
            )}
            {currentBook.editions && (
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                {currentBook.editions} editions
              </span>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}