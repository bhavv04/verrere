"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import GenrePicker from "@/components/GenrePicker";
import { BookOpen } from "lucide-react";

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    if (genres.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genres }),
      });
      if (!res.ok) throw new Error("Failed");
      await user?.reload();
      window.location.href = "/";
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col items-center justify-center px-6">
      <div className="max-w-lg w-full">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-stone-100 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-stone-100 dark:text-stone-900" />
          </div>
          <span className="font-semibold text-xl text-stone-900 dark:text-stone-100" style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.025em" }}>
            verso
          </span>
        </div>

        <h1 className="text-4xl font-bold mb-2 leading-tight">What do you like to read?</h1>
        <p className="text-stone-500 dark:text-stone-400 mb-8">
          Hey {user?.firstName ?? "there"} — pick up to 5 genres and we'll build your feed around them.
        </p>

        <GenrePicker selected={genres} onChange={setGenres} />

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <button
          onClick={handleContinue}
          disabled={genres.length === 0 || loading}
          className="mt-10 w-full py-3.5 rounded-xl font-semibold bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Setting up your feed..." : "Start swiping →"}
        </button>
      </div>
    </div>
  );
}