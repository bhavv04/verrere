"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { BookOpen } from "lucide-react";
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
  const rotate = useTransform(x, [-200, 200], [-12, 12]);

  return (
    <motion.div
      className="absolute inset-0 mx-auto w-full max-w-sm rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing"
      style={{ x, rotate }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={(_, info) => {
        if (info.offset.x > 120) onSwipe("RIGHT");
        else if (info.offset.x < -120) onSwipe("LEFT");
      }}
      whileDrag={{ scale: 1.02 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {book.coverUrl ? (
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-stone-100 flex items-center justify-center">
          <BookOpen className="w-16 h-16 text-stone-300" />
        </div>
      )}

      <motion.div
        className="absolute inset-0 bg-emerald-400/20 flex items-start justify-start p-6 rounded-2xl"
        style={{ opacity: rightOpacity }}
      >
        <span className="text-emerald-600 text-2xl font-black -rotate-12">
          SAVE
        </span>
      </motion.div>

      <motion.div
        className="absolute inset-0 bg-red-400/20 flex items-start justify-end p-6 rounded-2xl"
        style={{ opacity: leftOpacity }}
      >
        <span className="text-red-500 text-2xl font-black tracking-wide rotate-12">
          PASS
        </span>
      </motion.div>
    </motion.div>
  );
}