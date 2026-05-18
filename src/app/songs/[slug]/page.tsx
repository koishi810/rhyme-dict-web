import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSongBySlug, getAllSongs } from '@/lib/parseSong';
import { getColorForGroup } from '@/lib/rhymeColors';
import LyricHighlighter from '@/components/LyricHighlighter';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const songs = getAllSongs();
  return songs.map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const song = getSongBySlug(decodeURIComponent(slug));
  if (!song) return {};
  return { title: `${song.artist} — ${song.title} | 韻辞典` };
}

export default async function SongPage({ params }: Props) {
  const { slug } = await params;
  const song = getSongBySlug(decodeURIComponent(slug));
  if (!song) notFound();

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 flex items-center gap-2">
        <Link href="/songs" className="hover:text-gray-700">曲一覧</Link>
        <span>/</span>
        <Link href={`/artists/${encodeURIComponent(song.artist)}`} className="hover:text-gray-700">{song.artist}</Link>
        <span>/</span>
        <span className="text-gray-700">{song.title}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div>
          <Link href={`/artists/${encodeURIComponent(song.artist)}`} className="text-sm text-indigo-600 hover:underline">
            {song.artist}
          </Link>
          <h1 className="text-2xl font-bold mt-1">{song.title}</h1>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600">{song.year}</span>
          {song.genre && <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600">{song.genre}</span>}
          {song.clusterName && (
            <Link href={`/chapters/${encodeURIComponent(song.clusterName)}`}>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-colors cursor-pointer">
                {song.clusterName}
              </span>
            </Link>
          )}
          {song.mainType && <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 font-mono text-xs">{song.mainType}</span>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <div className="text-xs text-gray-400 mb-0.5">母音骨格</div>
            <div className="font-mono text-gray-700 text-xs">{song.vowelSkeleton || '—'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-0.5">韻の強度</div>
            <div className="flex gap-0.5 mt-1">
              {[1,2,3,4,5].map(n => (
                <span key={n} className={`w-2.5 h-2.5 rounded-full ${n <= song.strength ? 'bg-indigo-400' : 'bg-gray-200'}`} />
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-0.5">韻グループ数</div>
            <div className="text-gray-700">{song.rhymeGroups.length}グループ</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-0.5">信頼度</div>
            <div className="text-gray-700">{song.confidence || '—'}</div>
          </div>
        </div>

        {song.spotifyUrl && (
          <a href={song.spotifyUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700">
            <span>🎵</span> Spotifyで聴く
          </a>
        )}
      </div>

      {/* Main content: lyrics + analysis side by side on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lyrics with highlighting */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">歌詞 · 韻ハイライト</h2>
          {song.lyrics ? (
            <LyricHighlighter lyrics={song.lyrics} rhymeGroups={song.rhymeGroups} />
          ) : (
            <p className="text-sm text-gray-400">歌詞データなし</p>
          )}
        </div>

        {/* Rhyme group analysis */}
        <div className="space-y-4">
          <h2 className="font-bold text-gray-900">韻グループ分析</h2>
          {song.rhymeGroups.length === 0 && (
            <p className="text-sm text-gray-400">分析データなし</p>
          )}
          {song.rhymeGroups.map((group, idx) => {
            const color = getColorForGroup(idx);
            return (
              <div key={idx} className={`rounded-xl border ${color.border} ${color.bg} p-4 space-y-3`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`text-xs font-semibold ${color.text}`}>グループ {group.index}</span>
                    <div className="font-bold text-gray-900 mt-0.5">{group.label}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-gray-500">{group.lineCount}行</div>
                    <div className="text-xs text-indigo-600 mt-0.5">{group.chapter}</div>
                  </div>
                </div>

                {/* Lines */}
                {group.lines.length > 0 && (
                  <div className="space-y-1.5">
                    {group.lines.map((line, li) => (
                      <div key={li} className="bg-white/60 rounded-lg px-3 py-2">
                        <div className="text-sm text-gray-800 leading-snug">{line.text}</div>
                        <div className="font-mono text-xs text-gray-400 mt-0.5">{line.vowelPattern}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Techniques */}
                {group.techniques.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {group.techniques.map((t, ti) => (
                      <span key={ti} className="text-xs px-2 py-0.5 rounded-full bg-white/70 border border-current opacity-70">
                        {t.split(' — ')[0]}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
