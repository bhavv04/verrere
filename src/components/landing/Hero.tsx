"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, MousePointerClick } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import Demo from "@/components/landing/Demo";
import { useEffect, useState } from "react";

export default function Hero() {
  const { isSignedIn } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen bg-stone-50 dark:bg-stone-900 overflow-hidden transition-colors duration-200">
      <div className="max-w-6xl space-y-4 mx-auto px-6 pt-28 lg:pt-36 pb-16">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center gap-2 w-fit px-3 py-1.5 rounded-full bg-white dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/40 mx-auto lg:mx-0"
        >
          <BookOpen className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          <span className="text-xs text-gray-500 dark:text-stone-400 tracking-wide">Book discovery, reimagined</span>
        </motion.div>

        {/* Headline + overlapping demo */}
        <div className="relative">
          <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-[15vw] sm:text-8xl lg:text-[8rem] text-slate-900 dark:text-stone-100 font-serif italic text-center lg:text-left leading-[0.9]"
            >
            Find your
            <br />
            <span className="text-amber-600 dark:text-amber-400">next</span> great
            <br />
            read.
          </motion.h1>

          {/* Demo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotate: 6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="relative mt-10 lg:absolute lg:right-0 lg:bottom-0 lg:translate-y-32/100 flex justify-center lg:justify-end"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-stone-300 dark:bg-stone-900 rotate-[8deg] z-0 shadow-sm" />
              <div className="absolute inset-0 rounded-2xl bg-stone-200 dark:bg-stone-900 rotate-[-2deg] z-0 shadow-sm" />
              <div className="absolute inset-0 rounded-2xl bg-stone-100 dark:bg-stone-800 rotate-[-12deg] z-0 shadow-sm" />

              <div className="absolute -top-3.5 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 dark:bg-stone-100 w-fit rotate-[5deg] shadow-md">
                <MousePointerClick className="w-3.5 h-3.5 text-white dark:text-stone-900" />
                <span className="text-xs font-medium text-white dark:text-stone-900">Swipe to try it</span>
              </div>

              <div className="relative z-10 rounded-2xl shadow-2xl bg-stone-50 dark:bg-stone-950 p-3">
                <Demo />
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="mt-14 lg:mt-6 max-w-sm mx-auto lg:mx-0"
        >
          <p className="text-gray-500 dark:text-stone-400 text-lg leading-relaxed mb-6">
            Swipe through thousands of books tailored to your taste. Save what you love, skip what you don't.
          </p>

          <div className="flex items-center gap-3 justify-center lg:justify-start">
            {!mounted ? (
              // Render a stable placeholder that matches the server render
              <div className="h-11 w-36 rounded-xl bg-slate-900 dark:bg-stone-100 opacity-0" />
            ) : !isSignedIn ? (
              <>
                <Link
                  href="/sign-up"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm hover:bg-slate-700 dark:hover:bg-stone-300 transition-colors shadow-sm"
                >
                  Start for free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/sign-in"
                  className="px-6 py-3 rounded-xl bg-stone-200 dark:bg-black hover:bg-stone-300 dark:hover:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 transition-colors shadow-sm"
                >
                  Sign in
                </Link>
              </>
            ) : (
              <Link
                href="/app"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-stone-100 text-white dark:text-stone-900 font-medium hover:bg-slate-800 dark:hover:bg-stone-300 transition-colors shadow-sm"
              >
                Go to your feed <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </motion.div>

      </div>
    </section>
  );
}