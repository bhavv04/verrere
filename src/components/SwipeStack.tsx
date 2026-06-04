"use client";

import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BookCard from "./BookCard";
import { Book } from "@/lib/books";
import { X, Heart, BookOpen, Star, Calendar } from "lucide-react";

interface SwipeStackProps {
  books: Book[];
  onEmpty: () => void;
  onStackChange?: (stack: Book[]) => void;
}

export default function SwipeStack({ books, onEmpty, onStackChange }: SwipeStackProps) {
  const [stack, setStack] = useState<Book[]>(books);
  const [lastDirection, setLastDirection] = useState<"LEFT" | "RIGHT" | null>(null);
  const [expanded, setExpanded] = useState(false);

  const exitDirectionRef = useRef<"LEFT" | "RIGHT">("LEFT");

  const currentBook = stack[stack.length - 1];

    const handleSwipe = async (direction: "LEFT" | "RIGHT") => {
  const book = stack[stack.length - 1];
  if (!book) return;

  exitDirectionRef.current = direction; // ← set ref immediately
  setLastDirection(direction);
  setExpanded(false);
  const newStack = stack.slice(0, -1);
  setStack(newStack);
  onStackChange?.(newStack);

  if (stack.length === 1) onEmpty();

  await fetch("/api/swipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ googleBooksId: book.id, direction, book }),
  });

  if (direction === "RIGHT") {
    try {
      const raw = localStorage.getItem("verso_feed");
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.books = parsed.books.filter((b: any) => b.id !== book.id);
        localStorage.setItem("verso_feed", JSON.stringify(parsed));
      }
    } catch {}
  }
};

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-16 w-full max-w-5xl mx-auto">

      {/* LEFT — Card + Buttons */}
      <div className="flex flex-col items-center gap-5 flex-shrink-0">
        <div className="relative w-[240px] h-[360px]">

            <AnimatePresence custom={exitDirectionRef.current}>
            {stack.slice(-1).map((book) => {
                return (
                <motion.div
                    key={book.id}
                    custom={exitDirectionRef.current}
                    className="absolute inset-0"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    variants={{
                    exit: (direction: "LEFT" | "RIGHT") => ({
                        x: direction === "RIGHT" ? 400 : -400,
                        rotate: direction === "RIGHT" ? 25 : -25,
                        opacity: 0,
                        transition: { duration: 0.3 },
                    }),
                    }}
                    exit="exit"
                >
                    <BookCard book={book} onSwipe={handleSwipe} isTop={true} />
                </motion.div>
                );
            })}
            </AnimatePresence>
            
        </div>

        {/* Buttons */}
        <div className="flex gap-3 w-full">
          <button
            onClick={() => handleSwipe("LEFT")}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#e8e4dc] dark:border-[#2a2825] bg-white dark:bg-[#1a1916] hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900 transition-all"
          >
            <X className="w-4 h-4 text-[#9ca3af]" />
            <span className="text-sm text-[#6b7280] dark:text-[#9ca3af]">Pass</span>
          </button>
          <button
            onClick={() => handleSwipe("RIGHT")}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#e8e4dc] dark:border-[#2a2825] bg-white dark:bg-[#1a1916] hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:border-amber-200 dark:hover:border-amber-900 transition-all"
          >
            <Heart className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-[#6b7280] dark:text-[#9ca3af]">Save</span>
          </button>
        </div>

        <p className="text-[#c8c0b0] dark:text-[#4a4845] text-xs">{stack.length} in queue</p>
      </div>

      {/* RIGHT — Details */}
      {currentBook && (
        <motion.div
          key={currentBook.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 min-w-0 pt-1 flex flex-col gap-5"
        >
          {/* Title + Author */}
          <div>
            <h2 className="text-3xl font-bold text-[#1a1a2e] dark:text-[#f0ece4] leading-tight tracking-tight">
              {currentBook.title}
            </h2>
            <p className="text-amber-600 dark:text-amber-400 font-medium mt-1">{currentBook.author}</p>
          </div>

          {/* Rating */}
          {currentBook.rating && (
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= Math.round(currentBook.rating!)
                        ? "text-amber-400 fill-amber-400"
                        : "text-[#e8e4dc] dark:text-[#2a2825] fill-[#e8e4dc] dark:fill-[#2a2825]"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[#9ca3af] text-xs">{currentBook.rating.toFixed(1)}</span>
            </div>
          )}

          {/* Genre tags */}
          {currentBook.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {currentBook.genres.slice(0, 4).map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-1 rounded-full text-xs border border-[#e8e4dc] dark:border-[#2a2825] text-[#6b7280] dark:text-[#9ca3af] bg-white dark:bg-[#1a1916]"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-[#e8e4dc] dark:bg-[#2a2825]" />

          {/* Description */}
          <div>
            <p className={`text-[#4b5563] dark:text-[#9ca3af] text-sm leading-relaxed ${expanded ? "" : "line-clamp-6"}`}>
              {currentBook.description}
            </p>
            {currentBook.description.length > 300 && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="text-amber-600 dark:text-amber-400 text-xs mt-2 hover:opacity-70 transition-opacity font-medium"
              >
                {expanded ? "Show less ↑" : "Read more ↓"}
              </button>
            )}
          </div>

          {/* Subjects */}
          {currentBook.subjects && currentBook.subjects.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {currentBook.subjects.slice(0, 6).map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 rounded text-xs bg-[#f0ece4] dark:bg-[#1a1916] text-[#9ca3af] dark:text-[#6b7280]"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-5 text-[#9ca3af] text-xs">
            {currentBook.pageCount && (
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                {currentBook.pageCount.toLocaleString()} pages
              </span>
            )}
            {currentBook.publishedDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {currentBook.publishedDate.slice(0, 4)}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}