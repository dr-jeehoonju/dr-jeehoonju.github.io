import type { CollectionEntry } from "astro:content";

export function sortNotes(
  a: CollectionEntry<"notes">,
  b: CollectionEntry<"notes">,
) {
  const firstDate = a.data.date ?? "";
  const secondDate = b.data.date ?? "";
  if (firstDate !== secondDate) return firstDate > secondDate ? -1 : 1;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

export function formatNoteDate(date: string, lang: "en" | "ko" = "en") {
  return new Intl.DateTimeFormat(lang === "ko" ? "ko-KR" : "en-GB", {
    day: "numeric",
    month: lang === "ko" ? "long" : "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
