import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Webphiser Admin | AIM Edutech',
  description: 'Webphiser Education Management & CBT Online Exam Administration Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#040e22] text-slate-100 selection:bg-[#e0a028] selection:text-[#061432]">
        {children}
      </body>
    </html>
  );
}
