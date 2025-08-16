export function cleanTitle(raw: string): string {
  let t = raw.trim();
  t = t.replace(/^lot\s*#?\s*\d+\s*[:-]?\s*/i, "");
  t = t.replace(/\s+/g, " ");
  return t.trim();
}

export function ebaySoldLink(title: string): string {
  const q = encodeURIComponent(title);
  return `https://www.ebay.com/sch/i.html?_nkw=${q}&LH_Sold=1&LH_Complete=1`;
}
