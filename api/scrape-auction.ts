import { NextRequest, NextResponse } from 'next/server';
import { scrapeEquipBid } from '../../../adapters/equipbid';
import { scrapeHiBid } from '../../../adapters/hibid';
import { scrapeMidwest } from '../../../adapters/midwest';
import { scrapeEBTH } from '../../../adapters/ebth';
import { scrapeInvaluable } from '../../../adapters/invaluable';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
  }
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    let lots = [];
    let source = '';
    
    if (hostname.includes('equip-bid.com')) {
      lots = await scrapeEquipBid(url);
      source = 'equip-bid.com';
    } else if (hostname.includes('hibid.com')) {
      lots = await scrapeHiBid(url);
      source = 'hibid.com';
    } else if (hostname.includes('midwest.auction')) {
      lots = await scrapeMidwest(url);
      source = 'midwest.auction';
    } else if (hostname.includes('ebth.com') || hostname.includes('etbh.com')) {
      lots = await scrapeEBTH(url);
      source = 'ebth.com';
    } else if (hostname.includes('invaluable.com')) {
      lots = await scrapeInvaluable(url);
      source = 'invaluable.com';
    } else {
      return NextResponse.json({ error: 'Unsupported auction site' }, { status: 400 });
    }
    
    return NextResponse.json({ source, lots });
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: 'Failed to scrape auction' }, { status: 500 });
  }
}
