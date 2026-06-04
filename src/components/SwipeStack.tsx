"use client";

import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BookCard from "./BookCard";
import { Book } from "@/lib/books";
import { X, Heart, BookOpen, Star, Calendar, Undo2 } from "lucide-react";

interface SwipeStackProps {
  books: Book[];
  onEmpty: () => void;
  onStackChange?: (stack: Book[]) => void;
}

interface SwipeRecord {
  book: Book;
  direction: "LEFT" | "RIGHT";
}

export default function SwipeStack({ books, onEmpty, onStackChange }: SwipeStackProps) {
  const [stack, setStack] = useState<Book[]>(books);
  const [lastSwiped, setLastSwiped] = useState<SwipeRecord | null>(null);
  const [expanded, setExpanded] = useState(false);
  const exitDirectionRef = useRef<"LEFT" | "RIGHT">("LEFT");
  const currentBook = stack[stack.length - 1];

  const handleSwipe = async (direction: "LEFT" | "RIGHT") => {
    const book = stack[stack.length - 1];
    if (!book) return;

    exitDirectionRef.current = direction;
    setExpanded(false);
    setLastSwiped({ book, direction });

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

  const handleUndo = async () => {
    if (!lastSwiped) return;
    const { book, direction } = lastSwiped;

    // Restore book to top of stack
    const restored = [...stack, book];
    setStack(restored);
    onStackChange?.(restored);
    setLastSwiped(null);
    setExpanded(false);

    // Undo the swipe on the server
    await fetch("/api/swipe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ googleBooksId: book.id }),
    });

    // If it was a right swipe, put it back in the local cache too
    if (direction === "RIGHT") {
      try {
        const raw = localStorage.getItem("verso_feed");
        if (raw) {
          const parsed = JSON.parse(raw);
          parsed.books = [...parsed.books, book];
          localStorage.setItem("verso_feed", JSON.stringify(parsed));
        }
      } catch {}
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-16 w-full max-w-5xl mx-auto">

      {/* Card + Buttons */}
      <div className="flex flex-col items-center gap-6 flex-shrink-0 w-full sm:w-auto">
        <div className="relative w-[85vw] h-[120vw] sm:w-[280px] sm:h-[420px] max-w-sm">
          <AnimatePresence custom={exitDirectionRef.current}>
            {stack.slice(-1).map((book) => (
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
            ))}
          </AnimatePresence>
        </div>

        {/* Swipe buttons */}
        <div className="flex gap-4 w-[85vw] sm:w-full max-w-sm">
          <button
            onClick={() => handleSwipe("LEFT")}
            aria-label="Pass"
            className="flex-1 flex items-center justify-center p-4 rounded-full bg-black/5 dark:bg-white/5 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-500 active:scale-95 transition-all group touch-manipulation"
          >
            <X className="w-5 h-5 text-black/40 dark:text-white/40 group-hover:text-red-500 transition-colors" strokeWidth={2.5} />
          </button>
          <button
            onClick={() => handleSwipe("RIGHT")}
            aria-label="Save"
            className="flex-1 flex items-center justify-center p-4 rounded-full bg-amber-500 hover:bg-amber-400 active:scale-95 shadow-sm transition-all touch-manipulation"
          >
            <Heart className="w-5 h-5 text-white fill-white" strokeWidth={2} />
          </button>
        </div>

        {/* Queue count + undo */}
        <div className="flex items-center gap-3">
          <p className="text-black/20 dark:text-white/20 text-xs">{stack.length} in queue</p>
          {lastSwiped && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleUndo}
              className="flex items-center gap-1 text-xs text-black/30 dark:text-white/30 hover:text-black/60 dark:hover:text-white/60 active:scale-95 transition-all"
              aria-label="Undo last swipe"
            >
              <Undo2 className="w-3 h-3" />
              undo
            </motion.button>
          )}
        </div>
      </div>

      {/* Details panel */}
      {currentBook && (
        <motion.div
          key={currentBook.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 min-w-0 pt-1 flex flex-col gap-4"
        >
          <div>
            <h2 className="text-3xl font-bold text-black dark:text-white leading-tight tracking-tight">
              {currentBook.title}
            </h2>
            <p className="text-amber-500 font-medium mt-1">{currentBook.author}</p>
          </div>

          {currentBook.rating && (
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= Math.round(currentBook.rating!)
                        ? "text-amber-400 fill-amber-400"
                        : "text-black/10 dark:text-white/10 fill-black/10 dark:fill-white/10"
                    }`}
                  />
                ))}
              </div>
              <span className="text-black/30 dark:text-white/30 text-xs">{currentBook.rating.toFixed(1)}</span>
            </div>
          )}

          {currentBook.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {currentBook.genres.slice(0, 4).map((g) => (
                <span key={g} className="px-2.5 py-1 rounded-full text-xs border border-black/10 dark:border-white/10 text-black/40 dark:text-white/40">
                  {g}
                </span>
              ))}
            </div>
          )}

          <div className="h-px bg-black/8 dark:bg-white/8" />

          <div>
            <p className={`text-black/50 dark:text-white/50 text-sm leading-relaxed ${expanded ? "" : "line-clamp-6"}`}>
              {currentBook.description}
            </p>
            {currentBook.description.length > 300 && (
              <div className="flex items-center gap-3 w-full mt-2">
                <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
                <button
                  onClick={() => setExpanded((e) => !e)}
                  className="flex items-center gap-1.5 text-xs font-medium text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70 transition-colors"
                  aria-expanded={expanded}
                >
                  {expanded ? "Show less" : "Read more"}
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
              </div>
            )}
          </div>

          {currentBook.subjects && currentBook.subjects.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {currentBook.subjects.slice(0, 6).map((s) => (
                <span key={s} className="px-2 py-0.5 rounded text-xs bg-black/5 dark:bg-white/5 text-black/30 dark:text-white/30">
                  {s}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-5 text-black/30 dark:text-white/30 text-xs">
            {currentBook.pageCount && (
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {currentBook.pageCount.toLocaleString()} pages
              </span>
            )}
            {currentBook.publishedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {currentBook.publishedDate.slice(0, 4)}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}