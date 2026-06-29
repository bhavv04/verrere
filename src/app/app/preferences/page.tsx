"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Check } from "lucide-react";
import {
  BookOpen, Sparkles, Rocket, Search, Zap, Heart,
  Skull, Landmark, User, Leaf, Brain, MessageCircle,
  ScrollText, Map, Shield
} from "lucide-react";

const GENRES = [
  { name: "Fiction", icon: BookOpen },
  { name: "Fantasy", icon: Sparkles },
  { name: "Science Fiction", icon: Rocket },
  { name: "Mystery", icon: Search },
  { name: "Thriller", icon: Zap },
  { name: "Romance", icon: Heart },
  { name: "Horror", icon: Skull },
  { name: "Historical Fiction", icon: Landmark },
  { name: "Biography", icon: User },
  { name: "Self Help", icon: Leaf },
  { name: "Philosophy", icon: Brain },
  { name: "Psychology", icon: MessageCircle },
  { name: "Classic", icon: ScrollText },
  { name: "Adventure", icon: Map },
  { name: "Crime", icon: Shield },
];
interface PreviewBook {
  id: string;
  coverUrl: string;
  title: string;
}

export default function PreferencesPage() {
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewBooks, setPreviewBooks] = useState<PreviewBook[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    fetch("/api/user", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        const userGenres = data.user?.genres?.map((g: any) => g.genre) ?? [];
        setGenres(userGenres);
      })
      .finally(() => setLoading(false));
  }, []);

  const fetchPreview = useCallback(async (selectedGenres: string[]) => {
    if (selectedGenres.length === 0) {
      setPreviewBooks([]);
      return;
    }
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/books?genres=${selectedGenres.map(encodeURIComponent).join(",")}`);
      const data = await res.json();
      const books = (data.books ?? [])
        .filter((b: any) => b.coverUrl)
        .slice(0, 12);
      setPreviewBooks(books);
    } catch {
      setPreviewBooks([]);
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) fetchPreview(genres);
  }, [genres, loading]);

  const toggle = (genre: string) => {
    const next = genres.includes(genre)
      ? genres.filter((g) => g !== genre)
      : genres.length < 5
      ? [...genres, genre]
      : genres;
    setGenres(next);
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ genres }),
    });
    localStorage.removeItem("verrere_feed");
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-28 pb-16">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Preferences</h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
            Pick up to 5 genres to customize your feed.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

          {/* LEFT — Genre picker */}
          <div className="w-full lg:w-72 flex-shrink-0">

            {/* Counter */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                Genres
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                genres.length === 5
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500"
              }`}>
                {genres.length}/5
              </span>
            </div>

            {/* Genre list */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 rounded-full border-2 border-stone-200 dark:border-stone-700 border-t-stone-900 dark:border-t-stone-100 animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {GENRES.map((genre) => {
                  const active = genres.includes(genre.name);
                  const disabled = !active && genres.length >= 5;
                  return (
                    <motion.button
                      key={genre.name}
                      onClick={() => toggle(genre.name)}
                      disabled={disabled}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                        active
                          ? "bg-stone-900 dark:bg-stone-100 border-stone-900 dark:border-stone-100 text-white dark:text-stone-900"
                          : disabled
                          ? "bg-transparent border-stone-100 dark:border-stone-800/50 text-stone-300 dark:text-stone-700 cursor-not-allowed"
                          : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/50"
                      }`}
                    >
                      <span className="text-lg flex-shrink-0">
                        <genre.icon className="w-5 h-5" />
                      </span>
                      <span className="text-sm font-medium flex-1">{genre.name}</span>
                      <AnimatePresence>
                        {active && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Check className="w-3.5 h-3.5 text-white dark:text-stone-900 flex-shrink-0" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Save button */}
            <motion.button
              onClick={handleSave}
              disabled={saving || genres.length === 0}
              whileTap={{ scale: 0.98 }}
              className="mt-6 w-full py-3.5 rounded-xl font-semibold text-sm bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 dark:border-stone-900/30 border-t-white dark:border-t-stone-900 animate-spin" />
                  Saving...
                </span>
              ) : saved ? (
                <span className="flex items-center justify-center gap-2">
                  <Check className="w-3.5 h-3.5" />
                  Saved
                </span>
              ) : (
                "Save preferences"
              )}
            </motion.button>
          </div>

          {/* RIGHT — Book preview */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                Preview
              </span>
              {previewBooks.length > 0 && (
                <span className="text-xs text-stone-400 dark:text-stone-600">
                  {previewBooks.length} books
                </span>
              )}
            </div>

            {genres.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800">
                <BookOpen className="w-8 h-8 text-stone-300 dark:text-stone-700 mb-3" />
                <p className="text-stone-400 dark:text-stone-600 text-sm">
                  Select genres to preview your feed
                </p>
              </div>
            ) : previewLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[2/3] rounded-xl bg-stone-200 dark:bg-stone-800 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3"
              >
                <AnimatePresence mode="popLayout">
                  {previewBooks.map((book, i) => (
                    <motion.div
                      key={book.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className="aspect-[2/3] rounded-xl overflow-hidden shadow-sm border border-stone-100 dark:border-stone-800 group relative"
                    >
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Subtle title overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-2">
                        <p className="text-white text-xs font-medium line-clamp-2 leading-tight">
                          {book.title}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}