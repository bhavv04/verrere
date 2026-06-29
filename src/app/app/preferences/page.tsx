"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GenrePicker from "@/components/GenrePicker";
import Navbar from "@/components/Navbar";

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
    localStorage.removeItem("verrere_feed"); // ← bust the cache when changing genres
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100">
        <Navbar />
        <main className="min-h-screen max-w-lg mx-auto px-6 flex flex-col justify-center pt-20">
            <h1 className="text-2xl font-bold mb-1">Your genres</h1>
            <p className="text-stone-500 dark:text-stone-400 text-sm mb-8">
            Pick up to 5 genres. Your feed weights these alongside books you've liked.
            </p>

            {loading ? (
            <div className="flex justify-center mt-10">
                <div className="w-8 h-8 rounded-full border-4 border-stone-200 dark:border-stone-700 border-t-stone-900 dark:border-t-stone-100 animate-spin" />
            </div>
            ) : (
            <>
                <GenrePicker selected={genres} onChange={setGenres} />
                <button
                onClick={handleSave}
                disabled={saving || genres.length === 0}
                className="mt-10 w-full py-3.5 rounded-xl font-semibold bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                >
                {saving ? "Saving..." : saved ? "Saved ✓" : "Save preferences"}
                </button>
            </>
            )}
        </main>
    </div>
  );
}