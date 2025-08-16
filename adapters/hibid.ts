import fetch from 'node-fetch';
import { ScrapedLot } from '../types';

export async function scrapeHiBid(url: string): Promise<ScrapedLot[]> {
  const cheerio = await import('cheerio');
  const lots: ScrapedLot[] = [];
  let page = 1;
  const maxPages = 50;
  
  while (page <= maxPages) {
    try {
      const pageUrl = `${url}${url.includes('?') ? '&' : '?'}page=${page}`;
      const response = await fetch(pageUrl);
      
      if (!response.ok) break;
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      let foundLots = false;
      $('.lot, .lot-item, [data-lot]').each((i, el) => {
        foundLots = true;
        
        const $el = $(el);
        const lotNumber = $el.find('.lot-num, .lot-number').text().trim().replace(/[^\d]/g, '') ||
                         $el.attr('data-lot') || '';
        
        const title = $el.find('.lot-desc, .description, .title').text().trim();
        
        const bidText = $el.find('.current-bid, .high-bid').text().trim();
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
      
      if (!foundLots) break;
      page++;
    } catch (error) {
      console.error(`HiBid page ${page} error:`, error);
      break;
    }
  }
  
  return lots;
}

function parseCurrency(text: string): number {
  const match = text.match(/\$?([\d,]+\.?\d*)/);
  return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
}
