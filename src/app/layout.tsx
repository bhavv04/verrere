import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verso",
  description: "Find your next favourite book",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-[#faf8f5] text-[#1a1a2e]">{children}</body>
      </html>
    </ClerkProvider>
  );
}