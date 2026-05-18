import type { FuriToken } from '@/lib/furigana';

const MORA_CONFIG: Record<string, { color: string; height: number; label: string }> = {
  a: { color: '#fb7185', height: 32, label: 'あ' },
  e: { color: '#fbbf24', height: 22, label: 'え' },
  o: { color: '#c084fc', height: 17, label: 'お' },
  u: { color: '#34d399', height: 11, label: 'う' },
  i: { color: '#60a5fa', height: 7,  label: 'い' },
  N: { color: '#94a3b8', height: 15, label: 'ん' },
  Q: { color: '#cbd5e1', height: 5,  label: 'っ' },
};

// Kana → vowel key
const KANA_VOWEL: Record<string, string> = {
  'あ':'a','い':'i','う':'u','え':'e','お':'o',
  'か':'a','き':'i','く':'u','け':'e','こ':'o',
  'が':'a','ぎ':'i','ぐ':'u','げ':'e','ご':'o',
  'さ':'a','し':'i','す':'u','せ':'e','そ':'o',
  'ざ':'a','じ':'i','ず':'u','ぜ':'e','ぞ':'o',
  'た':'a','ち':'i','つ':'u','て':'e','と':'o',
  'だ':'a','ぢ':'i','づ':'u','で':'e','ど':'o',
  'な':'a','に':'i','ぬ':'u','ね':'e','の':'o',
  'は':'a','ひ':'i','ふ':'u','へ':'e','ほ':'o',
  'ば':'a','び':'i','ぶ':'u','べ':'e','ぼ':'o',
  'ぱ':'a','ぴ':'i','ぷ':'u','ぺ':'e','ぽ':'o',
  'ま':'a','み':'i','む':'u','め':'e','も':'o',
  'や':'a','ゆ':'u','よ':'o',
  'ら':'a','り':'i','る':'u','れ':'e','ろ':'o',
  'わ':'a','ゐ':'i','ゑ':'e','を':'o',
  'ん':'N','っ':'Q',
  'ぁ':'a','ぃ':'i','ぅ':'u','ぇ':'e','ぉ':'o',
  'ゃ':'a','ゅ':'u','ょ':'o',
};

function kanaVowel(kana: string): string | null {
  const last = [...kana].pop() ?? kana;
  return KANA_VOWEL[last] ?? null;
}

function kanaColor(kana: string): string {
  const v = kanaVowel(kana);
  return v ? (MORA_CONFIG[v]?.color ?? '#e2e8f0') : '#e2e8f0';
}

// Small kana that combine with preceding to form one mora
const SMALL_KANA = new Set('ぁぃぅぇぉゃゅょァィゥェォャュョ');

function segmentMoras(text: string): string[] {
  const chars = [...text];
  const segments: string[] = [];
  let i = 0;
  while (i < chars.length) {
    const ch = chars[i];
    const next = i + 1 < chars.length ? chars[i + 1] : '';
    if (next && SMALL_KANA.has(next)) {
      segments.push(ch + next);
      i += 2;
    } else {
      segments.push(ch);
      i++;
    }
  }
  return segments;
}

const NON_MORA = /^[\s　。、「」『』【】（）｛｝〔〕［］〈〉《》・…―〜！？!?.,\-\/\\()\[\]{}'"]+$/;
function isMoraChar(seg: string): boolean { return !NON_MORA.test(seg); }

function padLeft(moras: string[], maxLen: number): (string | null)[] {
  const pad = maxLen - moras.length;
  return [...Array(pad).fill(null), ...moras];
}

// ─── VowelBar (header skeleton display) ─────────────────────────────────────

interface VowelBarProps {
  pattern: string;
  matchPositions?: Set<number>;
  compact?: boolean;
  maxLength?: number;
}

export function VowelBar({ pattern, matchPositions, compact = false, maxLength }: VowelBarProps) {
  const raw = pattern.split('-').filter(Boolean);
  const moras = maxLength != null ? padLeft(raw, maxLength) : raw;
  const barW = compact ? 8 : 13;

  return (
    <div className="flex items-end" style={{ gap: compact ? 2 : 3 }}>
      {moras.map((mora, i) => {
        if (mora === null) return <div key={i} style={{ width: barW, flexShrink: 0 }} />;
        const cfg = MORA_CONFIG[mora] ?? { color: '#e2e8f0', height: 8, label: mora };
        const dimmed = matchPositions ? !matchPositions.has(i) : false;
        const matched = matchPositions?.has(i) ?? false;
        return (
          <div key={i} className="flex flex-col items-center" style={{ gap: compact ? 1 : 2 }}>
            <div style={{
              width: barW, height: cfg.height,
              backgroundColor: cfg.color, borderRadius: '3px 3px 0 0',
              opacity: dimmed ? 0.22 : 1,
              boxShadow: matched ? `0 0 0 2px ${cfg.color}44` : 'none',
              transition: 'opacity 0.15s',
            }} title={mora} />
            {!compact && (
              <span style={{ fontSize: 8, color: cfg.color, fontWeight: 600, lineHeight: 1 }}>
                {cfg.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── RhymeLineDisplay ────────────────────────────────────────────────────────
// Unified: kana-annotated text row + SVG line chart row, columns aligned.

interface RhymeLineDisplayProps {
  text: string;
  vowelPattern: string;
  matchPositions?: Set<number>;
  maxLength?: number;
  readings?: FuriToken[]; // pre-computed by kuromoji (server-side)
}

const COL_W = 22;
const COL_GAP = 3;
const CHART_H = 44;
const CHART_TOP_PAD = 6;

export function RhymeLineDisplay({
  text, vowelPattern, matchPositions, maxLength, readings,
}: RhymeLineDisplayProps) {
  const moras = vowelPattern.split('-').filter(Boolean);
  const moraCount = moras.length;
  const totalCols = maxLength ?? moraCount;   // includes padding
  const paddingOffset = totalCols - moraCount;

  const segments = segmentMoras(text);

  // Right-aligned mora-to-segment mapping
  const moraSegIndices: number[] = [];
  for (let i = segments.length - 1; i >= 0 && moraSegIndices.length < moraCount; i--) {
    if (isMoraChar(segments[i])) moraSegIndices.unshift(i);
  }
  const moraOffset = moraCount - moraSegIndices.length;

  // Prefix = everything before the first rhyme-mora segment
  const splitAt = moraSegIndices[0] ?? segments.length;
  const prefixText = segments.slice(0, splitAt).join('');

  // Build kanji-reading lookup by character position in the prefix-stripped text
  // readings tokens cover the FULL text; we map surface positions
  const readingMap = new Map<number, string>(); // charIndex in original text → reading
  if (readings) {
    let pos = 0;
    for (const tok of readings) {
      if (tok.reading) readingMap.set(pos, tok.reading);
      pos += [...tok.surface].length;
    }
  }

  // For each mora column, derive: character, annotation kana, color
  // mora column index pi (0-based within totalCols, includes padding)
  const cols = Array.from({ length: totalCols }, (_, pi) => {
    if (pi < paddingOffset) return null; // padding

    const moraIdx = pi - paddingOffset;
    const mora = moras[moraIdx];
    const cfg = MORA_CONFIG[mora] ?? { color: '#e2e8f0', height: 8, label: '?' };

    const charK = moraIdx - moraOffset;
    const segIdx = charK >= 0 ? moraSegIndices[charK] : undefined;
    const char = segIdx !== undefined ? segments[segIdx] : '';

    // Annotation logic:
    // - Kana chars: NO annotation (the char itself is the reading)
    // - Kanji/others: show kuromoji reading if available, else vowel kana fallback
    const isKana = char ? /^[ぁ-ゖァ-ヶー]+$/.test(char) : false;
    let annotation: string | null = null;
    if (!isKana && segIdx !== undefined) {
      let charOffset = 0;
      for (let s = 0; s < segIdx; s++) charOffset += [...segments[s]].length;
      const r = readingMap.get(charOffset);
      annotation = r ?? cfg.label; // kuromoji reading or vowel kana fallback
    }

    const dimmed = matchPositions ? !matchPositions.has(pi) : false;
    const matched = matchPositions?.has(pi) ?? false;

    return { mora, cfg, char, annotation, dimmed, matched };
  });

  const svgW = totalCols * COL_W + (totalCols - 1) * COL_GAP;

  return (
    <div className="flex items-start gap-1">
      {/* Prefix text — flex-1 so it fills left space */}
      <span
        className="flex-1 text-right self-end text-sm leading-none pb-1"
        style={{ color: 'var(--tx-2)', paddingRight: prefixText ? 4 : 0, minWidth: 0 }}
      >
        {prefixText}
      </span>

      {/* Rhyme columns + chart, stacked vertically, fixed width */}
      <div className="flex flex-col" style={{ gap: 4, flexShrink: 0 }}>

        {/* Row 1: annotation + character */}
        <div className="flex" style={{ gap: COL_GAP }}>
          {cols.map((col, pi) => {
            if (col === null) {
              return <div key={pi} style={{ width: COL_W, flexShrink: 0 }} />;
            }
            const { cfg, char, annotation, dimmed } = col;

            // Render annotation kana — might be multiple kana (e.g. "きず")
            // kana chars are self-reading, no annotation needed
            const annoSegs = annotation ? segmentMoras(annotation) : [];
            return (
              <div
                key={pi}
                className="flex flex-col items-center"
                style={{ width: COL_W, flexShrink: 0, gap: 1 }}
              >
                {/* Annotation kana */}
                <div className="flex items-end justify-center" style={{ gap: 0, lineHeight: 1, minHeight: 12 }}>
                  {annoSegs.map((k, ki) => (
                    <span
                      key={ki}
                      style={{
                        fontSize: 9,
                        color: kanaColor(k),
                        opacity: dimmed ? 0.3 : 1,
                        fontWeight: 600,
                        letterSpacing: 0,
                      }}
                    >
                      {k}
                    </span>
                  ))}
                </div>
                {/* Character: kana gets vowel color, kanji stays neutral */}
                <span
                  style={{
                    fontSize: 14,
                    lineHeight: 1.1,
                    color: (char && annoSegs.length === 0 && !!char) ? cfg.color : 'var(--tx-1)',
                    opacity: dimmed ? 0.35 : 1,
                    fontWeight: (char && annoSegs.length === 0 && !!char) ? 700 : 500,
                  }}
                >
                  {char || ' '}
                </span>
              </div>
            );
          })}
        </div>

        {/* Row 2: SVG line chart */}
        <svg width={svgW} height={CHART_H} style={{ display: 'block', overflow: 'visible' }}>
          {/* connecting lines */}
          {cols.map((col, pi) => {
            if (!col) return null;
            const nextCol = cols.slice(pi + 1).find(c => c !== null);
            if (!nextCol) return null;
            const nextPi = cols.indexOf(nextCol, pi + 1);
            const x1 = pi * (COL_W + COL_GAP) + COL_W / 2;
            const x2 = nextPi * (COL_W + COL_GAP) + COL_W / 2;
            const y1 = CHART_H - CHART_TOP_PAD - col.cfg.height;
            const y2 = CHART_H - CHART_TOP_PAD - nextCol.cfg.height;
            const bothDim = col.dimmed && nextCol.dimmed;
            return (
              <line key={`l${pi}`}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={col.cfg.color}
                strokeWidth={1.5}
                opacity={bothDim ? 0.12 : 0.45}
                strokeLinecap="round"
              />
            );
          })}
          {/* dots */}
          {cols.map((col, pi) => {
            if (!col) return null;
            const x = pi * (COL_W + COL_GAP) + COL_W / 2;
            const y = CHART_H - CHART_TOP_PAD - col.cfg.height;
            return (
              <g key={`d${pi}`}>
                {col.matched && (
                  <circle cx={x} cy={y} r={8} fill={col.cfg.color} opacity={0.15} />
                )}
                <circle
                  cx={x} cy={y}
                  r={col.matched ? 5 : 3.5}
                  fill={col.cfg.color}
                  opacity={col.dimmed ? 0.18 : 1}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ─── computeMatchPositions ──────────────────────────────────────────────────

export function computeMatchPositions(patterns: string[]): Set<number> {
  if (patterns.length < 2) return new Set();
  const split = patterns.map(p => p.split('-').filter(Boolean));
  const maxLen = Math.max(...split.map(s => s.length));
  const padded = split.map(s => padLeft(s, maxLen));
  const result = new Set<number>();
  for (let i = 0; i < maxLen; i++) {
    const ref = padded[0][i];
    if (ref !== null && padded.every(s => s[i] === ref)) result.add(i);
  }
  return result;
}

export function maxPatternLength(patterns: string[]): number {
  return Math.max(0, ...patterns.map(p => p.split('-').filter(Boolean).length));
}

// ─── VowelLegend ────────────────────────────────────────────────────────────

export function VowelLegend() {
  const items = [
    { mora: 'a', label: 'あ — 最開口' },
    { mora: 'e', label: 'え' },
    { mora: 'o', label: 'お' },
    { mora: 'u', label: 'う' },
    { mora: 'i', label: 'い — 最閉口' },
    { mora: 'N', label: 'ん' },
    { mora: 'Q', label: 'っ' },
  ] as const;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]" style={{ color: 'var(--tx-3)' }}>
      <span className="font-medium" style={{ color: 'var(--tx-2)' }}>母音凡例</span>
      {items.map(({ mora, label }) => {
        const cfg = MORA_CONFIG[mora];
        return (
          <span key={mora} className="flex items-center gap-1">
            <span style={{
              display: 'inline-block', width: 7, height: 7,
              backgroundColor: cfg.color, borderRadius: '50%', verticalAlign: 'middle',
            }} />
            {label}
          </span>
        );
      })}
      <span className="ml-1" style={{ color: 'var(--tx-3)' }}>｜ 高さ＝口の開き、色＝母音種類</span>
    </div>
  );
}
