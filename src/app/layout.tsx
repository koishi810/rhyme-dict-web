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
      <body className={`${noto.className} min-h-screen`} style={{ background: 'var(--bg-base)', color: 'var(--tx-1)' }}>
        <header className="sticky top-0 z-40 border-b backdrop-blur-sm" style={{ borderColor: 'var(--bd)', background: 'color-mix(in srgb, var(--bg-surface) 85%, transparent)' }}>
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg tracking-tight hover:text-indigo-400 transition-colors" style={{ color: 'var(--tx-1)' }}>
              韻辞典
            </Link>
            <nav className="flex items-center gap-5 text-sm" style={{ color: 'var(--tx-2)' }}>
              <Link href="/chapters" className="hover:text-indigo-400 transition-colors">分類</Link>
              <Link href="/songs" className="hover:text-indigo-400 transition-colors">曲一覧</Link>
              <Link href="/artists" className="hover:text-indigo-400 transition-colors">アーティスト</Link>
              <Link href="/book" className="hover:text-amber-300 transition-colors" style={{ color: '#d8b14a' }}>書籍版</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t mt-16" style={{ borderColor: 'var(--bd)' }}>
          <div className="max-w-5xl mx-auto px-4 py-6 text-xs text-center" style={{ color: 'var(--tx-3)' }}>
            韻辞典 — 河原繁人氏の音韻論に基づく日本語ラップ韻コーパス
          </div>
        </footer>
      </body>
    </html>
  );
}
