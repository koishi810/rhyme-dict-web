import { getAllChapters } from '@/lib/parseChapter';
import { getAllSongs } from '@/lib/parseSong';
import ChapterMatrix from '@/components/ChapterMatrix';

export default function ChaptersPage() {
  const chapters = getAllChapters();
  const allSongs = getAllSongs();

  const songCounts: Record<string, number> = {};
  allSongs.forEach(s => {
    if (s.clusterName) songCounts[s.clusterName] = (songCounts[s.clusterName] ?? 0) + 1;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">9章マトリックス</h1>
        <p className="text-gray-500 text-sm mt-1">
          子音3軸 × 母音3軸 × 構造3軸で日本語の韻技法を分類する。
        </p>
      </div>

      {/* Theory note */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 text-sm text-indigo-900 leading-relaxed">
        <p className="font-semibold mb-1">河原理論の核心</p>
        <p>「子音が違っても、調音位置が近ければ響きは似て聞こえる」— 河原繁人（慶應義塾大学）</p>
        <p className="mt-1 text-indigo-700">
          通常の「母音が一致する韻」に加え、<strong>子音側の精度</strong>にも光を当てるのがこの辞典の特徴。
          子音は①位置・②方法・③清濁の3素性に分解して分析する。
        </p>
      </div>

      <ChapterMatrix chapters={chapters} songCounts={songCounts} />
    </div>
  );
}
