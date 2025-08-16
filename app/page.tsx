'use client';

import { useState } from 'react';
import { AnalysisRow } from '../types';
import { generateCSV } from '../lib/csv';

export default function Home() {
  const [url, setUrl] = useState('');
  const [stripLotPrefix, setStripLotPrefix] = useState(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisRow[]>([]);
  const [showOnlyUndervalued, setShowOnlyUndervalued] = useState(false);
  const [sortField, setSortField] = useState<keyof AnalysisRow>('lotNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('Please enter an auction URL');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auctionUrl: url.trim(),
          recentCount: 5,
          stripLotPrefix
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }
      
      const data = await response.json();
      setResults(data.rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSort = (field: keyof AnalysisRow) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const filteredAndSortedResults = results
    .filter(row => !showOnlyUndervalued || row.undervalued)
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  
  const handleExportCSV = () => {
    const csv = generateCSV(filteredAndSortedResults);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'auction-analysis.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <header>
        <h1>Auction Analysis Tool</h1>
        <div className="input-section">
          <div className="url-input">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter auction URL (equip-bid.com, hibid.com, midwest.auction, ebth.com, invaluable.com)"
              disabled={loading}
            />
          </div>
          <div className="checkbox-section">
            <label>
              <input
                type="checkbox"
                checked={stripLotPrefix}
                onChange={(e) => setStripLotPrefix(e.target.checked)}
                disabled={loading}
              />
              Remove "Lot X" from title before eBay search
            </label>
          </div>
          <button 
            onClick={handleAnalyze}
            disabled={loading || !url.trim()}
            className="analyze-btn"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
        {error && <div className="error">{error}</div>}
      </header>
      
      {results.length > 0 && (
        <div className="results-section">
          <div className="results-controls">
            <label>
              <input
                type="checkbox"
                checked={showOnlyUndervalued}
                onChange={(e) => setShowOnlyUndervalued(e.target.checked)}
              />
              Show only Undervalued
            </label>
            <button onClick={handleExportCSV} className="export-btn">
              Export CSV
            </button>
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('lotNumber')}>
                    Lot # {sortField === 'lotNumber' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('itemTitle')}>
                    Item Title {sortField === 'itemTitle' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('ebayValue')}>
                    eBay Value {sortField === 'ebayValue' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('myMaxBid')}>
                    My Max Bid {sortField === 'myMaxBid' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('currentBid')}>
                    Current Bid {sortField === 'currentBid' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedResults.map((row, index) => (
                  <tr key={index} className={row.undervalued ? 'undervalued' : ''}>
                    <td>{row.lotNumber}</td>
                    <td>{row.itemTitle}</td>
                    <td>
                      {row.ebayValue ? (
                        <a href={row.ebayValueLink} target="_blank" rel="noopener noreferrer">
                          ${row.ebayValue.toLocaleString()}
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td>
                      {row.myMaxBid ? (
                        <a href={row.myMaxBidLink} target="_blank" rel="noopener noreferrer">
                          ${row.myMaxBid.toLocaleString()}
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td>${row.currentBid.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="summary">
            Total lots: {results.length} | 
            Undervalued: {results.filter(r => r.undervalued).length} | 
            Showing: {filteredAndSortedResults.length}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        header {
          margin-bottom: 30px;
        }
        
        h1 {
          color: #333;
          margin-bottom: 20px;
        }
        
        .input-section {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .url-input input {
          width: 100%;
          padding: 12px;
          border: 2px solid #ddd;
          border-radius: 6px;
          font-size: 16px;
        }
        
        .url-input input:focus {
          outline: none;
          border-color: #007bff;
        }
        
        .checkbox-section label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
        
        .analyze-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .analyze-btn:hover:not(:disabled) {
          background: #0056b3;
        }
        
        .analyze-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .error {
          background: #f8d7da;
          color: #721c24;
          padding: 12px;
          border-radius: 6px;
          margin-top: 15px;
        }
        
        .results-section {
          margin-top: 30px;
        }
        
        .results-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 6px;
        }
        
        .export-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .export-btn:hover {
          background: #218838;
        }
        
        .table-container {
          overflow-x: auto;
          border: 1px solid #ddd;
          border-radius: 6px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }
        
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        
        th {
          background: #f8f9fa;
          font-weight: 600;
          cursor: pointer;
          user-select: none;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        th:hover {
          background: #e9ecef;
        }
        
        tr.undervalued {
          background-color: #d4edda;
        }
        
        tr.undervalued::before {
          content: "🎯";
          position: absolute;
          left: 8px;
        }
        
        td a {
          color: #007bff;
          text-decoration: none;
        }
        
        td a:hover {
          text-decoration: underline;
        }
        
        .summary {
          margin-top: 15px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 4px;
          font-size: 14px;
          color: #666;
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 10px;
          }
          
          .results-controls {
            flex-direction: column;
            gap: 10px;
            align-items: stretch;
          }
          
          th, td {
            padding: 8px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
