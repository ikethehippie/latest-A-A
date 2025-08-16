export function cleanTitle(raw: string): string {
  let t = raw.trim();
  t = t.replace(/^lot\s*#?\s*\d+\s*[:-]?\s*/i, "");
  t = t.replace(/\s+/g, " ");
  return t.trim();
}
