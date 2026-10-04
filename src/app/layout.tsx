import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ArthaFlow - Sistem Manajemen Keuangan & Tabungan Multi-Scope',
  description: 'Aplikasi manajemen keuangan personal, rumah tangga, dan organisasi dengan sistem RBAC, ekspor PDF/Excel, dan sinkronisasi real-time.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="bg-[#0a0b10] text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
