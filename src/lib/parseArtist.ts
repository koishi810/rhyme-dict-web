import fs from 'fs';
import path from 'path';
import type { Artist, ArtistSongEntry } from './types';

const ARTISTS_DIR = path.join(process.cwd(), 'data/アーティスト');

function slugifyArtist(name: string): string {
  return name;
}

export function decodeArtistSlug(slug: string): string {
  return slug;
}

function parseSongTable(content: string): ArtistSongEntry[] {
  const entries: ArtistSongEntry[] = [];
  // Match table rows like: | [[曲/X - Y|X - Y]] | artist | year | genre | cluster | existence |
  const rowRegex = /\|\s*\[\[曲\/[^\]]+\|([^\]]+)\]\]\s*\|\s*[^|]+\|\s*(\d{4})\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g;
  let m;
  while ((m = rowRegex.exec(content)) !== null) {
    const fullTitle = m[1].trim(); // "Creepy Nuts - サントラ"
    const titleParts = fullTitle.split(' - ');
    const title = titleParts.slice(1).join(' - ').trim() || fullTitle;

    entries.push({
      title,
      year: parseInt(m[2]),
      genre: m[3].trim(),
      clusterName: m[4].trim(),
      existenceStatus: m[5].trim(),
    });
  }
  return entries;
}

function parseStyleAnalysis(content: string): string {
  const match = content.match(/##\s+🎤\s+韻スタイル分析([\s\S]*?)(?=\n##|\Z|$)/);
  if (!match) return '';
  // strip dataview blocks
  return match[1].replace(/```[\s\S]*?```/g, '').trim();
}

export function parseArtistFile(filename: string): Artist | null {
  const filePath = path.join(ARTISTS_DIR, filename);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const name = filename.replace(/\.md$/, '');

    const countMatch = content.match(/件数[:：]\s*`(\d+)`/);
    const songCount = countMatch ? parseInt(countMatch[1]) : 0;

    const songs = parseSongTable(content);
    const styleAnalysis = parseStyleAnalysis(content);

    return {
      slug: slugifyArtist(name),
      name,
      songCount,
      songs,
      styleAnalysis,
    };
  } catch {
    return null;
  }
}

export function getAllArtists(): Artist[] {
  if (!fs.existsSync(ARTISTS_DIR)) return [];
  const files = fs.readdirSync(ARTISTS_DIR).filter(f => f.endsWith('.md'));
  return files
    .map(f => parseArtistFile(f))
    .filter((a): a is Artist => a !== null && a.name !== '')
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getArtistBySlug(slug: string): Artist | null {
  const name = decodeArtistSlug(slug);
  return parseArtistFile(name + '.md');
}
