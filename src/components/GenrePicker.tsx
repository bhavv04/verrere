"use client";

const GENRES = [
  "Fiction", "Fantasy", "Science Fiction", "Mystery", "Thriller",
  "Romance", "Horror", "Historical Fiction", "Biography", "Self Help",
  "Philosophy", "Psychology", "Classic", "Adventure", "Crime",
];

interface GenrePickerProps {
  selected: string[];
  onChange: (genres: string[]) => void;
}

export default function GenrePicker({ selected, onChange }: GenrePickerProps) {
  const toggle = (genre: string) => {
    if (selected.includes(genre)) {
      onChange(selected.filter((g) => g !== genre));
    } else if (selected.length < 5) {
      onChange([...selected, genre]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {GENRES.map((genre) => {
        const active = selected.includes(genre);
        return (
          <button
            key={genre}
            onClick={() => toggle(genre)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              active
                ? "bg-[#1a1a2e] text-white border-[#1a1a2e]"
                : "bg-white text-[#6b7280] border-[#e8e4dc] hover:border-[#1a1a2e]/30 hover:text-[#1a1a2e]"
            }`}
          >
            {genre}
          </button>
        );
      })}
    </div>
  );
}