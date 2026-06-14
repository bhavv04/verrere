"use client";

import { ArrowLeft, Library, Compass, Settings, Sun, Moon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useTheme } from "@/lib/theme";

const NAV = [
  { label: "Discover", icon: Compass, href: "/app" },
  { label: "Shelf",    icon: Library, href: "/app/shelf" },
  { label: "Settings", icon: Settings, href: "/app/preferences" },
];

function Dot({ show }: { show: boolean }) {
  return show ? <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" /> : null;
}

export default function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  const active = (href: string) => pathname === href;
  const go     = (href: string) => () => router.push(href);

  const iconCls = (href: string) =>
    `relative p-1.5 transition-colors ${active(href) ? "text-stone-900 dark:text-stone-100" : "text-stone-400 dark:text-stone-500"}`;

  const labelCls = (href: string) =>
    `text-[10px] font-medium tracking-wide ${active(href) ? "text-stone-900 dark:text-stone-100" : "text-stone-400 dark:text-stone-500"}`;

  return (
    <>
      {/* Top bar */}
      <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
        <nav className="flex items-center justify-between w-full max-w-3xl px-3 py-2.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/75 dark:bg-[#0e0e0e]/80 backdrop-blur-2xl shadow-[0_2px_16px_rgb(0,0,0,0.06)] dark:shadow-[0_2px_24px_rgb(0,0,0,0.4)]">

          {/* Left */}
          <div className="flex items-center gap-2">
            {!active("/app") && (
              <button onClick={() => router.back()} aria-label="Go back" className="w-8 h-8 flex items-center justify-center rounded-xl text-stone-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <button onClick={go("/app")} className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <img src="/verrere.png" alt="Verrere" className="w-full h-full object-contain" />
              </div>
              <span className="hidden sm:block text-[15px] font-semibold tracking-[-0.02em] text-stone-900 dark:text-stone-100">Verrere</span>
            </button>
          </div>

          {/* Center — desktop only */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV.slice(0, 2).map(({ label, href }) => (
              <button key={href} onClick={go(href)} className={`relative px-4 py-2 rounded-xl text-[13px] font-medium transition-colors ${active(href) ? "text-stone-900 dark:text-stone-100" : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"}`}>
                {label}
                {active(href) && <span className="absolute bottom-1 left-4 right-4 h-[2px] rounded-full bg-amber-400/80" />}
              </button>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-1">
            <button onClick={toggle} aria-label="Toggle theme" className="w-8 h-8 flex items-center justify-center rounded-xl text-stone-500 dark:text-stone-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={go("/app/preferences")} aria-label="Preferences" className={`hidden md:flex w-8 h-8 items-center justify-center rounded-xl transition-colors ${active("/app/preferences") ? "bg-black/5 dark:bg-white/10 text-stone-900 dark:text-stone-100" : "text-stone-500 dark:text-stone-400 hover:bg-black/5 dark:hover:bg-white/5"}`}>
              <Settings className="w-4 h-4" />
            </button>
            <div className="mx-1 h-4 w-px bg-stone-200 dark:bg-stone-700/60" />
            <UserButton appearance={{ elements: { avatarBox: "w-7 h-7" } }} />
          </div>
        </nav>
      </div>

      {/* Bottom nav — mobile only */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] border-t border-black/[0.06] dark:border-white/[0.06] bg-white/85 dark:bg-[#0e0e0e]/90 backdrop-blur-2xl h-16">
        {NAV.map(({ label, icon: Icon, href }) => (
          <button key={href} onClick={go(href)} className="flex flex-col items-center justify-center flex-1 h-full gap-1">
            <div className={iconCls(href)}><Icon className="w-5 h-5" /><Dot show={active(href)} /></div>
            <span className={labelCls(href)}>{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}