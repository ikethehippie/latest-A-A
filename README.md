# Auction Analysis Tool

A comprehensive web application that scrapes auction sites and provides eBay comparable pricing analysis to help identify undervalued lots.

## Features

- **Multi-Site Support**: Scrapes equip-bid.com, hibid.com, midwest.auction, ebth.com/etbh.com, and invaluable.com
- **eBay Integration**: Fetches sold comparable prices for accurate valuation
- **Smart Analysis**: Calculates maximum bid recommendations using the formula: ((eBay Value / 1.15) / 3) / 1.15
- **Undervalued Detection**: Automatically flags lots where current bid ≤ recommended max bid
- **Interactive Table**: Sortable columns with direct links to eBay searches and auction lots
- **CSV Export**: Download results with all data including direct links

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env.local` and add your eBay API credentials (optional - falls back to scraping):
   ```
   EBAY_APP_ID=your_app_id
   EBAY_CERT_ID=your_cert_id
   EBAY_DEV_ID=your_dev_id
   EBAY_OAUTH_TOKEN=your_token
   ```

3. **Development**
   ```bash
   npm run dev
   ```

4. **Production Deployment**
   Deploy to Vercel with Node.js 20 runtime (configured in vercel.json)

## Usage

1. **Enter Auction URL**: Paste any supported auction site URL
2. **Configure Options**: Choose whether to remove "Lot X" prefixes from titles
3. **Analyze**: Click to scrape auction data and fetch eBay comparables
4. **Review Results**: Sort by any column, filter to show only undervalued items
5. **Export**: Download CSV with all data and direct links

## API Endpoints

- `GET /api/scrape-auction?url=...` - Scrape auction site for lot data
- `POST /api/ebay-sold` - Fetch eBay sold comparables for items
- `POST /api/analyze` - Complete analysis pipeline

## Architecture

- **Frontend**: Next.js 14 with App Router, React, TypeScript
- **Backend**: Next.js API routes with server-side scraping
- **Scraping**: Cheerio for HTML parsing, resilient selectors per site
- **Rate Limiting**: Built-in delays and retry logic for eBay requests
- **Deployment**: Optimized for Vercel with Node.js 20 runtime

## Supported Auction Sites

| Site | Domain | Features |
|------|--------|----------|
| EquipBid | equip-bid.com | Pagination support, lot numbers, current bids |
| HiBid | hibid.com | List/grid views, multiple pages |
| Midwest Auction | midwest.auction | Lot cards, current pricing |
| EBTH | ebth.com, etbh.com | Item listings, current prices |
| Invaluable | invaluable.com | International lots, estimates |

## Business Logic

- **Title Cleaning**: Removes "Lot X" prefixes and normalizes spacing
- **eBay Valuation**: Uses up to 5 most recent sold prices, trims extremes (10%), calculates median
- **Max Bid Formula**: ((eBay Value / 1.15) / 3) / 1.15 - accounts for fees and profit margins
- **Undervalued Detection**: Flags when current bid ≤ calculated max bid

## Error Handling

- Graceful failures for individual lots
- Continues processing when some eBay lookups fail
- Rate limiting with exponential backoff
- Comprehensive logging for debugging

## Performance

- Server-side processing to avoid CORS issues
- Optimized scraping with minimal requests
- Efficient pagination handling
- Client-side sorting and filtering for resp
