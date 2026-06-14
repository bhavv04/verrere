"use client";

import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { useTheme } from "@/lib/theme";

export default function Navbar() {
  const { user, isLoaded } = useUser();
  const { theme, toggle } = useTheme();

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
      <nav className="flex items-center justify-between w-full max-w-3xl px-3 py-2.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-[#0e0e0e]/80 backdrop-blur-2xl shadow-[0_2px_16px_rgb(0,0,0,0.06)] dark:shadow-[0_2px_24px_rgb(0,0,0,0.4)]">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group active:scale-[0.98] transition-transform duration-150">
          <div className="w-10 h-10">
            <img src="/verrere.png" alt="Verrere" className="w-full h-full object-contain" />
          </div>
          <span className="hidden sm:block text-[15px] font-semibold tracking-[-0.02em] text-stone-900 dark:text-stone-100" style={{ fontFamily: "var(--font-playfair)" }}>
            Verrere
          </span>
        </Link>

        {/* Right */}
        <div className="flex items-center gap-1">

          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="w-8 h-8 flex items-center justify-center rounded-xl text-stone-500 dark:text-stone-400 hover:bg-black/10 dark:hover:bg-white/10 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {!isLoaded ? (
            <div className="w-8 h-8" />
          ) : user ? (
            <>
              <Link href="/app" className="hidden sm:block px-4 py-2 rounded-xl text-sm text-stone-900 dark:text-stone-100 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors">
                Go to app →
              </Link>
              <Link href="/app" aria-label="Go to app" className="sm:hidden w-8 h-8 flex items-center justify-center rounded-xl text-sm bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors">
                →
              </Link>
              <div className="h-4 w-px bg-stone-200 dark:bg-stone-700/60" />
              <UserButton appearance={{ elements: { avatarBox: "w-7 h-7" } }} />
            </>
          ) : (
            <>
              <Link href="/sign-in" className="px-4 py-2 rounded-xl text-sm bg-stone-100 dark:bg-stone-800 text-black dark:text-stone-100 hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors">
                Sign in
              </Link>
              <Link href="/sign-up" className="px-3 sm:px-4 py-2 rounded-xl text-sm bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors">
                <span className="hidden sm:inline">Get started</span>
                <span className="sm:hidden">Sign up</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}