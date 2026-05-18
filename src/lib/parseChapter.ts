import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Chapter, ChapterAxis, RepresentativeSong } from './types';

const CHAPTERS_DIR = path.join(process.cwd(), 'data/分類');

export const CHAPTER_META: Record<string, {
  number: number;
  axis: ChapterAxis;
  axisColor: 'blue' | 'green' | 'yellow';
  oneLiner: string;
}> = {
  '①同位置韻': { number: 1, axis: '子音軸', axisColor: 'blue',   oneLiner: '同じ調音位置の子音で揃える' },
  '②同方法韻': { number: 2, axis: '子音軸', axisColor: 'blue',   oneLiner: '同じ調音法の子音で揃える' },
  '③清濁韻':   { number: 3, axis: '子音軸', axisColor: 'blue',   oneLiner: '清濁ペアの対比で揃える' },
  '④連韻':     { number: 4, axis: '母音軸', axisColor: 'green',  oneLiner: '末尾母音が4音以上連なる長鎖韻' },
  '⑤広狭韻':   { number: 5, axis: '母音軸', axisColor: 'green',  oneLiner: '広母音aと狭母音iの振動配列' },
  '⑥音色韻':   { number: 6, axis: '母音軸', axisColor: 'green',  oneLiner: '暗色/前舌/開放のどれかへ偏向' },
  '⑦重ね韻':   { number: 7, axis: '構造軸', axisColor: 'yellow', oneLiner: '子音と母音が両方完全一致するX型' },
  '⑧特殊モーラ韻': { number: 8, axis: '構造軸', axisColor: 'yellow', oneLiner: '撥音N/促音Qが韻のアンカー' },
  '⑨越境韻':   { number: 9, axis: '構造軸', axisColor: 'yellow', oneLiner: '英語と日本語を跨ぐ韻' },
};

function extractOneLiner(content: string, fallback: string): string {
  const match = content.match(/^>\s*(.+)/m);
  return match ? match[1].replace(/\*\*/g, '').trim() : fallback;
}

function extractRepresentativeSongs(content: string): RepresentativeSong[] {
  const songs: RepresentativeSong[] = [];
  // Match "### N. [[Artist - Title|...]]" blocks
  const blockRegex = /###\s+\d+\.\s+\[\[([^\]|]+)(?:\|([^\]]+))?\]\]\s*\([^)]*\)([\s\S]*?)(?=###\s+\d+\.|\n##|\Z|$)/g;
  let m;
  while ((m = blockRegex.exec(content)) !== null) {
    const raw = m[1].trim(); // "BUDDHA BRAND - 人間発電所"
    const parts = raw.split(' - ');
    const artist = parts[0]?.trim() ?? '';
    const title = parts.slice(1).join(' - ').trim();

    const block = m[3];
    const skeletonMatch = block.match(/\*\*末尾骨格\*\*[:：]\s*`([^`]+)`/);
    const excerptMatch = block.match(/>\s*([^\n]+)/);
    const commentMatch = block.match(/\*\*なぜ伝わるか\*\*[:：]\s*([^\n]+)/);

    songs.push({
      artist,
      title,
      year: 0,
      vowelSkeleton: skeletonMatch?.[1] ?? '',
      excerpt: excerptMatch?.[1]?.trim() ?? '',
      comment: commentMatch?.[1]?.trim() ?? '',
    });
  }
  return songs;
}

export function parseChapterFile(filename: string): Chapter | null {
  const filePath = path.join(CHAPTERS_DIR, filename);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);

    const id: string = data.chapter_name ?? filename.replace(/\.md$/, '');
    const meta = CHAPTER_META[id];
    if (!meta) return null;

    return {
      id,
      number: meta.number,
      name: id,
      axis: meta.axis,
      axisColor: meta.axisColor,
      oneLiner: meta.oneLiner,
      description: extractOneLiner(content, meta.oneLiner),
      techniques: [],
      representativeSongs: extractRepresentativeSongs(content),
      rawContent: content,
    };
  } catch {
    return null;
  }
}

export function getAllChapters(): Chapter[] {
  if (!fs.existsSync(CHAPTERS_DIR)) return [];
  const files = fs.readdirSync(CHAPTERS_DIR).filter(f => f.endsWith('.md'));
  return files
    .map(f => parseChapterFile(f))
    .filter((c): c is Chapter => c !== null)
    .sort((a, b) => a.number - b.number);
}

export function getChapterById(id: string): Chapter | null {
  const filename = id + '.md';
  return parseChapterFile(filename);
}
