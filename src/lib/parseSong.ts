import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Song, RhymeGroup, RhymeLine } from './types';

const SONGS_DIR = path.join(process.cwd(), 'data/曲');

function slugify(filename: string): string {
  return filename.replace(/\.md$/, '');
}

function parseLyrics(body: string): string {
  const match = body.match(/```text\n([\s\S]*?)```/);
  return match ? match[1].trim() : '';
}

function parseRhymeGroups(body: string): RhymeGroup[] {
  const groups: RhymeGroup[] = [];

  // Match each "韻グループ N: label 系 (M行・chapter)" block
  const groupRegex = /###\s+韻グループ\s+(\d+)[:：]\s+(.+?)\s*\((\d+)行[・·]([^)]+)\)([\s\S]*?)(?=###\s+韻グループ|\Z|$)/g;
  let match;

  while ((match = groupRegex.exec(body)) !== null) {
    const index = parseInt(match[1]);
    const label = match[2].trim();
    const lineCount = parseInt(match[3]);
    const chapter = match[4].trim();
    const content = match[5];

    const lines = parseRhymeLines(content);
    const techniques = parseTechniques(content);
    const acousticNotes = parseAcousticNotes(content);

    groups.push({ index, label, chapter, lineCount, lines, techniques, acousticNotes });
  }

  return groups;
}

function parseRhymeLines(content: string): RhymeLine[] {
  const lines: RhymeLine[] = [];

  // Match lines inside 該当行 block
  const sectionMatch = content.match(/該当行[:：]([\s\S]*?)(?=\n音韻的工夫|\nミクロ観察|\n文脈|\n音響効果|\Z|$)/);
  if (!sectionMatch) return lines;

  const lineRegex = /(\d+)\.\s+「([^」]+)」\s*\n\s*末尾母音[:：]\s*([^\n]+)/g;
  let m;
  while ((m = lineRegex.exec(sectionMatch[1])) !== null) {
    lines.push({
      order: parseInt(m[1]),
      text: m[2].trim(),
      vowelPattern: m[3].trim(),
    });
  }

  return lines;
}

function parseTechniques(content: string): string[] {
  const techs: string[] = [];
  const section = content.match(/音韻的工夫[:：]([\s\S]*?)(?=\nミクロ観察|\n文脈|\n音響効果|\n###|\Z|$)/);
  if (!section) return techs;

  const bulletRegex = /[・•]\s*(.+)/g;
  let m;
  while ((m = bulletRegex.exec(section[1])) !== null) {
    const tech = m[1].trim();
    if (tech) techs.push(tech);
  }
  return techs;
}

function parseAcousticNotes(content: string): string {
  const section = content.match(/音響効果と既知の研究知見[:：]([\s\S]*?)(?=\n###|\Z|$)/);
  return section ? section[1].trim() : '';
}

export function parseSongFile(filename: string): Song | null {
  const filePath = path.join(SONGS_DIR, filename);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);

    return {
      slug: slugify(filename),
      code: data.code ?? '',
      artist: data.artist ?? '',
      title: data.title ?? '',
      year: data.year ?? 0,
      genre: data.genre ?? '',
      mainType: data.main_type ?? '',
      strength: data.strength ?? 0,
      vowelSkeleton: data.vowel_skeleton ?? '',
      consonantClass: data.consonant_class ?? '',
      primaryCluster: data.primary_cluster ?? 0,
      clusterName: data.cluster_name ?? '',
      existenceStatus: data.existence_status ?? '',
      confidence: data.confidence ?? '',
      spotifyUrl: data.spotify_url ?? '',
      rhymePatterns: data.rhyme_patterns ?? [],
      tags: data.tags ?? [],
      lyrics: parseLyrics(content),
      rhymeGroups: parseRhymeGroups(content),
    };
  } catch {
    return null;
  }
}

export function getAllSongs(): Song[] {
  if (!fs.existsSync(SONGS_DIR)) return [];
  const files = fs.readdirSync(SONGS_DIR).filter(f => f.endsWith('.md'));
  return files
    .map(f => parseSongFile(f))
    .filter((s): s is Song => s !== null && s.artist !== '');
}

export function getSongBySlug(slug: string): Song | null {
  return parseSongFile(slug + '.md');
}

export function getSongsByArtist(artist: string): Song[] {
  return getAllSongs().filter(s => s.artist === artist);
}

export function getSongsByCluster(clusterName: string): Song[] {
  return getAllSongs().filter(s => s.clusterName === clusterName);
}
