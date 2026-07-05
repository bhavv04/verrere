import { SignIn } from "@clerk/nextjs";
import genrePreviewBooksRaw from "$/lib/genrePreviewBooks.json";

interface PreviewBook {
  id: string;
  coverUrl: string;
  title: string;
}

type GenreBooksMap = Record<string, PreviewBook[]>;
const genreBooksData = genrePreviewBooksRaw as GenreBooksMap;

// Flatten every genre into one deduped pool of covers to draw columns from.
function getAllBooks(): PreviewBook[] {
  const seen = new Set<string>();
  const all: PreviewBook[] = [];
  for (const books of Object.values(genreBooksData)) {
    for (const book of books) {
      if (book.coverUrl && !seen.has(book.id)) {
        seen.add(book.id);
        all.push(book);
      }
    }
  }
  return all;
}

// Deterministic shuffle (module-scope, so it's stable per server render —
// no client hooks/state needed just to pick an order).
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = seed;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildColumn(pool: PreviewBook[], seed: number, count: number): PreviewBook[] {
  const shuffled = seededShuffle(pool, seed);
  const slice: PreviewBook[] = [];
  for (let i = 0; i < count; i++) {
    slice.push(shuffled[i % shuffled.length]);
  }
  // Duplicate once so the CSS animation can loop seamlessly at -50%.
  return [...slice, ...slice];
}

function BookColumn({
  books,
  direction,
  duration,
}: {
  books: PreviewBook[];
  direction: "up" | "down";
  duration: number;
}) {
  return (
    <div className="relative h-full w-24 shrink-0 overflow-hidden">
      <div
        className="flex flex-col gap-3 will-change-transform"
        style={{
          animation: `${direction === "up" ? "scrollUp" : "scrollDown"} ${duration}s linear infinite`,
        }}
      >
        {books.map((book, i) => (
          <div
            key={`${book.id}-${i}`}
            className="aspect-[2/3] w-24 overflow-hidden rounded-md shadow-lg"
          >
            <img
              src={book.coverUrl}
              alt={book.title}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SignInPage() {
  const allBooks = getAllBooks();

  const columns = [
    { seed: 1, direction: "up" as const, duration: 34 },
    { seed: 2, direction: "down" as const, duration: 42 },
    { seed: 3, direction: "up" as const, duration: 50 },
    { seed: 4, direction: "down" as const, duration: 30 },
    { seed: 5, direction: "up" as const, duration: 46 },
    { seed: 6, direction: "down" as const, duration: 38 },
    { seed: 7, direction: "up" as const, duration: 44 },
    { seed: 8, direction: "down" as const, duration: 33 },
    { seed: 9, direction: "up" as const, duration: 40 },
    { seed: 10, direction: "down" as const, duration: 48 },
    { seed: 11, direction: "up" as const, duration: 36 },
    { seed: 12, direction: "down" as const, duration: 45 },
    { seed: 13, direction: "up" as const, duration: 41 },
    { seed: 14, direction: "down" as const, duration: 32 },
  ].map((c) => ({ ...c, books: buildColumn(allBooks, c.seed, 12) }));

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stone-950">
      {/* Carousel columns — rotated for a diagonal wall of covers */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          className="flex justify-between gap-3"
          style={{
            transform: "rotate(-10deg) scale(1.4)",
            width: "160vw",
            height: "160vh",
          }}
        >
          {columns.map((col, i) => (
            <BookColumn
              key={i}
              books={col.books}
              direction={col.direction}
              duration={col.duration}
            />
          ))}
        </div>
      </div>

      {/* Darken + fade edges so the form stays readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/70 to-stone-950" />
      <div className="absolute inset-0 bg-stone-950/30" />

      {/* Sign-in form */}
      <div className="relative z-10">
        <SignIn
          appearance={{
            variables: {
            },
            layout: {
              unsafe_disableDevelopmentModeWarnings: true,
            },
            elements: {
            },
          }}
        />
      </div>
    </div>
  );
}