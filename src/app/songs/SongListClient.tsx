'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Song } from '@/lib/types';
import SongCard from '@/components/SongCard';

interface Props {
  songs: Song[];
  clusters: string[];
  genres: string[];
}

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

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
        <input
          type="search"
          placeholder="曲名・アーティスト名で検索…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedCluster}
            onChange={e => setSelectedCluster(e.target.value)}
            className="text-sm px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">すべての章</option>
            {clusters.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={selectedGenre}
            onChange={e => setSelectedGenre(e.target.value)}
            className="text-sm px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">すべてのジャンル</option>
            {genres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'year' | 'strength' | 'title')}
            className="text-sm px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="year">新しい順</option>
            <option value="strength">韻の強度順</option>
            <option value="title">タイトル順</option>
          </select>
          {(query || selectedCluster || selectedGenre) && (
            <button
              onClick={() => { setQuery(''); setSelectedCluster(''); setSelectedGenre(''); }}
              className="text-sm px-2.5 py-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              クリア ×
            </button>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-500">{filtered.length}曲</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(song => (
          <SongCard key={song.slug} song={song} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-gray-400 py-16">該当する曲が見つかりません</div>
      )}
    </div>
  );
}
