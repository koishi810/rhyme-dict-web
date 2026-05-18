'use client';

import { useState, useMemo } from 'react';
import type { Song } from '@/lib/types';
import SongCard from '@/components/SongCard';

interface Props {
  songs: Song[];
  clusters: string[];
  genres: string[];
}

const selectClass = `text-sm px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/50`;

export default function SongListClient({ songs, clusters, genres }: Props) {
  const [query, setQuery] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState<'year' | 'strength' | 'title'>('year');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return songs
      .filter(s => {
        if (selectedCluster && s.clusterName !== selectedCluster) return false;
        if (selectedGenre && s.genre !== selectedGenre) return false;
        if (q) {
          return (
            s.title.toLowerCase().includes(q) ||
            s.artist.toLowerCase().includes(q) ||
            s.vowelSkeleton.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'year') return b.year - a.year;
        if (sortBy === 'strength') return b.strength - a.strength;
        return a.title.localeCompare(b.title);
      });
  }, [songs, query, selectedCluster, selectedGenre, sortBy]);

  const inputStyle = {
    background: 'var(--bg-raised)',
    borderColor: 'var(--bd)',
    color: 'var(--tx-1)',
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border p-4 space-y-3" style={{ background: 'var(--bg-surface)', borderColor: 'var(--bd-subtle)' }}>
        <input
          type="search"
          placeholder="曲名・アーティスト名で検索…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          style={inputStyle}
        />
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedCluster}
            onChange={e => setSelectedCluster(e.target.value)}
            className={selectClass}
            style={inputStyle}
          >
            <option value="">すべての章</option>
            {clusters.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={selectedGenre}
            onChange={e => setSelectedGenre(e.target.value)}
            className={selectClass}
            style={inputStyle}
          >
            <option value="">すべてのジャンル</option>
            {genres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'year' | 'strength' | 'title')}
            className={selectClass}
            style={inputStyle}
          >
            <option value="year">新しい順</option>
            <option value="strength">韻の強度順</option>
            <option value="title">タイトル順</option>
          </select>
          {(query || selectedCluster || selectedGenre) && (
            <button
              onClick={() => { setQuery(''); setSelectedCluster(''); setSelectedGenre(''); }}
              className="text-sm px-2.5 py-1.5 rounded-lg transition-colors hover:bg-[#1e1e2e]"
              style={{ color: 'var(--tx-2)' }}
            >
              クリア ×
            </button>
          )}
        </div>
      </div>

      <div className="text-sm" style={{ color: 'var(--tx-3)' }}>{filtered.length}曲</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(song => (
          <SongCard key={song.slug} song={song} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16" style={{ color: 'var(--tx-3)' }}>該当する曲が見つかりません</div>
      )}
    </div>
  );
}
