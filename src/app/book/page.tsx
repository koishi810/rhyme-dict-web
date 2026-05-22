import Link from 'next/link';
import { getAllBookChapters } from '@/lib/parseBook';
import './book.css';

export const metadata = {
  title: '書籍版 | 韻辞典',
  description: '縦書きの紙の辞典のように韻辞典を読むビュー',
};

export default function BookIndexPage() {
  const chapters = getAllBookChapters();

  return (
    <div className="book-mode">
      <div className="book-mode-header">
        <h1>韻辞典 — 書籍版</h1>
        <Link href="/">← 通常版に戻る</Link>
      </div>

      <div
        style={{
          maxWidth: 980,
          margin: '0 auto 1.25rem',
          color: '#bcbcc4',
          fontSize: '0.875rem',
          lineHeight: 1.7,
          fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif",
        }}
      >
        紙の辞典のように、章を縦書きで読むためのビューです。各章をクリックすると、解説・例・末尾母音/子音表が
        縦組みで開きます。
      </div>

      <div className="book-index">
        {chapters.map(c => (
          <Link key={c.id} href={`/book/${encodeURIComponent(c.id)}`} className="book-card">
            <span className="book-card-band" />
            <span className="book-card-number">第 {c.number} 章</span>
            <h2 className="book-card-title">{c.title}</h2>
            <span className="book-card-axis">{c.axis}</span>
            <p className="book-card-subtitle">{c.subtitle || c.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
