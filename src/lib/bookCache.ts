import { Book } from "./books";

const CACHE_KEY = "verso_book_cache";
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

interface BookCache {
  books: Book[];
  fetchedAt: number;
  genres: string[];
}

export function getCachedBooks(genres: string[]): Book[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const cache: BookCache = JSON.parse(raw);
    const expired = Date.now() - cache.fetchedAt > CACHE_TTL;
    const genresChanged = genres.some((g) => !cache.genres.includes(g));

    if (expired || genresChanged) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return cache.books.length > 0 ? cache.books : null;
  } catch {
    return null;
  }
}

export function setCachedBooks(books: Book[], genres: string[]) {
  try {
    const cache: BookCache = { books, fetchedAt: Date.now(), genres };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage full or unavailable
  }
}

export function popBooksFromCache(count: number): Book[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];

    const cache: BookCache = JSON.parse(raw);
    const popped = cache.books.slice(-count);
    cache.books = cache.books.slice(0, -count);
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    return popped;
  } catch {
    return [];
  }
}

export function getCacheSize(): number {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return 0;
    return JSON.parse(raw).books.length;
  } catch {
    return 0;
  }
}