import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const noto = Noto_Sans_JP({ subsets: ['latin'], weight: ['400', '500', '700'] });

export const metadata: Metadata = {
  title: '韻辞典',
  description: '日本語ラップ・歌詞の韻パターンを音韻論的に分類したコーパス辞典',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${noto.className} bg-gray-50 text-gray-900 min-h-screen`}>
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg tracking-tight hover:text-indigo-700 transition-colors">
              韻辞典
            </Link>
            <nav className="flex items-center gap-5 text-sm text-gray-600">
              <Link href="/chapters" className="hover:text-gray-900 transition-colors">分類</Link>
              <Link href="/songs" className="hover:text-gray-900 transition-colors">曲一覧</Link>
              <Link href="/artists" className="hover:text-gray-900 transition-colors">アーティスト</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-gray-200 mt-16">
          <div className="max-w-5xl mx-auto px-4 py-6 text-xs text-gray-400 text-center">
            韻辞典 — 河原繁人氏の音韻論に基づく日本語ラップ韻コーパス
          </div>
        </footer>
      </body>
    </html>
  );
}
