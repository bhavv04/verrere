"use client";

import { motion } from "framer-motion";
import { Sparkles, ThumbsUp, BookMarked } from "lucide-react";

const steps = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    step: "01",
    title: "Tell us your taste",
    description:
      "Pick a few genres you love. Verrere uses your preferences as a starting point to build your first deck.",
  },
  {
    icon: <ThumbsUp className="w-5 h-5" />,
    step: "02",
    title: "Swipe through books",
    description:
      "Right to save, left to skip. Each swipe teaches Verrere more about what you love — no typing required.",
  },
  {
    icon: <BookMarked className="w-5 h-5" />,
    step: "03",
    title: "Build your shelf",
    description:
      "Every book you like lands in your shelf instantly. Come back anytime to see what's waiting for you.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-stone-50 dark:bg-stone-900 py-16 px-6 transition-colors duration-200">
      <div className="max-w-5xl mx-auto">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center w-fit px-3 py-2 font-bold rounded-full bg-stone-100 dark:bg-stone-800/60 mb-4"
        >
          <span className="text-xs text-stone-500 dark:text-stone-400 tracking-wide">
            How it works
          </span>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-serif italic text-slate-900 dark:text-stone-100 leading-tight mb-4">
            Up and reading in{" "}
            <span className="text-amber-600 dark:text-amber-400">
              three steps
            </span>
          </h2>
          <p className="text-stone-500 dark:text-stone-400 text-lg max-w-lg leading-relaxed">
            No lengthy onboarding. No complicated setup. Just swipe and
            discover.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 sm:grid-cols-3 bg-stone-200 dark:bg-stone-900 rounded-2xl overflow-hidden">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              className="bg-white dark:bg-stone-950 p-8 flex flex-col gap-5"
            >
              {/* Step number + icon */}
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 dark:text-stone-400">
                  {step.icon}
                </div>
                <span className="font-serif italic text-4xl text-stone-200 dark:text-stone-800 select-none">
                  {step.step}
                </span>
              </div>

              {/* Text */}
              <div className="flex flex-col gap-2">
                <p className="font-medium text-slate-900 dark:text-stone-100">
                  {step.title}
                </p>
                <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}