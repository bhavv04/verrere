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

      {/* LEFT — Card Stack + Buttons */}
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
            className="group flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-red-300 hover:bg-red-50 transition-all shadow-sm"
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
            <span className="text-sm font-medium text-gray-500 group-hover:text-red-500 transition-colors">Pass</span>
          </button>
          <button
            onClick={() => handleSwipe("RIGHT")}
            className="group flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-violet-200 bg-violet-50 hover:bg-violet-100 hover:border-violet-400 transition-all shadow-sm"
          >
            <Heart className="w-5 h-5 text-violet-500 group-hover:text-violet-700 transition-colors" />
            <span className="text-sm font-medium text-violet-600 group-hover:text-violet-800 transition-colors">Save</span>
          </button>
        </div>

        <p className="text-gray-300 text-xs">{stack.length} books in queue</p>
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
          {/* Title */}
          <div className="mb-4">
            <h2 className="text-4xl font-bold text-gray-900 leading-tight tracking-tight">
              {currentBook.title}
            </h2>
            <p className="text-violet-600 text-lg font-medium mt-1">{currentBook.author}</p>
          </div>

          {/* Rating */}
          {currentBook.rating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(currentBook.rating!)
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-200 fill-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-400 text-sm">{currentBook.rating.toFixed(1)}</span>
            </div>
          )}

          {/* Genre pills */}
          {currentBook.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {currentBook.genres.slice(0, 5).map((g, i) => {
                const colors = [
                  "bg-violet-100 text-violet-700 border-violet-200",
                  "bg-pink-100 text-pink-700 border-pink-200",
                  "bg-emerald-100 text-emerald-700 border-emerald-200",
                  "bg-amber-100 text-amber-700 border-amber-200",
                  "bg-sky-100 text-sky-700 border-sky-200",
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

          {/* Divider */}
          <div className="h-px bg-gray-100 mb-5" />

          {/* Description */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">About</p>
            <p className={`text-gray-600 text-sm leading-relaxed ${expanded ? "" : "line-clamp-6"}`}>
              {currentBook.description}
            </p>
            {currentBook.description.length > 300 && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="text-violet-500 text-xs mt-2 hover:text-violet-700 transition-colors font-medium"
              >
                {expanded ? "Show less ↑" : "Read more ↓"}
              </button>
            )}
          </div>

          {/* Subjects */}
          {currentBook.subjects && currentBook.subjects.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Subjects</p>
              <div className="flex flex-wrap gap-1.5">
                {currentBook.subjects.slice(0, 8).map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-lg text-xs bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-6 text-gray-400 text-sm">
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