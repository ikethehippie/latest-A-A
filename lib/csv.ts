export function generateCSV(rows: any[]): string {
  const headers = [
    'Lot #',
    'Item Title', 
    'eBay Value',
    'My Max Bid',
    'Current Bid',
    'eBay Value Link',
    'My Max Bid Link'
  ];
  
  const csvRows = [
    headers.join(','),
    ...rows.map(row => [
      `"${row.lotNumber}"`,
      `"${row.itemTitle.replace(/"/g, '""')}"`,
      row.ebayValue || '',
      row.myMaxBid || '',
      row.currentBid || '',
      `"${row.ebayValueLink}"`,
      `"${row.myMaxBidLink}"`
    ].join(','))
  ];
  
  return csvRows.join('\n');
}
