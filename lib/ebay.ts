import fetch from 'node-fetch';

export async function fetchEbaySoldComps(title: string, count: number = 5): Promise<number[]> {
  // First try eBay API if credentials are available
  if (process.env.EBAY_APP_ID) {
    try {
      return await fetchViaAPI(title, count);
    } catch (error) {
      console.log('eBay API failed, falling back to scraping:', error);
    }
  }
  
  // Fallback to scraping
  return await fetchViaScraping(title, count);
}

async function fetchViaAPI(title: string, count: number): Promise<number[]> {
  // Implement eBay API call here when credentials are available
  throw new Error('eBay API not implemented yet');
}

async function fetchViaScraping(title: string, count: number): Promise<number[]> {
  const searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(title)}&LH_Sold=1&LH_Complete=1&_ipg=50`;
  
  try {
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const cheerio = await import('cheerio');
    const $ = cheerio.load(html);
    
    const prices: number[] = [];
    
    // Try multiple selectors for sold prices
    $('.s-item__price').each((i, el) => {
      if (prices.length >= count) return false;
      
      const priceText = $(el).text().trim();
      const match = priceText.match(/\$?([\d,]+\.?\d*)/);
      if (match) {
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price > 0) {
          prices.push(price);
        }
      }
    });
    
    return prices;
  } catch (error) {
    console.error('eBay scraping failed:', error);
    return [];
  }
}
