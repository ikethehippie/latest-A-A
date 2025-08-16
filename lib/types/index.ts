export interface ScrapedLot {
  lotNumber: string;
  title: string;
  currentBid: number;
  lotUrl: string;
}

export interface AnalysisRow {
  lotNumber: string;
  itemTitle: string;
  ebayValue: number | null;
  ebayValueLink: string;
  myMaxBid: number | null;
  myMaxBidLink: string;
  currentBid: number;
  undervalued: boolean;
}
