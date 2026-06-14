"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function CTA() {
  const { isSignedIn } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="bg-stone-50 dark:bg-stone-900 py-12 px-6 transition-colors duration-200">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative bg-stone-200 dark:bg-stone-950 rounded-2xl px-8 py-16 sm:py-20 flex flex-col items-center text-center overflow-hidden"
        >
          {/* Decorative background text */}
          <span className="absolute inset-0 flex items-center justify-center font-serif italic text-[clamp(5rem,18vw,12rem)] text-stone-100 dark:text-stone-800/60 select-none pointer-events-none leading-none">
            read.
          </span>

          {/* Icon */}
          <div className="relative z-10 w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-6">
            <img src="/verrere.png" alt="Verrere" className="w-full h-full object-contain" />
          </div>

          {/* Heading */}
          <h2 className="relative z-10 text-4xl sm:text-5xl font-serif italic text-slate-900 dark:text-stone-100 leading-tight mb-4 max-w-lg">
            Your next favourite book is one{" "}
            <span className="text-amber-600 dark:text-amber-400">swipe</span>{" "}
            away.
          </h2>

          <p className="relative z-10 text-stone-500 dark:text-stone-400 text-lg leading-relaxed max-w-md mb-10">
            Join readers already discovering books they love. Free to start, no
            credit card required.
          </p>

          {/* Buttons */}
          <div className="relative z-10 flex items-center gap-3">
            {!mounted ? (
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
                  className="px-6 py-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-sm text-stone-900 dark:text-stone-100 transition-colors shadow-sm"
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