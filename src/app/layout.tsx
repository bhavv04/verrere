import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verso",
  description: "Find your next favourite book",
    icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      {/* 1. Added background classes to <html> to ensure browser elastic scrolling bounces match the theme */}
      <html lang="en" className="bg-stone-50 dark:bg-stone-950">
        <body className="bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-200 min-h-screen">
          <ThemeProvider>
            {/* 2. CHANGED 'h-screen' to 'min-h-screen flex flex-col' so it can expand if content demands it */}
            <div className="min-h-screen flex flex-col">
              {children}
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}