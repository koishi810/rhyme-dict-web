import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArtistBySlug, getAllArtists } from '@/lib/parseArtist';
import { getSongsByArtist } from '@/lib/parseSong';
import SongCard from '@/components/SongCard';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const artists = getAllArtists();
  return artists.map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const artist = getArtistBySlug(decodeURIComponent(slug));
  return { title: artist ? `${artist.name} | 韻辞典` : '韻辞典' };
}

export default async function ArtistPage({ params }: Props) {
  const { slug } = await params;
  const artist = getArtistBySlug(decodeURIComponent(slug));
  if (!artist) notFound();

  const songs = getSongsByArtist(artist.name).sort((a, b) => a.year - b.year);

  const clusterCounts: Record<string, number> = {};
  songs.forEach(s => {
    if (s.clusterName) clusterCounts[s.clusterName] = (clusterCounts[s.clusterName] ?? 0) + 1;
  });
  const sortedClusters = Object.entries(clusterCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-8">
      <nav className="text-sm flex items-center gap-2" style={{ color: 'var(--tx-3)' }}>
        <Link href="/artists" className="hover:text-indigo-400 transition-colors">アーティスト</Link>
        <span>/</span>
        <span style={{ color: 'var(--tx-1)' }}>{artist.name}</span>
      </nav>

      <div className="rounded-2xl border p-6 space-y-4" style={{ background: 'var(--bg-surface)', borderColor: 'var(--bd-subtle)' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--tx-1)' }}>{artist.name}</h1>
        <div className="text-sm" style={{ color: 'var(--tx-2)' }}>{songs.length}曲収録</div>

        {sortedClusters.length > 0 && (
          <div>
            <div className="text-xs mb-2" style={{ color: 'var(--tx-3)' }}>韻スタイル傾向</div>
            <div className="flex flex-wrap gap-2">
              {sortedClusters.map(([cluster, count]) => (
                <Link key={cluster} href={`/chapters/${encodeURIComponent(cluster)}`}>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border border-indigo-800/60 bg-indigo-950/40 text-indigo-400 hover:bg-indigo-950/70 transition-colors cursor-pointer">
                    {cluster}
                    <span className="text-indigo-500">{count}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {artist.styleAnalysis && (
          <div className="text-sm leading-relaxed rounded-xl p-4" style={{ background: 'var(--bg-raised)', color: 'var(--tx-2)' }}>
            {artist.styleAnalysis.split('\n').filter(Boolean).slice(0, 6).map((line, i) => (
              <p key={i} className="mb-1">{line}</p>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--tx-1)' }}>収録曲</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {songs.map(song => (
            <SongCard key={song.slug} song={song} showArtist={false} />
          ))}
        </div>
      </div>
    </div>
  );
}
