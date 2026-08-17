export const ENTRIES_PAGE_SIZE = 20;

export type PageToken = number | "ellipsis";

export function parsePageParam(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export function clampPage(page: number, totalPages: number): number {
  const max = Math.max(1, totalPages);
  return Math.min(Math.max(1, page), max);
}

/** Windowed page list matching 1 2 3 4 .. last. Never mutates inputs. */
export function getVisiblePages(current: number, total: number): PageToken[] {
  if (total < 1) return [];
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const page = clampPage(current, total);

  if (page <= 3) {
    return [1, 2, 3, 4, "ellipsis", total];
  }

  if (page >= total - 2) {
    return [1, "ellipsis", total - 3, total - 2, total - 1, total];
  }

  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", total];
}

/** Clone query string and set page. Does not mutate the source. */
export function pageHref(queryString: string, page: number): string {
  const params = new URLSearchParams(queryString);
  if (page <= 1) params.delete("page");
  else params.set("page", String(page));
  const qs = params.toString();
  return qs ? `?${qs}` : "?";
}
