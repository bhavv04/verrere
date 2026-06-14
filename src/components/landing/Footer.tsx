"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";

const links = {
  Product: [
    { label: "How it works", href: "/#features" },
    { label: "Browse books", href: "/app" },
    { label: "Your shelf", href: "/app/shelf" },
  ],
  Account: [
    { label: "Sign up", href: "/sign-up" },
    { label: "Sign in", href: "/sign-in" },
    { label: "Settings", href: "/settings" },
  ],
  Legal: [
    { label: "Privacy policy", href: "/privacy" },
    { label: "Terms of service", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-stone-200 dark:bg-stone-950 dark:border-stone-800 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Top row — brand + links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 pb-12 border-b border-stone-200 dark:border-stone-800">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-1 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="font-serif italic text-slate-900 dark:text-stone-100 text-lg">
                Verrere
              </span>
            </Link>
            <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed max-w-[200px]">
              Tinder for books. Find your next great read in seconds.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group} className="flex flex-col gap-3">
              <p className="text-xs font-medium text-slate-900 dark:text-stone-100 tracking-wide uppercase">
                {group}
              </p>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-stone-500 dark:text-stone-400 hover:text-slate-900 dark:hover:text-stone-100 transition-colors duration-150"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row — copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-stone-400 dark:text-stone-500">
            © 2026 Verrere. All rights reserved.
            </p>
          <p className="text-xs text-stone-400 dark:text-stone-500">
            Powered by{" "}
            <a
              href="https://hardcover.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 dark:hover:text-stone-100 transition-colors duration-150"
            >
              Hardcover
            </a>
          </p>
        </div>

      </div>
    </footer>
  );
}