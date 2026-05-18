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
  const chapterId = decodeURIComponent(id);
  const chapter = getChapterById(chapterId);
  if (!chapter) notFound();

  const songs = getSongsByCluster(chapterId);
  const axisColor = AXIS_COLORS[chapter.axisColor];

  return (
    <div className="space-y-8">
      <nav className="text-sm flex items-center gap-2" style={{ color: 'var(--tx-3)' }}>
        <Link href="/chapters" className="hover:text-indigo-400 transition-colors">分類</Link>
        <span>/</span>
        <span style={{ color: 'var(--tx-1)' }}>{chapter.id}</span>
      </nav>

      <div className={`rounded-2xl border ${axisColor.border} ${axisColor.bg} p-6 space-y-3`}>
        <div className="flex items-start gap-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${axisColor.badge}`}>
            {chapter.axis}
          </span>
        </div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--tx-1)' }}>{chapter.id}</h1>
        <p className="text-sm" style={{ color: 'var(--tx-2)' }}>{chapter.oneLiner}</p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--tx-2)' }}>{chapter.description}</p>
      </div>

      <div>
        <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--tx-1)' }}>
          収録曲 <span className="font-normal text-base" style={{ color: 'var(--tx-3)' }}>({songs.length}曲)</span>
        </h2>
        {songs.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--tx-3)' }}>この章の曲はまだ登録されていません</p>
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

      {chapter.representativeSongs.length > 0 && (
        <div>
          <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--tx-1)' }}>厳選代表員</h2>
          <div className="space-y-4">
            {chapter.representativeSongs.map((rep, i) => (
              <div key={i} className="rounded-xl border p-5 space-y-2" style={{ background: 'var(--bg-surface)', borderColor: 'var(--bd-subtle)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold" style={{ color: 'var(--tx-1)' }}>{rep.artist}</span>
                    {rep.title && <span className="ml-2" style={{ color: 'var(--tx-2)' }}>「{rep.title}」</span>}
                  </div>
                  {rep.vowelSkeleton && (
                    <span className="font-mono text-xs shrink-0" style={{ color: 'var(--tx-3)' }}>{rep.vowelSkeleton}</span>
                  )}
                </div>
                {rep.excerpt && (
                  <blockquote className="border-l-2 pl-3 text-sm italic" style={{ borderColor: 'var(--bd)', color: 'var(--tx-2)' }}>
                    {rep.excerpt}
                  </blockquote>
                )}
                {rep.comment && (
                  <p className="text-sm" style={{ color: 'var(--tx-2)' }}>{rep.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
