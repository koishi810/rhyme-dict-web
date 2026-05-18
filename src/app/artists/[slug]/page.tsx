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

  const songs = getSongsByArtist(artist.name)
    .sort((a, b) => a.year - b.year);

  // cluster distribution
  const clusterCounts: Record<string, number> = {};
  songs.forEach(s => {
    if (s.clusterName) clusterCounts[s.clusterName] = (clusterCounts[s.clusterName] ?? 0) + 1;
  });
  const sortedClusters = Object.entries(clusterCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 flex items-center gap-2">
        <Link href="/artists" className="hover:text-gray-700">アーティスト</Link>
        <span>/</span>
        <span className="text-gray-700">{artist.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h1 className="text-2xl font-bold">{artist.name}</h1>
        <div className="text-sm text-gray-500">{songs.length}曲収録</div>

        {sortedClusters.length > 0 && (
          <div>
            <div className="text-xs text-gray-400 mb-2">韻スタイル傾向</div>
            <div className="flex flex-wrap gap-2">
              {sortedClusters.map(([cluster, count]) => (
                <Link key={cluster} href={`/chapters/${encodeURIComponent(cluster)}`}>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-colors cursor-pointer">
                    {cluster}
                    <span className="text-indigo-400">{count}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {artist.styleAnalysis && (
          <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4">
            {artist.styleAnalysis.split('\n').filter(Boolean).slice(0, 6).map((line, i) => (
              <p key={i} className="mb-1">{line}</p>
            ))}
          </div>
        )}
      </div>

      {/* Songs */}
      <div>
        <h2 className="font-bold text-lg mb-4">収録曲</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {songs.map(song => (
            <SongCard key={song.slug} song={song} showArtist={false} />
          ))}
        </div>
      </div>
    </div>
  );
}
