"use client";

import { BookOpen, Sun, Moon, Settings, ArrowLeft, Library } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useTheme } from "@/lib/theme";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  const isHome = pathname === "/";

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-between w-full max-w-xl px-2 py-2 rounded-2xl bg-stone-900/75 backdrop-blur-xl border border-stone-700/40">

        {/* Left */}
        <div className="flex items-center">
          {!isHome && (
            <button
              onClick={() => router.back()}
              className="group w-8 h-8 flex items-center justify-center rounded-xl text-stone-500 hover:text-stone-200 transition-colors duration-200"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            </button>
          )}
          <button
            onClick={() => router.push("/")}
            className="group flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-stone-800/60 active:scale-[0.97] transition-all duration-150"
            aria-label="Go to homepage"
          >
            {/* logo mark */}
            <div className="w-6 h-6 rounded-md bg-stone-100/90 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-3.5 h-3.5 text-stone-900" />
            </div>
            <span
              className="text-stone-100"
            >
              verso
            </span>
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center">

          {/* Shelf */}
          <button
            onClick={() => router.push("/shelf")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-150 active:scale-[0.97]
              ${pathname === "/shelf"
                ? "bg-stone-700/60 text-stone-100"
                : "text-stone-500 hover:text-stone-200 hover:bg-stone-800/60"
              }`}
          >
            <Library className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline leading-none">Shelf</span>
          </button>

          {/* Theme */}
          <button
            onClick={toggle}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-stone-500 hover:text-stone-200 hover:bg-stone-800/60 active:scale-[0.97] transition-all duration-150"
            aria-label="Toggle theme"
          >
            {theme === "dark"
              ? <Sun className="w-4 h-4" />
              : <Moon className="w-4 h-4" />
            }
          </button>

          {/* Settings */}
          <button
            onClick={() => router.push("/preferences")}
            className={`w-8 h-8 flex items-center justify-center rounded-xl active:scale-[0.97] transition-all duration-150
              ${pathname === "/preferences"
                ? "bg-stone-700/60 text-stone-100"
                : "text-stone-500 hover:text-stone-200 hover:bg-stone-800/60"
              }`}
            aria-label="Preferences"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-stone-700/60 mx-1.5" />

          {/* Avatar */}
          <UserButton appearance={{ elements: { avatarBox: "w-6 h-6" } }} />
        </div>
      </nav>
    </div>
  );
}