export function ebayValueFrom(samples: number[]): number | null {
  if (!samples || samples.length === 0) return null;
  
  const sorted = [...samples].sort((a, b) => a - b);
  let arr = sorted;
  
  if (sorted.length >= 3) {
    const cut = Math.max(1, Math.floor(sorted.length * 0.1));
    arr = sorted.slice(cut, sorted.length - cut);
    if (arr.length === 0) arr = sorted;
  }
  
  const mid = Math.floor(arr.length / 2);
  const median = arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
  return Math.round(median);
}

export function myMaxBidFrom(ebayValue: number | null): number | null {
  if (ebayValue == null) return null;
  return Math.round(((ebayValue / 1.15) / 3) / 1.15);
}

export function isUndervalued(currentBid: number | null, myMaxBid: number | null): boolean {
  if (currentBid == null || myMaxBid == null) return false;
  return currentBid <= myMaxBid;
}
