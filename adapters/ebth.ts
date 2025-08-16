// adapters/ebth.ts
import fetch from 'node-fetch';
import { ScrapedLot } from '../types';

export async function scrapeEBTH(url: string): Promise<ScrapedLot[]> {
  const cheerio = await import('cheerio');
  const lots: ScrapedLot[] = [];
  
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    $('.lot-item, .auction-lot, [data-lot-id]').each((i, el) => {
      const $el = $(el);
      
      const lotNumber = $el.find('.lot-number').text().trim().replace(/[^\d]/g, '') ||
                       $el.attr('data-lot-id') || '';
      
      const title = $el.find('.lot-title, .item-name, h2, h3').text().trim();
      
      const bidText = $el.find('.current-price, .high-bid').text().trim();
      const currentBid = parseCurrency(bidText);
      
      const lotLink = $el.find('a').attr('href') || '';
      const lotUrl = lotLink.startsWith('http') ? lotLink : new URL(lotLink, url).href;
      
      if (lotNumber && title) {
        lots.push({
          lotNumber,
          title,
          currentBid,
          lotUrl
        });
      }
    });
  } catch (error) {
    console.error('EBTH scraping error:', error);
  }
  
  return lots;
}

function parseCurrency(text: string): number {
  const match = text.match(/\$?([\d,]+\.?\d*)/);
  return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
}
