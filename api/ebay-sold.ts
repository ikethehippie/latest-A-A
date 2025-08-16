import { NextRequest, NextResponse } from 'next/server';
import { fetchEbaySoldComps } from '../../../lib/ebay';
import { cleanTitle } from '../../../lib/cleanTitle';
import { ebayValueFrom } from '../../../lib/stats';

export async function POST(request: NextRequest) {
  try {
    const { items, recentCount = 5, stripLotPrefix = true } = await request.json();
    
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Items array required' }, { status: 400 });
    }
    
    const results = [];
    
    for (const item of items) {
      const title = stripLotPrefix ? cleanTitle(item.title) : item.title;
      
      try {
        const soldSamples = await fetchEbaySoldComps(title, recentCount);
        const ebayValue = ebayValueFrom(soldSamples);
        
        results.push({
          title: item.title,
          soldSamples,
          ebayValue
        });
      } catch (error) {
        console.error(`eBay lookup failed for "${title}":`, error);
        results.push({
          title: item.title,
          soldSamples: [],
          ebayValue: null
        });
      }
    }
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error('eBay API error:', error);
    return NextResponse.json({ error: 'Failed to fetch eBay data' }, { status: 500 });
  }
}
