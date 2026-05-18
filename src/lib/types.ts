export type ClusterName =
  | '①同位置韻'
  | '②同方法韻'
  | '③清濁韻'
  | '④連韻'
  | '⑤広狭韻'
  | '⑥音色韻'
  | '⑦重ね韻'
  | '⑧特殊モーラ韻'
  | '⑨越境韻'
  | string;

export type ChapterAxis = '子音軸' | '母音軸' | '構造軸';

export interface RhymeGroup {
  index: number;
  label: string;       // e.g. "i-o-o 系"
  chapter: string;     // e.g. "⑤広狭韻"
  lineCount: number;
  lines: RhymeLine[];
  techniques: string[];
  acousticNotes: string;
}

export interface RhymeLine {
  order: number;
  text: string;
  vowelPattern: string;
}

export interface Song {
  slug: string;
  code: string;
  artist: string;
  title: string;
  year: number;
  genre: string;
  mainType: string;
  strength: number;
  vowelSkeleton: string;
  consonantClass: string;
  primaryCluster: number;
  clusterName: ClusterName;
  existenceStatus: string;
  confidence: string;
  spotifyUrl: string;
  rhymePatterns: string[];
  tags: string[];
  lyrics: string;
  rhymeGroups: RhymeGroup[];
}

export interface Chapter {
  id: string;           // e.g. "①同位置韻"
  number: number;       // 1–9
  name: string;
  axis: ChapterAxis;
  axisColor: 'blue' | 'green' | 'yellow';
  oneLiner: string;
  description: string;
  techniques: string[];
  representativeSongs: RepresentativeSong[];
  rawContent: string;
}

export interface RepresentativeSong {
  artist: string;
  title: string;
  year: number;
  vowelSkeleton: string;
  excerpt: string;
  comment: string;
}

export interface Artist {
  slug: string;
  name: string;
  songCount: number;
  songs: ArtistSongEntry[];
  styleAnalysis: string;
}

export interface ArtistSongEntry {
  title: string;
  year: number;
  genre: string;
  clusterName: string;
  existenceStatus: string;
}
