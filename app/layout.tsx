import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Auction Analysis Tool',
  description: 'Analyze auction lots with eBay comparable pricing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
