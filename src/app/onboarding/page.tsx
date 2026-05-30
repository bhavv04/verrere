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

  const handleContinue = async () => {
    if (genres.length === 0) return;
    setLoading(true);
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ genres }),
    });
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center px-6">
      <div className="max-w-lg w-full">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-[#1a1a2e] flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-[#1a1a2e]">verso</span>
        </div>

        <h1 className="text-4xl font-bold text-[#1a1a2e] mb-2 leading-tight">
          What do you like to read?
        </h1>
        <p className="text-[#6b7280] mb-8">
          Hey {user?.firstName ?? "there"} — pick up to 5 genres and we'll build your feed around them.
        </p>

        <GenrePicker selected={genres} onChange={setGenres} />

        <button
          onClick={handleContinue}
          disabled={genres.length === 0 || loading}
          className="mt-10 w-full py-3.5 rounded-xl font-semibold bg-[#1a1a2e] text-white hover:bg-[#2d2d4e] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Setting up your feed..." : `Start reading →`}
        </button>
      </div>
    </div>
  );
}