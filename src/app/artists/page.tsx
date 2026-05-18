import Link from 'next/link';
import { getAllArtists } from '@/lib/parseArtist';

export default function ArtistsPage() {
  const artists = getAllArtists();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">アーティスト一覧</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {artists.map(artist => (
          <Link
            key={artist.slug}
            href={`/artists/${artist.slug}`}
            className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all"
          >
            <div className="font-semibold text-gray-900 text-sm truncate">{artist.name}</div>
            <div className="text-xs text-gray-400 mt-1">{artist.songCount}曲</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
