import { getAllSongs } from '@/lib/parseSong';
import SongListClient from './SongListClient';

export default function SongsPage() {
  const songs = getAllSongs();
  const clusters = [...new Set(songs.map(s => s.clusterName).filter(Boolean))].sort();
  const genres = [...new Set(songs.map(s => s.genre).filter(Boolean))].sort();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">曲一覧</h1>
      <SongListClient songs={songs} clusters={clusters} genres={genres} />
    </div>
  );
}
