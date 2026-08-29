// Display formatting. All user-facing text is Russian.

/** "12:34" from a number of seconds; an em dash when the time is unknown. */
export function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

/** "28.08.2026" from an ISO timestamp. */
export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** "A", "B", "C" … for the answer option at a given index. */
export function optionLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

/** Russian plural for a count of days: 1 день, 2 дня, 5 дней. */
export function pluralDays(count: number): string {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) return `${count} дней`;
  if (mod10 === 1) return `${count} день`;
  if (mod10 >= 2 && mod10 <= 4) return `${count} дня`;
  return `${count} дней`;
}
