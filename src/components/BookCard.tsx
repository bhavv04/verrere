"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { Star, BookOpen } from "lucide-react";
import { Book } from "@/lib/books";

interface BookCardProps {
  book: Book;
  onSwipe: (direction: "LEFT" | "RIGHT") => void;
  isTop: boolean;
}

export default function BookCard({ book, onSwipe, isTop }: BookCardProps) {
  const x = useMotionValue(0);

  const leftOpacity = useTransform(x, [-150, -30, 0], [1, 0, 0]);
  const rightOpacity = useTransform(x, [0, 30, 150], [0, 0, 1]);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);

  return (
    <motion.div
      className="absolute w-full h-full rounded-2xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
      style={{ x, rotate }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={(_, info) => {
        if (info.offset.x > 120) onSwipe("RIGHT");
        else if (info.offset.x < -120) onSwipe("LEFT");
      }}
      whileDrag={{ scale: 1.02 }}
      animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 16 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Cover */}
      <div className="relative w-full h-full">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-neutral-600" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Swipe right indicator */}
        <motion.div
          className="absolute inset-0 bg-green-500/30 flex items-center justify-center rounded-2xl"
          style={{ opacity: rightOpacity }}
        >
          <div className="border-4 border-green-400 rounded-xl px-6 py-3 rotate-[-20deg]">
            <span className="text-green-400 text-4xl font-black tracking-wider">LIKE</span>
          </div>
        </motion.div>

        {/* Swipe left indicator */}
        <motion.div
          className="absolute inset-0 bg-red-500/30 flex items-center justify-center rounded-2xl"
          style={{ opacity: leftOpacity }}
        >
          <div className="border-4 border-red-400 rounded-xl px-6 py-3 rotate-[20deg]">
            <span className="text-red-400 text-4xl font-black tracking-wider">PASS</span>
          </div>
        </motion.div>

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h2 className="text-white text-2xl font-bold leading-tight">{book.title}</h2>
          <p className="text-white/70 text-sm mt-1">{book.author}</p>

          {book.rating && (
            <div className="flex items-center gap-1 mt-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-white/80 text-sm">{book.rating.toFixed(1)}</span>
            </div>
          )}

          {book.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {book.genres.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-xs"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          <p className="text-white/60 text-sm mt-3 line-clamp-3">{book.description}</p>
        </div>
      </div>
    </motion.div>
  );
}