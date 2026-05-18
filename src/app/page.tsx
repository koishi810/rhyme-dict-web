import Link from 'next/link';
import { getAllChapters } from '@/lib/parseChapter';
import { getAllSongs } from '@/lib/parseSong';
import ChapterMatrix from '@/components/ChapterMatrix';
import SongCard from '@/components/SongCard';

export default function HomePage() {
  const chapters = getAllChapters();
  const allSongs = getAllSongs();

  const songCounts: Record<string, number> = {};
  allSongs.forEach(s => {
    if (s.clusterName) songCounts[s.clusterName] = (songCounts[s.clusterName] ?? 0) + 1;
  });

  const featured = allSongs
    .filter(s => s.lyrics && s.rhymeGroups.length > 0)
    .sort((a, b) => b.strength - a.strength || b.year - a.year)
    .slice(0, 6);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--tx-1)' }}>韻辞典</h1>
        <p className="max-w-xl mx-auto leading-relaxed text-sm" style={{ color: 'var(--tx-2)' }}>
          日本語ラップ・歌詞の韻パターンを
          <span className="font-semibold text-blue-400">子音3軸</span>・
          <span className="font-semibold text-emerald-400">母音3軸</span>・
          <span className="font-semibold text-amber-400">構造3軸</span>
          のマトリックスで分類したコーパス辞典。
        </p>
        <p className="text-xs" style={{ color: 'var(--tx-3)' }}>
          河原繁人氏の音韻論「子音が違っても調音位置が近ければ響きは似て聞こえる」を核心に据える。
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/songs"
            className="px-5 py-2.5 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-400 transition-colors"
          >
            曲を探す
          </Link>
          <Link
            href="/chapters"
            className="px-5 py-2.5 rounded-lg border text-sm font-medium transition-colors hover:bg-[#191927]"
            style={{ borderColor: 'var(--bd)', color: 'var(--tx-2)' }}
          >
            9章を学ぶ
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-4 text-center">
        {[
          { value: allSongs.length, label: '収録曲' },
          { value: chapters.length, label: '分類章' },
          { value: allSongs.filter(s => s.rhymeGroups.length > 0).length, label: '韻分析済み' },
        ].map(({ value, label }) => (
          <div key={label} className="rounded-xl border py-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--bd-subtle)' }}>
            <div className="text-3xl font-bold text-indigo-400">{value}</div>
            <div className="text-sm mt-1" style={{ color: 'var(--tx-2)' }}>{label}</div>
          </div>
        ))}
      </section>

      {/* Chapter matrix */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--tx-1)' }}>9章マトリックス</h2>
          <Link href="/chapters" className="text-sm text-indigo-400 hover:underline">全章を見る →</Link>
        </div>
        <ChapterMatrix chapters={chapters} songCounts={songCounts} />
      </section>

      {/* Featured songs */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--tx-1)' }}>韻分析 注目曲</h2>
            <Link href="/songs" className="text-sm text-indigo-400 hover:underline">すべて見る →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {featured.map(song => (
              <SongCard key={song.slug} song={song} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
