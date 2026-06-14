"use client";

import { motion } from "framer-motion";
import {
  BookMarked,
  Brain,
  Database,
  Moon,
  Sparkles,
  Tags,
} from "lucide-react";
import { TbCards } from "react-icons/tb";

const features = [
  {
    icon: <TbCards className="w-4 h-4" />,
    title: "Swipe to decide",
    description:
      "A simple left or right tells Verso everything it needs to know. No ratings, no reviews — just instinct.",
    tag: "Core experience",
  },
  {
    icon: <Brain className="w-4 h-4" />,
    title: "Gets smarter over time",
    description:
      "Every swipe refines your taste profile. The more you use Verso, the more uncannily accurate it becomes.",
    tag: "Personalization",
  },
  {
    icon: <BookMarked className="w-4 h-4" />,
    title: "Your shelf, always ready",
    description:
      "Liked books land in your shelf instantly. Browse your saves anytime — your next read is already waiting.",
    tag: "Library",
  },
  {
    icon: <Tags className="w-4 h-4" />,
    title: "Filter by mood or genre",
    description:
      "Feeling like a slow literary novel? Or a fast-paced thriller? Set a filter and Verso narrows the deck.",
    tag: "Discovery",
  },
  {
    icon: <Database className="w-4 h-4" />,
    title: "Millions of books",
    description:
      "Powered by Hardcover's catalogue — from debut indie fiction to timeless classics, every genre covered.",
    tag: "Catalogue",
  },
  {
    icon: <Moon className="w-4 h-4" />,
    title: "Dark mode included",
    description:
      "For late-night browsing sessions. Verso looks equally at home in light or dark — your eyes will thank you.",
    tag: "UI",
  },
];

const stats = [
  { value: "2M+", label: "Books in catalogue" },
  { value: "<1s", label: "Per swipe decision" },
  { value: "Free", label: "To get started" },
];

export default function Features() {
  return (
    <section className="bg-stone-200 dark:bg-stone-950 py-24 px-6 transition-colors duration-200">
      <div className="max-w-5xl mx-auto">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center gap-2 w-fit px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800/60 mb-6"
        >
          <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          <span className="text-xs text-stone-500 dark:text-stone-400 tracking-wide">
            Why Verso
          </span>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-serif italic text-slate-900 dark:text-stone-100 leading-tight mb-3">
            Reading should feel like{" "}
            <span className="text-amber-600 dark:text-amber-400">discovery</span>
          </h2>
          <p className="text-stone-500 dark:text-stone-400 text-lg max-w-lg leading-relaxed">
            No more scrolling through endless lists. Verso learns what you love
            and surfaces books you'd never find on your own.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-200 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden"
        >
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-white dark:bg-stone-950 p-7 flex flex-col gap-3 group"
            >
              {/* Icon */}
              <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 dark:text-stone-400 group-hover:bg-amber-50 dark:group-hover:bg-amber-950/40 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200">
                {feature.icon}
              </div>

              {/* Text */}
              <p className="text-sm font-medium text-slate-900 dark:text-stone-100">
                {feature.title}
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                {feature.description}
              </p>

              {/* Tag */}
              <span className="mt-auto text-xs px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 w-fit border border-stone-200 dark:border-stone-700/40">
                {feature.tag}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="mt-px grid grid-cols-3 divide-x divide-stone-200 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden"
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white dark:bg-stone-950 py-6 flex flex-col items-center gap-1"
            >
              <span className="text-2xl sm:text-3xl font-serif italic text-amber-600 dark:text-amber-400">
                {stat.value}
              </span>
              <span className="text-xs text-stone-400 dark:text-stone-500">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}