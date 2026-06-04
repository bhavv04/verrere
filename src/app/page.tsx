"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import SwipeStack from "@/components/SwipeStack";
import { Book } from "@/lib/books";
import { BookOpen, Settings } from "lucide-react";

const CACHE_KEY = "verso_feed";
const CACHE_TTL = 45 * 60 * 1000; // 45 min

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

const BATCH = 30;

// Module-level flag — persists across navigations
let sessionInitialized = false;
let cachedStack: Book[] = []; // persists across navigations

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState("Finding books for you...");
  const fetching = useRef(false);

  useEffect(() => {
    if (isLoaded && !user) router.push("/sign-in");
  }, [isLoaded, user]);

    useEffect(() => {
    if (user) {
        fetch("/api/user", { method: "POST" })
        .then((r) => r.json())
        .then((data) => {
            if (sessionInitialized && cachedStack.length > 0) {
            // Just restore exactly where we left off
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
        // Retry after a short delay
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

    const loadBooks = useCallback(async (fromEmpty: boolean) => {
        const cached = getCache();

        if (cached.length >= BATCH) {
            const batch = popCache(BATCH);
            cachedStack = batch; // ← sync
            setBooks(batch);
            setLoading(false);
            if (cacheSize() < 10) fetchFeed();
            return;
        }

        if (!fromEmpty) setLoadingMsg("Building your feed...");
        setLoading(true);

        const fresh = await fetchFeed();
        if (fresh.length > 0) {
            const batch = popCache(BATCH);
            const finalBatch = batch.length > 0 ? batch : fresh.slice(0, BATCH);
            cachedStack = finalBatch; // ← sync
            setBooks(finalBatch);
        } else {
            setBooks([]);
        }
        setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1a2e] flex flex-col">
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-[#e8e4dc] sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1a1a2e] flex items-center justify-center shadow-sm">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-[#1a1a2e]">verso</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/shelf")}
            className="text-sm font-medium text-[#6b7280] hover:text-[#1a1a2e] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#f0ece4]"
          >
            My Shelf
          </button>
          <button
            onClick={() => router.push("/preferences")}
            className="p-2 rounded-lg text-[#6b7280] hover:text-[#1a1a2e] hover:bg-[#f0ece4] transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
          <UserButton />
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-[#e8e4dc] border-t-[#1a1a2e] animate-spin" />
            <p className="text-[#6b7280] text-sm">{loadingMsg}</p>
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-[#6b7280]">No books found.</p>
            <button
              onClick={() => loadBooks(true)}
              className="text-sm text-[#1a1a2e] hover:text-[#6b7280] font-medium"
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