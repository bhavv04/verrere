import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/lib/theme";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "verrere",
  description: "Find your next favourite book",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/public/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/public/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/public/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="bg-stone-50 dark:bg-stone-950">
        <body className="bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-200 min-h-screen">
          <ThemeProvider>
            <div className="min-h-screen flex flex-col">
              {children}
            </div>
          </ThemeProvider>
        <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}