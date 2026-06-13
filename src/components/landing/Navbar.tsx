"use client";

import { BookOpen, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { useTheme } from "@/lib/theme";

export default function Navbar() {
  const { user, isLoaded } = useUser();
  const { theme, toggle } = useTheme();

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-between w-full max-w-3xl px-4 py-2.5 rounded-2xl
        bg-white/80 dark:bg-stone-900/75
        border border-stone-200 dark:border-stone-700/40
        backdrop-blur-xl shadow-sm transition-colors duration-200">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 active:scale-[0.98] transition-transform duration-150">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors">
            <img src="/verrere.png" alt="verrere" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-stone-100" style={{ fontFamily: "var(--font-playfair)" }}>
            verrere
          </span>
        </Link>

        {/* Right */}
        <div className="flex items-center gap-1">

          {/* Theme */}
          <button
            onClick={(e) => toggle(e)}
            className="w-9 h-9 flex items-center justify-center rounded-xl
              text-gray-500 dark:text-stone-400
              hover:text-slate-900 dark:hover:text-stone-100
              hover:bg-stone-100 dark:hover:bg-stone-800/60
              active:scale-[0.97] transition-all duration-150"
            aria-label="Toggle theme"
          >
            <span key={theme} className="animate-theme-icon">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </span>
          </button>

          {!isLoaded ? (
            <div className="w-9 h-9" />
          ) : user ? (
            <>
              <Link
                href="/app"
                className="hidden sm:block px-4 py-2 rounded-xl bg-slate-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:bg-slate-800 dark:hover:bg-stone-300 transition-colors"
              >
                Go to app →
              </Link>
              <Link
                href="/app"
                className="sm:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:bg-slate-800 dark:hover:bg-stone-300 transition-colors"
                aria-label="Go to app"
              >
                →
              </Link>

              {/* Divider */}
              <div className="w-px h-4 bg-stone-200 dark:bg-stone-700/60 mx-1" />

              <UserButton appearance={{ elements: { avatarBox: "w-7 h-7" } }} />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden sm:block text-sm font-medium text-gray-500 dark:text-stone-400 hover:text-slate-900 dark:hover:text-stone-100 transition-colors px-3 py-2"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="px-3 sm:px-4 py-2 rounded-xl bg-slate-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:bg-slate-800 dark:hover:bg-stone-300 transition-colors"
              >
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