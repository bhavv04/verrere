"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import SwipeStack from "@/components/SwipeStack";
import { Book } from "@/lib/books";
import Navbar from "@/components/Navbar";

const CACHE_KEY = "verso_feed";
const CACHE_TTL = 45 * 60 * 1000;

function getCache(): Book[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const { books, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(CACHE_KEY); return []; }
    return books ?? [];
  } catch { return []; }
}

function setCache(books: Book[]) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ books, ts: Date.now() })); } catch {}
}

function popCache(n: number): Book[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const popped = parsed.books.slice(-n);
    parsed.books = parsed.books.slice(0, -n);
    localStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
    return popped;
  } catch { return []; }
}

function cacheSize(): number {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw).books.length : 0;
  } catch { return 0; }
}

async function getShelfIds(): Promise<Set<string>> {
  try {
    const res = await fetch("/api/shelf");
    const data = await res.json();
    return new Set((data.books ?? []).map((b: any) => b.googleBooksId));
  } catch {
    return new Set();
  }
}

const BATCH = 30;

let sessionInitialized = false;
let cachedStack: Book[] = [];

function SkeletonLoader() {
  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-16 w-full max-w-5xl mx-auto animate-pulse">
      {/* Left col: responsive card skeleton matching mobile upgrades */}
      <div className="flex flex-col items-center gap-6 flex-shrink-0 w-full lg:w-auto">
        <div className="w-[85vw] h-[120vw] sm:w-[280px] sm:h-[420px] max-w-sm rounded-2xl bg-stone-200 dark:bg-stone-800" />
        <div className="flex gap-4 w-[85vw] sm:w-full max-w-sm">
          <div className="flex-1 h-[52px] rounded-full bg-stone-200 dark:bg-stone-800" />
          <div className="flex-1 h-[52px] rounded-full bg-stone-200 dark:bg-stone-800" />
        </div>
        <div className="h-3 w-16 rounded-full bg-stone-200 dark:bg-stone-800" />
      </div>

      {/* Right col: details skeleton */}
      <div className="flex-1 min-w-0 pt-1 flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-3/4 rounded-full bg-stone-200 dark:bg-stone-800" />
          <div className="h-8 w-1/2 rounded-full bg-stone-200 dark:bg-stone-800" />
          <div className="h-4 w-1/3 rounded-full bg-stone-200 dark:bg-stone-800 mt-1" />
        </div>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3.5 h-3.5 rounded-sm bg-stone-200 dark:bg-stone-800" />
          ))}
        </div>
        <div className="flex gap-1.5">
          {[80, 64, 96, 72].map((w, i) => (
            <div key={i} className="h-6 rounded-full bg-stone-200 dark:bg-stone-800" style={{ width: w }} />
          ))}
        </div>
        <div className="h-px bg-stone-200 dark:bg-stone-800" />
        <div className="flex flex-col gap-2">
          {["100%", "100%", "100%", "100%", "100%", "60%"].map((w, i) => (
            <div key={i} className="h-3 rounded-full bg-stone-200 dark:bg-stone-800" style={{ width: w }} />
          ))}
        </div>
        <div className="flex gap-5">
          <div className="h-3 w-20 rounded-full bg-stone-200 dark:bg-stone-800" />
          <div className="h-3 w-12 rounded-full bg-stone-200 dark:bg-stone-800" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const fetching = useRef(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/user")
        .then(r => r.json())
        .then(data => {
        if (!data.user?.genres?.length) router.replace("/onboarding");
        });
    }, [user]);

  useEffect(() => {
    if (isLoaded && !user) router.push("/sign-in");
  }, [isLoaded, user]);

  useEffect(() => {
    if (user) {
      fetch("/api/user", { method: "POST" })
        .then((r) => r.json())
        .then((data) => {
          if (sessionInitialized && cachedStack.length > 0) {
            setBooks(cachedStack);
            setLoading(false);
            return;
          }
          if (sessionInitialized) return;
          sessionInitialized = true;
          const userGenres = data.user?.genres ?? [];
          if (userGenres.length === 0) router.push("/onboarding");
          else loadBooks(false);
        });
    }
  }, [user]);

  const fetchFeed = useCallback(async (attempt = 0): Promise<Book[]> => {
    if (fetching.current) return [];
    fetching.current = true;
    try {
      const res = await fetch("/api/feed");
      const data = await res.json();
      const books: Book[] = data.books ?? [];
      if (books.length === 0 && attempt < 3) {
        fetching.current = false;
        await new Promise((r) => setTimeout(r, 1500));
        return fetchFeed(attempt + 1);
      }
      setCache(books);
      return books;
    } catch {
      fetching.current = false;
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 1500));
        return fetchFeed(attempt + 1);
      }
      return [];
    } finally {
      fetching.current = false;
    }
  }, []);

  const loadBooks = useCallback(async (fromEmpty: boolean) => {
    const shelfIds = await getShelfIds();
    const cached = getCache();
    if (cached.length >= BATCH) {
      const batch = popCache(BATCH).filter((b) => !shelfIds.has(b.id));
      cachedStack = batch;
      setBooks(batch);
      setLoading(false);
      if (cacheSize() < 10) fetchFeed();
      return;
    }
    setLoading(true);
    const fresh = await fetchFeed();
    if (fresh.length > 0) {
      const batch = popCache(BATCH);
      const finalBatch = (batch.length > 0 ? batch : fresh.slice(0, BATCH))
        .filter((b) => !shelfIds.has(b.id));
      cachedStack = finalBatch;
      setBooks(finalBatch);
    } else {
      setBooks([]);
    }
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 dark:bg-stone-950 text-black dark:text-stone-100">
        <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 w-full">
        {loading ? (
          <SkeletonLoader />
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-stone-400">No books found.</p>
            <button
              onClick={() => loadBooks(true)}
              className="text-sm text-stone-900 dark:text-stone-100 hover:opacity-60 transition-opacity"
            >
              Try again →
            </button>
          </div>
        ) : (
          <SwipeStack
            books={books}
            onEmpty={() => loadBooks(true)}
            onStackChange={(stack) => { cachedStack = stack; }}
          />
        )}
      </main>
    </div>
  );
}