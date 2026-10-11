import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CWW Behavioral Load Manager | IT2 Fuzzy Logic',
  description:
    'Computing with Words (CWW) Behavioral Health & Task Scheduler using Interval Type-2 Fuzzy Inference and Karnik-Mendel Type-Reduction.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-teal-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
