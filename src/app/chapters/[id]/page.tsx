import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getChapterById, getAllChapters } from '@/lib/parseChapter';
import { getSongsByCluster } from '@/lib/parseSong';
import { AXIS_COLORS } from '@/lib/rhymeColors';
import SongCard from '@/components/SongCard';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const chapters = getAllChapters();
  return chapters.map(c => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `${id} | 韻辞典` };
}

export default async function ChapterPage({ params }: Props) {
  const { id } = await params;
  const chapterId = id;
  const chapter = getChapterById(chapterId);
  if (!chapter) notFound();

  const songs = getSongsByCluster(chapterId);
  const axisColor = AXIS_COLORS[chapter.axisColor];

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 flex items-center gap-2">
        <Link href="/chapters" className="hover:text-gray-700">分類</Link>
        <span>/</span>
        <span className="text-gray-700">{chapter.id}</span>
      </nav>

      {/* Chapter header */}
      <div className={`rounded-2xl border ${axisColor.border} ${axisColor.bg} p-6 space-y-3`}>
        <div className="flex items-start gap-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${axisColor.badge}`}>
            {chapter.axis}
          </span>
        </div>
        <h1 className="text-2xl font-bold">{chapter.id}</h1>
        <p className="text-gray-600 text-sm">{chapter.oneLiner}</p>
        <p className="text-sm text-gray-500 leading-relaxed">{chapter.description}</p>
      </div>

      {/* Songs in this chapter */}
      <div>
        <h2 className="font-bold text-lg mb-4">収録曲 <span className="text-gray-400 font-normal text-base">({songs.length}曲)</span></h2>
        {songs.length === 0 ? (
          <p className="text-sm text-gray-400">この章の曲はまだ登録されていません</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {songs
              .sort((a, b) => b.strength - a.strength || b.year - a.year)
              .map(song => (
                <SongCard key={song.slug} song={song} />
              ))}
          </div>
        )}
      </div>

      {/* Representative songs from chapter file */}
      {chapter.representativeSongs.length > 0 && (
        <div>
          <h2 className="font-bold text-lg mb-4">厳選代表員</h2>
          <div className="space-y-4">
            {chapter.representativeSongs.map((rep, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-gray-900">{rep.artist}</span>
                    {rep.title && <span className="text-gray-500 ml-2">「{rep.title}」</span>}
                  </div>
                  {rep.vowelSkeleton && (
                    <span className="font-mono text-xs text-gray-400 shrink-0">{rep.vowelSkeleton}</span>
                  )}
                </div>
                {rep.excerpt && (
                  <blockquote className="border-l-2 border-gray-200 pl-3 text-sm text-gray-600 italic">
                    {rep.excerpt}
                  </blockquote>
                )}
                {rep.comment && (
                  <p className="text-sm text-gray-500">{rep.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
