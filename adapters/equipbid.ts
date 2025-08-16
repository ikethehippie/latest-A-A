import fetch from 'node-fetch';
import { ScrapedLot } from '../types';

export async function scrapeEquipBid(url: string): Promise<ScrapedLot[]> {
  const cheerio = await import('cheerio');
  const lots: ScrapedLot[] = [];
  let page = 1;
  const maxPages = 50; // Safety limit
  
  while (page <= maxPages) {
    try {
      const pageUrl = `${url}${url.includes('?') ? '&' : '?'}page=${page}`;
      const response = await fetch(pageUrl);
      
      if (!response.ok) break;
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      let foundLots = false;
      $('.lot-item, .auction-lot, [data-lot-number]').each((i, el) => {
        foundLots = true;
        
        const $el = $(el);
        const lotNumber = $el.find('.lot-number').text().trim() || 
                         $el.attr('data-lot-number') || 
                         $el.find('[class*="lot"]').first().text().match(/\d+/)?.[0] || '';
        
        const title = $el.find('.lot-title, .title, h3, h4').text().trim();
        
        const bidText = $el.find('.current-bid, .bid-amount, [class*="bid"]').text().trim();
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
      console.error(`EquipBid page ${page} error:`, error);
      break;
    }
  }
  
  return lots;
}

function parseCurrency(text: string): number {
  const match = text.match(/\$?([\d,]+\.?\d*)/);
  return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
}
