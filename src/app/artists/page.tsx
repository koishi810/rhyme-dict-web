import Link from 'next/link';
import { getAllArtists } from '@/lib/parseArtist';

export default function ArtistsPage() {
  const artists = getAllArtists();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--tx-1)' }}>アーティスト一覧</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {artists.map(artist => (
          <Link
            key={artist.slug}
            href={`/artists/${artist.slug}`}
            className="block rounded-xl border p-4 transition-all hover:border-[#36365a]"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--bd-subtle)' }}
          >
            <div className="font-semibold text-sm truncate" style={{ color: 'var(--tx-1)' }}>{artist.name}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--tx-3)' }}>{artist.songCount}曲</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
