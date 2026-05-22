import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { CHAPTER_META } from './parseChapter';

const CHAPTERS_DIR = path.join(process.cwd(), 'data/分類');

/**
 * Book-style structured view of a chapter, optimized for the vertical
 * Japanese dictionary layout.
 */

export interface BookExample {
  text: string;        // 歌詞
  vowels: string;      // 末尾母音
  consonant: string;   // 末尾子音
}

export interface BookSong {
  artist: string;
  title: string;
  year: string;
  rhymeGroup: string;      // 韻グループ
  reasons: string[];       // この章に該当する理由 (bullet points)
  primaryExamples: BookExample[];
  secondaryExamples: BookExample[];
  techniques: string;      // 検出された音韻的工夫
  alsoIn: string[];        // 別の章にも該当
}

export interface BookSection {
  position: string;        // e.g. "両唇音"
  caption: string;         // italic caption
  intro?: string;          // optional pre-written explainer (from POSITION_INTROS)
  songs: BookSong[];
}

export interface BookChapter {
  id: string;
  number: number;
  title: string;           // "①同位置韻"
  subtitle: string;        // tag-line / blockquote
  description: string;
  axis: string;
  axisColor: 'blue' | 'green' | 'yellow';
  sections: BookSection[];
  /** Sections that contain real position/method-based sub-grouping with example songs. */
  hasSubSections: boolean;
}

// Section headings to ignore (meta sections, not actual sub-categories).
const META_HEADINGS_PATTERNS = [
  /^章の本質/,
  /^厳選代表員/,
  /^.*別の内訳$/,    // 調音位置別の内訳, 調音法別の内訳, 連なる母音数別の内訳, etc.
  /^どの曲のどの部分がこの章に該当するか$/,
];

function isMetaHeading(heading: string): boolean {
  return META_HEADINGS_PATTERNS.some(p => p.test(heading.trim()));
}

/**
 * Hand-written intro paragraphs for each articulation-position section.
 * These complement the brief italic captions in the markdown so each book
 * "spread" has a substantive explainer body matching the template design.
 */
const POSITION_INTROS: Record<string, string> = {
  両唇音:
    '両唇音（りょうしんおん）とは、その名の通り「両方の唇を使って出す音」のこと。試しに「パ」と発音してみてください。唇をいったん閉じて、勢いよく開きながら息を出していますよね。この「上下の唇がくっついて、そこから音を作る」というのが両唇音の特徴です。日本語ではパ行・バ行・マ行がこの仲間で、子音字としては p, b, m が並びます。',
  歯茎音:
    '歯茎音（しけいおん）とは、上の前歯のすぐ後ろにある「歯茎（はぐき）」と呼ばれる場所に、舌先を当てたり近づけたりして出す音のことです。試しに「タ」「ナ」「サ」と続けて発音してみてください。どれも舌の先が上の歯の裏あたりに触れている、または擦れている感覚があるはずです。日本語ではタ・ナ・ラ・サ・ザ行が代表的で、子音字としては t, d, n, s, z, r が並びます。',
  硬口蓋音:
    '硬口蓋音（こうこうがいおん）とは、口の中の天井（上あご）にある、骨でできた硬い部分＝硬口蓋を使って出す音のこと。試しに「ヤ」と発音してみてください。舌の真ん中あたりが上あごにグッと近づいて、その狭い隙間から息が抜けていく感覚があるはずです。日本語ではヤ行と、小さい「ャ・ュ・ョ」が付く拗音（キャ・シャ・チャ・ジャなど）が硬口蓋音の仲間です。',
  軟口蓋音:
    '軟口蓋音（なんこうがいおん）とは、口の天井のさらに奥にある柔らかい部分＝軟口蓋を、舌の奥のほうで持ち上げて出す音のことです。試しに「カ」「ガ」と発音してみてください。喉の奥のほうで舌が天井に触れて、ポンと息が破裂するのが分かるはずです。日本語ではカ行・ガ行が代表で、子音字としては k, g が並びます。',
  声門音:
    '声門音（せいもんおん）とは、喉のいちばん奥にある「声門（せいもん）」、つまり声帯のあいだの隙間で作られる音のこと。「ハ」と発音すると、口の中ではほとんど何もせず、喉の奥からスーッと息だけが出てくるのが感じられます。日本語ではハ行が代表で、子音字としては h です。',
  唇歯音:
    '唇歯音（しんしおん）とは、下唇と上の歯（前歯）を軽く接触させて出す音のこと。日本語の固有音には少なく、主に外来語の「ファ・フィ・フォ」やヴ音に現れます。子音字としては f, v が代表です。',
  鼻音:
    '鼻音（びおん）とは、口の中で空気の通り道を一度ふさいで、代わりに鼻から空気を抜きながら出す音のことです。「マ」「ナ」を発音しながら鼻をつまむとうまく発音できないのは、鼻に空気が抜けていく必要があるからです。日本語ではマ行・ナ行と撥音「ん」が代表で、子音字としては m, n が並びます。',
  破裂音:
    '破裂音（はれつおん）とは、口の中の空気の通り道をいったん完全に閉じ、内側に圧力を溜めてから一気に解放することで「破裂」させて出す音のこと。試しに「パ」「タ」「カ」と発音してみてください。どれも息が一瞬止まり、ポン！と弾けるアタックがあるのが分かるはずです。子音字としては p, t, k, b, d, g が並びます。',
  摩擦音:
    '摩擦音（まさつおん）とは、空気の通り道を完全には閉じず、ごく狭い隙間を作って息をそこから擦るように通すことで生まれる音のこと。「サ」「シ」「ハ」「フ」など、息がスーッ・シューッと擦れる感覚のある音はみな摩擦音です。子音字としては s, z, sh, h, f が代表です。',
  流音:
    '流音（りゅうおん）とは、舌を歯茎のあたりに軽く触れさせながらも、空気の通り道はある程度開いたまま流れるように出す音のこと。日本語ではラ行が代表で、舌先が上の歯茎を弾くように軽く触れます。子音字としては r が代表です。',
  半母音:
    '半母音（はんぼいん）とは、子音と母音の中間のような音で、舌や唇を母音に近い位置に近づけながら短く滑らせるように出す音のこと。日本語ではヤ行・ワ行が代表で、子音字としては y, w が並びます。',
};

function extractSubtitle(content: string): string {
  // Take the first blockquote line as the subtitle
  const match = content.match(/^>\s*(.+)/m);
  if (!match) return '';
  return match[1].replace(/\*\*/g, '').trim();
}

function extractDescription(content: string): string {
  // Take all leading blockquotes joined
  const blockquotes: string[] = [];
  const lines = content.split('\n');
  let inBq = false;
  for (const line of lines) {
    if (line.startsWith('>')) {
      blockquotes.push(line.replace(/^>\s*/, '').replace(/\*\*/g, '').trim());
      inBq = true;
    } else if (inBq && line.trim() === '') {
      // blank line within blockquote zone, continue
    } else if (inBq) {
      break;
    }
  }
  return blockquotes.join(' / ');
}

function parseMarkdownTable(text: string): BookExample[] {
  const lines = text.split('\n').filter(l => l.trim().startsWith('|'));
  if (lines.length < 2) return [];
  const rows: BookExample[] = [];
  // Skip header (lines[0]) and separator (lines[1])
  for (let i = 2; i < lines.length; i++) {
    const cells = lines[i].split('|').map(c => c.trim());
    // First and last are empty due to surrounding |s
    const filtered = cells.slice(1, -1);
    if (filtered.length >= 3) {
      rows.push({
        text: filtered[0],
        vowels: filtered[1].replace(/`/g, '').trim(),
        consonant: filtered[2].replace(/`/g, '').trim(),
      });
    }
  }
  return rows;
}

interface RawSongBlock {
  index: number;
  rawHeading: string;
  body: string;
}

/** Split a section body by `### N. ...` song headings. */
function splitSongs(sectionBody: string): RawSongBlock[] {
  const songs: RawSongBlock[] = [];
  const regex = /^###\s+(\d+)\.\s+(.+)$/gm;
  const matches: { index: number; raw: string; start: number }[] = [];
  let m;
  while ((m = regex.exec(sectionBody)) !== null) {
    matches.push({ index: parseInt(m[1]), raw: m[2], start: m.index });
  }
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].start;
    const end = i + 1 < matches.length ? matches[i + 1].start : sectionBody.length;
    const body = sectionBody.slice(start, end);
    songs.push({ index: matches[i].index, rawHeading: matches[i].raw, body });
  }
  return songs;
}

function parseSong(block: RawSongBlock): BookSong | null {
  // Heading like "[[BUDDHA BRAND - 人間発電所|BUDDHA BRAND —「人間発電所」]] (1996)"
  const linkMatch = block.rawHeading.match(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]\s*(?:\(([^)]*)\))?/);
  if (!linkMatch) return null;
  const slug = linkMatch[1].trim();
  const parts = slug.split(' - ');
  const artist = parts[0]?.trim() ?? '';
  const title = parts.slice(1).join(' - ').trim();
  const year = linkMatch[2]?.trim() ?? '';

  const rhymeGroupMatch = block.body.match(/\*\*韻グループ\*\*[:：]\s*([^\n]+)/);
  const rhymeGroup = rhymeGroupMatch?.[1]?.replace(/`/g, '').trim() ?? '';

  // 「この曲は別の韻箇所で [[②同方法韻]] / [[③清濁韻]] にも該当」
  const alsoInMatches = [...block.body.matchAll(/\[\[(?:[①-⑨][^|\]]+)\]\]/g)];
  const alsoIn = Array.from(new Set(alsoInMatches.map(mm => mm[0].replace(/\[\[|\]\]/g, ''))));

  // Reasons
  const reasonMatch = block.body.match(/\*\*この章に該当する理由\*\*[:：]?\s*\n([\s\S]*?)(?=\n\*\*|\n---|\n##|\n###|$)/);
  const reasons: string[] = [];
  if (reasonMatch) {
    const lines = reasonMatch[1].split('\n');
    for (const line of lines) {
      const bullet = line.match(/^\s*-\s+(.+)$/);
      if (bullet) reasons.push(bullet[1].replace(/`/g, '').trim());
    }
  }

  // Tables: 該当歌詞 + 同曲内の他の…
  // Capture text after **該当歌詞**: up to the next ** or section break
  const primaryTableMatch = block.body.match(/\*\*該当歌詞\*\*[:：]?\s*\n([\s\S]*?)(?=\n\*\*|\n---|\n##|\n###|$)/);
  const primaryExamples = primaryTableMatch ? parseMarkdownTable(primaryTableMatch[1]) : [];

  const secondaryTableMatch = block.body.match(/\*\*同曲内の他の[^*]+\*\*[^\n]*\n([\s\S]*?)(?=\n\*\*|\n---|\n##|\n###|$)/);
  const secondaryExamples = secondaryTableMatch ? parseMarkdownTable(secondaryTableMatch[1]) : [];

  const techniquesMatch = block.body.match(/\*\*検出された音韻的工夫\*\*[:：]?\s*([^\n]+)/);
  const techniques = techniquesMatch?.[1]?.trim() ?? '';

  return {
    artist,
    title,
    year,
    rhymeGroup,
    reasons,
    primaryExamples,
    secondaryExamples,
    techniques,
    alsoIn,
  };
}

/** Split the whole content into `## ` sections. */
function splitSections(content: string): { heading: string; body: string }[] {
  const regex = /^##\s+(.+)$/gm;
  const headings: { heading: string; start: number }[] = [];
  let m;
  while ((m = regex.exec(content)) !== null) {
    headings.push({ heading: m[1].trim(), start: m.index });
  }
  const sections: { heading: string; body: string }[] = [];
  for (let i = 0; i < headings.length; i++) {
    const start = headings[i].start;
    const end = i + 1 < headings.length ? headings[i + 1].start : content.length;
    const fullText = content.slice(start, end);
    // Strip the heading line itself
    const body = fullText.replace(/^##\s+.+\n?/, '');
    sections.push({ heading: headings[i].heading, body });
  }
  return sections;
}

function extractPositionName(heading: string): { position: string; rest: string } {
  // "両唇音 で揃える韻" -> "両唇音"
  // "鼻音 で揃える韻" -> "鼻音"
  // Fallback: first token before whitespace
  const m = heading.match(/^(\S+)\s*(.*)$/);
  if (!m) return { position: heading, rest: '' };
  return { position: m[1], rest: m[2] };
}

function extractCaption(body: string): string {
  // First italic line like "_唇の閉鎖、温かさ・親密_"
  const m = body.match(/^_(.+?)_/m);
  return m ? m[1].trim() : '';
}

export function parseBookChapter(filename: string): BookChapter | null {
  const filePath = path.join(CHAPTERS_DIR, filename);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const id: string = data.chapter_name ?? filename.replace(/\.md$/, '');
  const meta = CHAPTER_META[id];
  if (!meta) return null;

  const subtitle = extractSubtitle(content);
  const description = extractDescription(content);
  const allSections = splitSections(content);

  const sections: BookSection[] = [];
  for (const section of allSections) {
    if (isMetaHeading(section.heading)) continue;
    const { position } = extractPositionName(section.heading);
    const caption = extractCaption(section.body);
    const songBlocks = splitSongs(section.body);
    const songs: BookSong[] = [];
    for (const b of songBlocks) {
      const parsed = parseSong(b);
      if (parsed) songs.push(parsed);
    }
    if (songs.length === 0) continue; // skip empty sections
    sections.push({
      position,
      caption,
      intro: POSITION_INTROS[position],
      songs,
    });
  }

  return {
    id,
    number: meta.number,
    title: id,
    subtitle,
    description,
    axis: meta.axis,
    axisColor: meta.axisColor,
    sections,
    hasSubSections: sections.length > 0,
  };
}

export function getAllBookChapters(): BookChapter[] {
  if (!fs.existsSync(CHAPTERS_DIR)) return [];
  return fs
    .readdirSync(CHAPTERS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(parseBookChapter)
    .filter((c): c is BookChapter => c !== null)
    .sort((a, b) => a.number - b.number);
}

export function getBookChapter(id: string): BookChapter | null {
  return parseBookChapter(id + '.md');
}
