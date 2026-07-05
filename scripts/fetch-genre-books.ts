// scripts/fetch-genre-books.ts
// Run with: npx tsx scripts/fetch-genre-books.ts
import fs from "fs";
import path from "path";
import "dotenv/config";

const HARDCOVER_API_URL = "https://api.hardcover.app/v1/graphql";
const API_TOKEN = process.env.HARDCOVER_API_KEY;

const GENRES = [
  "Fiction", "Fantasy", "Science Fiction", "Mystery", "Thriller",
  "Romance", "Horror", "Historical Fiction", "Biography", "Self Help",
  "Philosophy", "Psychology", "Classic", "Adventure", "Crime",
];

const BOOKS_PER_GENRE = 60;

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

function buildQuery(genre: string, limit: number) {
  // escape any quotes in genre just in case
  const safeGenre = genre.replace(/"/g, '\\"');
  return `
    query GenreBooks {
      books(
        where: { cached_tags: { _contains: { Genre: [{ tag: "${safeGenre}" }] } } }
        order_by: { users_count: desc }
        limit: ${limit}
      ) {
        id
        title
        image {
          url
        }
      }
    }
  `;
}

async function fetchGenreBooks(genre: string) {
  const res = await fetch(HARDCOVER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: JSON.stringify({ query: buildQuery(genre, BOOKS_PER_GENRE) }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${genre}: ${await res.text()}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL error for ${genre}: ${JSON.stringify(json.errors)}`);
  }

  return json.data.books
    .filter((b: any) => b.image?.url)
    .map((b: any) => ({
      id: String(b.id),
      title: b.title,
      coverUrl: b.image.url,
    }));
}

async function main() {
  const outPath = path.join(process.cwd(), "lib", "genrePreviewBooks.json");

  // ensure lib/ exists
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

    let result: Record<string, { id: string; title: string; coverUrl: string }[]> = {};

    if (fs.existsSync(outPath)) {
    try {
        const raw = fs.readFileSync(outPath, "utf-8").trim();
        result = raw ? JSON.parse(raw) : {};
        console.log(`Resuming. Already have: ${Object.keys(result).join(", ")}`);
    } catch (err) {
        console.error(`Warning: existing ${outPath} was invalid JSON, starting fresh. (${err})`);
        result = {};
    }
    }

  for (const genre of GENRES) {
    if (result[genre]) {
      console.log(`Skipping ${genre} (already fetched)`);
      continue;
    }

    console.log(`Fetching: ${genre}...`);
    try {
      result[genre] = await fetchGenreBooks(genre);
      console.log(`  -> got ${result[genre].length} books`);
    } catch (err) {
      console.error(`  -> FAILED: ${err}`);
      result[genre] = [];
    }

    // write after every genre, not just at the end
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2));

    console.log("  waiting 60s...");
    await sleep(60_000);
  }

  console.log(`Done. Wrote ${outPath}`);
}

main();