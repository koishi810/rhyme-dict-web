// Phonetic aperture (mouth openness) → bar height
// Vowel color is fixed per vowel quality
const MORA_CONFIG: Record<string, { color: string; height: number; label: string }> = {
  a: { color: '#fb7185', height: 32, label: 'a' },   // rose    — fully open
  e: { color: '#fbbf24', height: 22, label: 'e' },   // amber   — half-open
  o: { color: '#c084fc', height: 17, label: 'o' },   // violet  — mid-rounded
  u: { color: '#34d399', height: 11, label: 'u' },   // emerald — close-back
  i: { color: '#60a5fa', height: 7,  label: 'i' },   // sky     — close-front
  N: { color: '#94a3b8', height: 15, label: 'ん' },  // slate   — nasal mora
  Q: { color: '#cbd5e1', height: 5,  label: 'っ' },  // light   — silent mora
};

// Small kana that combine with the preceding kana to form one mora
const SMALL_KANA = new Set('ぁぃぅぇぉゃゅょァィゥェォャュョ');

/**
 * Split Japanese text into mora-level segments (from left to right).
 * Compound kana (e.g. きゃ, しょ) are kept as one segment.
 * Punctuation / spaces / ASCII letters are kept as individual segments
 * but won't be color-matched (they are skipped in mora counting).
 */
function segmentMoras(text: string): string[] {
  const chars = [...text]; // Unicode-aware
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

// Characters that should not count as a mora (punctuation, spaces, etc.)
const NON_MORA = /^[\s　。、「」『』【】（）｛｝〔〕［］〈〉《》・…―〜！？!?.,\-\/\\()\[\]{}'"]+$/;

function isMoraChar(seg: string): boolean {
  return !NON_MORA.test(seg);
}

// Pad a mora array on the LEFT with nulls for right-alignment
function padLeft(moras: string[], maxLen: number): (string | null)[] {
  const pad = maxLen - moras.length;
  return [...Array(pad).fill(null), ...moras];
}

// ─── VowelBar ───────────────────────────────────────────────────────────────

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
        if (mora === null) {
          return <div key={i} style={{ width: barW, flexShrink: 0 }} />;
        }
        const cfg = MORA_CONFIG[mora] ?? { color: '#e2e8f0', height: 8, label: mora };
        const dimmed = matchPositions ? !matchPositions.has(i) : false;
        const matched = matchPositions?.has(i) ?? false;

        return (
          <div key={i} className="flex flex-col items-center" style={{ gap: compact ? 1 : 2 }}>
            <div
              style={{
                width: barW,
                height: cfg.height,
                backgroundColor: cfg.color,
                borderRadius: '3px 3px 0 0',
                opacity: dimmed ? 0.22 : 1,
                boxShadow: matched ? `0 0 0 2px ${cfg.color}44` : 'none',
                transition: 'opacity 0.15s',
              }}
              title={mora}
            />
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

// ─── ColorizedText ──────────────────────────────────────────────────────────

interface ColorizedTextProps {
  text: string;
  vowelPattern: string;
  matchPositions?: Set<number>;
  /** padded total length (same value passed to VowelBar) */
  maxLength?: number;
}

/**
 * Renders the lyric line with characters colored to match their corresponding
 * vowel bar. Coloring starts from the END of the text (tail = rhyme zone).
 * Non-mora characters (punctuation, spaces) are rendered in gray without color.
 */
export function ColorizedText({ text, vowelPattern, matchPositions, maxLength }: ColorizedTextProps) {
  const moras = vowelPattern.split('-').filter(Boolean);
  const moraCount = moras.length;
  // offset in the padded position array (needed to look up matchPositions correctly)
  const paddingOffset = maxLength != null ? maxLength - moraCount : 0;

  const segments = segmentMoras(text);

  // Walk from the end: assign each mora to the last N mora-chars in the text
  // First, collect the indices of mora-bearing segments (right to left)
  const moraIndices: number[] = [];
  for (let i = segments.length - 1; i >= 0 && moraIndices.length < moraCount; i--) {
    if (isMoraChar(segments[i])) moraIndices.unshift(i); // keep left-to-right order
  }
  // moraIndices[k] → the segment index that maps to moras[k]

  const colorMap = new Map<number, { mora: string; paddedPos: number }>();
  moraIndices.forEach((segIdx, k) => {
    colorMap.set(segIdx, { mora: moras[k], paddedPos: paddingOffset + k });
  });

  return (
    <span>
      {segments.map((seg, i) => {
        const entry = colorMap.get(i);
        if (!entry) {
          return (
            <span key={i} className="text-gray-800">
              {seg}
            </span>
          );
        }
        const cfg = MORA_CONFIG[entry.mora];
        if (!cfg) return <span key={i} className="text-gray-800">{seg}</span>;

        const dimmed = matchPositions ? !matchPositions.has(entry.paddedPos) : false;
        return (
          <span
            key={i}
            style={{
              color: cfg.color,
              opacity: dimmed ? 0.35 : 1,
              fontWeight: dimmed ? 400 : 700,
              transition: 'opacity 0.15s',
            }}
          >
            {seg}
          </span>
        );
      })}
    </span>
  );
}

// ─── RhymeLineDisplay ────────────────────────────────────────────────────────
// Unified component: characters sit directly above their vowel bars.

interface RhymeLineDisplayProps {
  text: string;
  vowelPattern: string;
  matchPositions?: Set<number>;
  maxLength?: number;
}

export function RhymeLineDisplay({ text, vowelPattern, matchPositions, maxLength }: RhymeLineDisplayProps) {
  const moras = vowelPattern.split('-').filter(Boolean);
  const moraCount = moras.length;
  const totalCols = maxLength ?? moraCount;
  const paddingOffset = totalCols - moraCount;

  const segments = segmentMoras(text);

  // Collect mora-bearing segment indices from the right
  const moraSegIndices: number[] = [];
  for (let i = segments.length - 1; i >= 0 && moraSegIndices.length < moraCount; i--) {
    if (isMoraChar(segments[i])) moraSegIndices.unshift(i);
  }

  // Everything before the first rhyme-mora segment
  const splitAt = moraSegIndices[0] ?? segments.length;
  const prefixText = segments.slice(0, splitAt).join('');

  const colW = 20;

  return (
    <div className="flex items-end" style={{ gap: 2 }}>
      {prefixText && (
        <span className="self-end text-sm leading-none pb-px" style={{ color: 'var(--tx-2)', marginRight: 2 }}>
          {prefixText}
        </span>
      )}
      {Array.from({ length: totalCols }, (_, pi) => {
        if (pi < paddingOffset) {
          return <div key={pi} style={{ width: colW, flexShrink: 0 }} />;
        }
        const moraIdx = pi - paddingOffset;
        const mora = moras[moraIdx];
        const segIdx = moraSegIndices[moraIdx];
        const char = segIdx !== undefined ? segments[segIdx] : '';
        const cfg = MORA_CONFIG[mora] ?? { color: '#e2e8f0', height: 8, label: mora };
        const dimmed = matchPositions ? !matchPositions.has(pi) : false;
        const matched = matchPositions?.has(pi) ?? false;

        return (
          <div key={pi} className="flex flex-col items-center" style={{ width: colW, flexShrink: 0, gap: 3 }}>
            <span style={{
              fontSize: 13,
              lineHeight: 1,
              color: cfg.color,
              opacity: dimmed ? 0.35 : 1,
              fontWeight: dimmed ? 400 : 700,
              transition: 'opacity 0.15s',
            }}>
              {char}
            </span>
            <div style={{
              width: colW - 6,
              height: cfg.height,
              backgroundColor: cfg.color,
              borderRadius: '3px 3px 0 0',
              opacity: dimmed ? 0.22 : 1,
              boxShadow: matched ? `0 0 0 2px ${cfg.color}44` : 'none',
              transition: 'opacity 0.15s',
            }} title={mora} />
          </div>
        );
      })}
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
    { mora: 'a', label: 'a — 最開口' },
    { mora: 'e', label: 'e' },
    { mora: 'o', label: 'o' },
    { mora: 'u', label: 'u' },
    { mora: 'i', label: 'i — 最閉口' },
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
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: cfg.height * 0.5,
                backgroundColor: cfg.color,
                borderRadius: 1,
                verticalAlign: 'middle',
              }}
            />
            {label}
          </span>
        );
      })}
      <span className="ml-1" style={{ color: 'var(--tx-3)' }}>｜ 高さ＝口の開き、色＝母音種類。グレーアウトは韻外</span>
    </div>
  );
}
