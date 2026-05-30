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
      className="absolute w-full h-full rounded-2xl overflow-hidden shadow-lg cursor-grab active:cursor-grabbing border border-[#e8e4dc]"
      style={{ x, rotate }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={(_, info) => {
        if (info.offset.x > 120) onSwipe("RIGHT");
        else if (info.offset.x < -120) onSwipe("LEFT");
      }}
      whileDrag={{ scale: 1.02 }}
      animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 14 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {book.coverUrl ? (
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-[#f0ece4] flex items-center justify-center">
          <BookOpen className="w-16 h-16 text-[#c8c0b0]" />
        </div>
      )}

      <motion.div
        className="absolute inset-0 bg-emerald-400/20 flex items-center justify-center rounded-2xl"
        style={{ opacity: rightOpacity }}
      >
        <div className="border-4 border-emerald-500 rounded-xl px-6 py-3 -rotate-12 bg-white/90">
          <span className="text-emerald-600 text-3xl font-black tracking-wider">SAVE</span>
        </div>
      </motion.div>

      <motion.div
        className="absolute inset-0 bg-red-400/20 flex items-center justify-center rounded-2xl"
        style={{ opacity: leftOpacity }}
      >
        <div className="border-4 border-red-500 rounded-xl px-6 py-3 rotate-12 bg-white/90">
          <span className="text-red-600 text-3xl font-black tracking-wider">PASS</span>
        </div>
      </motion.div>
    </motion.div>
  );
}