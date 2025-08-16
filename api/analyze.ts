import { NextRequest, NextResponse } from 'next/server';
import { cleanTitle, ebaySoldLink } from '../../../lib/cleanTitle';
import { ebayValueFrom, myMaxBidFrom, isUndervalued } from '../../../lib/stats';
import { fetchEbaySoldComps } from '../../../lib/ebay';
import { scrapeEquipBid } from '../../../adapters/equipbid';
import { scrapeHiBid } from '../../../adapters/hibid';
import { scrapeMidwest } from '../../../adapters/midwest';
import { scrapeEBTH } from '../../../adapters/ebth';
import { scrapeInvaluable } from '../../../adapters/invaluable';

export async function POST(request: NextRequest) {
  try {
    const { auctionUrl, recentCount = 5, stripLotPrefix = true } = await request.json();
    
    if (!auctionUrl) {
      return NextResponse.json({ error: 'auctionUrl required' }, { status: 400 });
    }
    
    // Step 1: Scrape auction
    const urlObj = new URL(auctionUrl);
    const hostname = urlObj.hostname.toLowerCase();
    
    let lots = [];
    
    if (hostname.includes('equip-bid.com')) {
      lots = await scrapeEquipBid(auctionUrl);
    } else if (hostname.includes('hibid.com')) {
      lots = await scrapeHiBid(auctionUrl);
    } else if (hostname.includes('midwest.auction')) {
      lots = await scrapeMidwest(auctionUrl);
    } else if (hostname.includes('ebth.com') || hostname.includes('etbh.com')) {
      lots = await scrapeEBTH(auctionUrl);
    } else if (hostname.includes('invaluable.com')) {
      lots = await scrapeInvaluable(auctionUrl);
    } else {
      return NextResponse.json({ error: 'Unsupported auction site' }, { status: 400 });
    }
    
    // Step 2: Process each lot
    const rows = [];
    
    for (const lot of lots) {
      const title = stripLotPrefix ? cleanTitle(lot.title) : lot.title;
      
      try {
        const soldSamples = await fetchEbaySoldComps(title, recentCount);
        const ebayValue = ebayValueFrom(soldSamples);
        const myMaxBid = myMaxBidFrom(ebayValue);
        const undervalued = isUndervalued(lot.currentBid, myMaxBid);
        
        rows.push({
          lotNumber: lot.lotNumber,
          itemTitle: lot.title,
          ebayValue,
          ebayValueLink: ebaySoldLink(title),
          myMaxBid,
          myMaxBidLink: lot.lotUrl,
          currentBid: lot.currentBid,
          undervalued
        });
      } catch (error) {
        console.error(`Processing failed for lot ${lot.lotNumber}:`, error);
        
        // Include row with null values
        rows.push({
          lotNumber: lot.lotNumber,
          itemTitle: lot.title,
          ebayValue: null,
          ebayValueLink: ebaySoldLink(title),
          myMaxBid: null,
          myMaxBidLink: lot.lotUrl,
          currentBid: lot.currentBid,
          undervalued: false
        });
      }
    }
    
    return NextResponse.json({ rows });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
