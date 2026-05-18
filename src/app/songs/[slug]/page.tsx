import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSongBySlug, getAllSongs } from '@/lib/parseSong';
import { getColorForGroup } from '@/lib/rhymeColors';
import LyricHighlighter from '@/components/LyricHighlighter';
import { VowelBar, VowelLegend, ColorizedText, computeMatchPositions, maxPatternLength } from '@/components/VowelBar';

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
      <nav className="text-sm flex items-center gap-2" style={{ color: 'var(--tx-3)' }}>
        <Link href="/songs" className="hover:text-indigo-400 transition-colors">曲一覧</Link>
        <span>/</span>
        <Link href={`/artists/${encodeURIComponent(song.artist)}`} className="hover:text-indigo-400 transition-colors">{song.artist}</Link>
        <span>/</span>
        <span style={{ color: 'var(--tx-1)' }}>{song.title}</span>
      </nav>

      {/* Header */}
      <div className="rounded-2xl border p-6 space-y-4" style={{ background: 'var(--bg-surface)', borderColor: 'var(--bd-subtle)' }}>
        <div>
          <Link href={`/artists/${encodeURIComponent(song.artist)}`} className="text-sm text-indigo-400 hover:underline">
            {song.artist}
          </Link>
          <h1 className="text-2xl font-bold mt-1" style={{ color: 'var(--tx-1)' }}>{song.title}</h1>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <span className="px-2.5 py-1 rounded-lg text-xs" style={{ background: 'var(--bg-raised)', color: 'var(--tx-2)' }}>{song.year}</span>
          {song.genre && <span className="px-2.5 py-1 rounded-lg text-xs" style={{ background: 'var(--bg-raised)', color: 'var(--tx-2)' }}>{song.genre}</span>}
          {song.clusterName && (
            <Link href={`/chapters/${encodeURIComponent(song.clusterName)}`}>
              <span className="px-2.5 py-1 rounded-lg text-xs border border-indigo-800/60 bg-indigo-950/40 text-indigo-400 hover:bg-indigo-950/70 transition-colors cursor-pointer">
                {song.clusterName}
              </span>
            </Link>
          )}
          {song.mainType && <span className="px-2.5 py-1 rounded-lg font-mono text-xs" style={{ background: 'var(--bg-raised)', color: 'var(--tx-3)' }}>{song.mainType}</span>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--tx-3)' }}>母音骨格</div>
            {song.vowelSkeleton
              ? <VowelBar pattern={song.vowelSkeleton} />
              : <span className="text-xs" style={{ color: 'var(--tx-3)' }}>—</span>
            }
          </div>
          <div>
            <div className="text-xs mb-0.5" style={{ color: 'var(--tx-3)' }}>韻の強度</div>
            <div className="flex gap-0.5 mt-1">
              {[1,2,3,4,5].map(n => (
                <span key={n} className={`w-2.5 h-2.5 rounded-full ${n <= song.strength ? 'bg-indigo-400' : 'bg-[#28283c]'}`} />
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs mb-0.5" style={{ color: 'var(--tx-3)' }}>韻グループ数</div>
            <div style={{ color: 'var(--tx-1)' }}>{song.rhymeGroups.length}グループ</div>
          </div>
          <div>
            <div className="text-xs mb-0.5" style={{ color: 'var(--tx-3)' }}>信頼度</div>
            <div style={{ color: 'var(--tx-1)' }}>{song.confidence || '—'}</div>
          </div>
        </div>

        {song.spotifyUrl && (
          <a href={song.spotifyUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300">
            <span>🎵</span> Spotifyで聴く
          </a>
        )}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lyrics */}
        <div className="rounded-2xl border p-6 space-y-4" style={{ background: 'var(--bg-surface)', borderColor: 'var(--bd-subtle)' }}>
          <h2 className="font-bold" style={{ color: 'var(--tx-1)' }}>歌詞 · 韻ハイライト</h2>
          {song.lyrics ? (
            <LyricHighlighter lyrics={song.lyrics} rhymeGroups={song.rhymeGroups} />
          ) : (
            <p className="text-sm" style={{ color: 'var(--tx-3)' }}>歌詞データなし</p>
          )}
        </div>

        {/* Rhyme group analysis */}
        <div className="space-y-4">
          <h2 className="font-bold" style={{ color: 'var(--tx-1)' }}>韻グループ分析</h2>
          {song.rhymeGroups.length > 0 && <VowelLegend />}
          {song.rhymeGroups.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--tx-3)' }}>分析データなし</p>
          )}
          {song.rhymeGroups.map((group, idx) => {
            const color = getColorForGroup(idx);
            const patterns = group.lines.map(l => l.vowelPattern).filter(Boolean);
            const maxLen = maxPatternLength(patterns);
            const matchPositions = computeMatchPositions(patterns);
            return (
              <div key={idx} className={`rounded-xl border ${color.border} ${color.bg} p-4 space-y-3`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`text-xs font-semibold ${color.text}`}>グループ {group.index}</span>
                    <div className={`font-bold mt-0.5 ${color.text}`}>{group.label}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs" style={{ color: 'var(--tx-3)' }}>{group.lineCount}行</div>
                    <div className="text-xs text-indigo-400 mt-0.5">{group.chapter}</div>
                  </div>
                </div>

                {group.lines.length > 0 && (
                  <div className="space-y-1.5">
                    {group.lines.map((line, li) => (
                      <div key={li} className="rounded-lg px-3 py-2 space-y-1.5" style={{ background: 'rgba(0,0,0,0.25)' }}>
                        <div className="text-sm leading-snug">
                          {line.vowelPattern ? (
                            <ColorizedText
                              text={line.text}
                              vowelPattern={line.vowelPattern}
                              matchPositions={patterns.length >= 2 ? matchPositions : undefined}
                              maxLength={maxLen}
                            />
                          ) : (
                            <span style={{ color: 'var(--tx-1)' }}>{line.text}</span>
                          )}
                        </div>
                        {line.vowelPattern && (
                          <VowelBar
                            pattern={line.vowelPattern}
                            matchPositions={patterns.length >= 2 ? matchPositions : undefined}
                            maxLength={maxLen}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {group.techniques.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {group.techniques.map((t, ti) => (
                      <span key={ti} className={`text-xs px-2 py-0.5 rounded-full border border-current opacity-60 ${color.text}`} style={{ background: 'rgba(0,0,0,0.2)' }}>
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
