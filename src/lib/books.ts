const HARDCOVER_API_URL = "https://api.hardcover.app/v1/graphql";

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  rating: number | null;
  genres: string[];
  pageCount: number | null;
  publishedDate: string | null;
  subjects?: string[];
  editions?: number | null;
  openLibraryKey?: string | null;
}

async function hardcoverQuery(query: string, variables: Record<string, any> = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(HARDCOVER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.HARDCOVER_API_KEY}`,
        },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      if (!res.ok) throw new Error(`Hardcover API error: ${res.status}`);
      return res.json();
    } catch (err: any) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

// Map our genre names to Hardcover tag names
const GENRE_TAG_MAP: Record<string, string[]> = {
  "Fantasy": ["Fantasy", "Epic Fantasy", "High Fantasy", "Urban Fantasy"],
  "Science Fiction": ["Science Fiction", "Sci-Fi", "Space Opera", "Cyberpunk"],
  "Mystery": ["Mystery", "Mystery Fiction", "Cozy Mystery"],
  "Thriller": ["Thriller", "Psychological Thriller", "Suspense"],
  "Romance": ["Romance", "Contemporary Romance", "Historical Romance"],
  "Horror": ["Horror", "Dark Fantasy"],
  "Historical Fiction": ["Historical Fiction", "Historical"],
  "Biography": ["Biography", "Memoir", "Autobiography"],
  "Self Help": ["Self-Help", "Self Help", "Personal Development"],
  "Philosophy": ["Philosophy"],
  "Psychology": ["Psychology"],
  "Classic": ["Classics", "Classic Literature"],
  "Adventure": ["Adventure", "Action & Adventure"],
  "Crime": ["Crime", "Crime Fiction", "Detective"],
  "Fiction": ["Literary Fiction", "Contemporary Fiction"],
};

export async function fetchBooksByGenre(genre: string, maxResults = 10): Promise<Book[]> {
  const tags = GENRE_TAG_MAP[genre] ?? [genre];

  // Use _in to match any of the tag variants
  const query = `
    query BooksByGenre($tags: [String!]!, $limit: Int!) {
      books(
        where: {
          taggings: { tag: { tag: { _in: $tags } } }
          image: { url: { _is_null: false } }
          pages: { _gte: 100 }
        }
        order_by: { ratings_count: desc }
        limit: $limit
      ) {
        id
        title
        description
        release_year
        pages
        rating
        ratings_count
        image { url }
        contributions {
          author { name }
        }
        taggings {
          tag { tag }
        }
      }
    }
  `;

  try {
    const data = await hardcoverQuery(query, { tags, limit: maxResults * 2 });

    if (data.errors) {
      console.error("Hardcover errors:", data.errors);
      return [];
    }

    const books = data?.data?.books ?? [];

    // Deduplicate tags and filter noise
    const NOISE_TAGS = new Set([
      "funny", "fast", "slow", "medium", "dark", "hopeful", "emotional",
      "inspiring", "lighthearted", "mysterious", "relaxing", "tense",
      "Plot driven", "Character driven", "A mix driven",
      "Strong Character Development", "Weak Character Development",
      "Loveable Characters", "Unloveable Characters",
      "Diverse Characters", "Not Diverse Characters",
    ]);

    return books
      .map((book: any) => {
        const uniqueTags = [...new Set(
          (book.taggings ?? [])
            .map((t: any) => t.tag?.tag)
            .filter((t: string) => t && !NOISE_TAGS.has(t) && !t.includes("/") && t.length < 30)
        )] as string[];

        return {
          id: String(book.id),
          title: book.title ?? "Unknown Title",
          author: book.contributions?.[0]?.author?.name ?? "Unknown Author",
          coverUrl: book.image?.url ?? "",
          description: book.description ?? "No description available.",
          rating: book.rating ?? null,
          genres: uniqueTags.slice(0, 5),
          pageCount: book.pages ?? null,
          publishedDate: book.release_year ? String(book.release_year) : null,
          subjects: uniqueTags.slice(5, 12),
          editions: null,
          openLibraryKey: null,
        };
      })
      .filter((book: Book) =>
        book.coverUrl !== "" &&
        book.description.length > 150 &&
        book.title !== "Unknown Title"
      )
      .slice(0, maxResults);
  } catch (err) {
    console.error("Hardcover fetch error:", err);
    return [];
  }
}

export async function fetchBulkBooks(genres: string[], limit = 40): Promise<Book[]> {
  const query = `
    query BulkBooks($limit: Int!) {
      books(
        where: {
          image: { url: { _is_null: false } }
          pages: { _gte: 50 }
          rating: { _gte: 3.5 }
        }
        order_by: { ratings_count: desc }
        limit: $limit
      ) {
        id
        title
        description
        release_year
        pages
        rating
        image { url }
        contributions { author { name } }
        taggings { tag { tag } }
      }
    }
  `;

  try {
    const data = await hardcoverQuery(query, { limit });
    if (data.errors) {
      console.error("Hardcover errors:", data.errors);
      return [];
    }

    const books = data?.data?.books ?? [];

    const NOISE_TAGS = new Set([
      "funny", "fast", "slow", "medium", "dark", "hopeful", "emotional",
      "inspiring", "lighthearted", "mysterious", "relaxing", "tense",
      "Plot driven", "Character driven", "A mix driven",
      "Strong Character Development", "Weak Character Development",
      "Loveable Characters", "Unloveable Characters",
      "Diverse Characters", "Not Diverse Characters",
    ]);

    // Filter to only books matching user's genres
    const genreTags = genres.flatMap((g) => GENRE_TAG_MAP[g] ?? [g]).map((t) => t.toLowerCase());

    return books
      .map((book: any) => {
        const uniqueTagList = [...new Set(
          (book.taggings ?? [])
            .map((t: any) => t.tag?.tag)
            .filter((t: string) => t && !NOISE_TAGS.has(t) && !t.includes("/") && t.length < 30)
        )] as string[];

        return {
          id: String(book.id),
          title: book.title ?? "Unknown Title",
          author: book.contributions?.[0]?.author?.name ?? "Unknown Author",
          coverUrl: book.image?.url ?? "",
          description: book.description ?? "No description available.",
          rating: book.rating ?? null,
          genres: uniqueTagList.slice(0, 5),
          pageCount: book.pages ?? null,
          publishedDate: book.release_year ? String(book.release_year) : null,
          subjects: uniqueTagList.slice(5, 12),
          editions: null,
          openLibraryKey: null,
        };
      })
      .filter((book: Book) => {
        if (!book.coverUrl || book.description.length < 100) return false;
        // Keep if any of the book's genres match user preferences
        if (genreTags.length === 0) return true;
        return book.genres.some((g) => genreTags.some((t) => g.toLowerCase().includes(t)));
      });
  } catch (err) {
    console.error("Hardcover bulk fetch error:", err);
    return [];
  }
}