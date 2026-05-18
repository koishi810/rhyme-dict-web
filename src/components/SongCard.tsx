import Link from 'next/link';
import type { Song } from '@/lib/types';

interface Props {
  song: Song;
  showArtist?: boolean;
}

const STRENGTH_DOTS = [1, 2, 3, 4, 5];

export default function SongCard({ song, showArtist = true }: Props) {
  return (
    <Link
      href={`/songs/${encodeURIComponent(song.slug)}`}
      className="block rounded-xl border border-gray-100 bg-white p-4 hover:shadow-md hover:border-gray-200 transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {showArtist && (
            <div className="text-xs text-gray-500 mb-0.5 truncate">{song.artist}</div>
          )}
          <div className="font-semibold text-gray-900 text-sm truncate group-hover:text-indigo-700 transition-colors">
            {song.title}
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs text-gray-400">{song.year}</span>
            {song.genre && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{song.genre}</span>
            )}
            {song.clusterName && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                {song.clusterName}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-0.5 shrink-0 mt-1">
          {STRENGTH_DOTS.map(n => (
            <span
              key={n}
              className={`w-1.5 h-1.5 rounded-full ${n <= song.strength ? 'bg-indigo-400' : 'bg-gray-200'}`}
            />
          ))}
        </div>
      </div>
      {song.vowelSkeleton && (
        <div className="mt-2 font-mono text-xs text-gray-400 truncate">{song.vowelSkeleton}</div>
      )}
    </Link>
  );
}
