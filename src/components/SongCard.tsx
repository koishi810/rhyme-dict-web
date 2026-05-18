'use client';

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
      className="block rounded-xl border p-4 transition-all group"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--bd-subtle)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--bd)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--bd-subtle)'; }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {showArtist && (
            <div className="text-xs mb-0.5 truncate" style={{ color: 'var(--tx-3)' }}>{song.artist}</div>
          )}
          <div className="font-semibold text-sm truncate group-hover:text-indigo-400 transition-colors" style={{ color: 'var(--tx-1)' }}>
            {song.title}
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-xs" style={{ color: 'var(--tx-3)' }}>{song.year}</span>
            {song.genre && (
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-raised)', color: 'var(--tx-2)' }}>{song.genre}</span>
            )}
            {song.clusterName && (
              <span className="text-xs px-1.5 py-0.5 rounded border border-indigo-800/60 bg-indigo-950/40 text-indigo-400">
                {song.clusterName}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-0.5 shrink-0 mt-1">
          {STRENGTH_DOTS.map(n => (
            <span
              key={n}
              className={`w-1.5 h-1.5 rounded-full ${n <= song.strength ? 'bg-indigo-400' : 'bg-[#28283c]'}`}
            />
          ))}
        </div>
      </div>
      {song.vowelSkeleton && (
        <div className="mt-2 font-mono text-xs truncate" style={{ color: 'var(--tx-3)' }}>{song.vowelSkeleton}</div>
      )}
    </Link>
  );
}
