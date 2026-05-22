"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import GenrePicker from "@/components/GenrePicker";

export default function PreferencesPage() {
  const router = useRouter();
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/user", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        const userGenres = data.user?.genres?.map((g: any) => g.genre) ?? [];
        setGenres(userGenres);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ genres }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="flex items-center gap-4 px-6 py-4 border-b border-white/10">
        <button
          onClick={() => router.push("/")}
          className="text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          <span className="font-semibold tracking-tight">preferences</span>
        </div>
      </nav>

      <main className="px-6 py-8 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-2">Your genres</h1>
        <p className="text-white/50 text-sm mb-8">
          Pick up to 5 genres. Your feed is weighted by these plus what you've liked.
        </p>

        {loading ? (
          <p className="text-white/40">Loading...</p>
        ) : (
          <>
            <GenrePicker selected={genres} onChange={setGenres} />
            <button
              onClick={handleSave}
              disabled={saving || genres.length === 0}
              className="mt-10 w-full py-3 rounded-xl font-semibold bg-white text-black hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {saving ? "Saving..." : saved ? "Saved ✓" : "Save preferences"}
            </button>
          </>
        )}
      </main>
    </div>
  );
}