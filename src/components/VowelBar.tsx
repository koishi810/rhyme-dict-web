// Phonetic aperture (mouth openness) → y-position on line chart
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

function isMoraChar(seg: string): boolean {
  return !NON_MORA.test(seg);
}

function padLeft(moras: string[], maxLen: number): (string | null)[] {
  const pad = maxLen - moras.length;
  return [...Array(pad).fill(null), ...moras];
}

// Right-align segments to moras. Returns the map and the moraOffset.
function buildSegMoraMap(text: string, moras: string[]) {
  const moraCount = moras.length;
  const segments = segmentMoras(text);
  const moraSegIndices: number[] = [];
  for (let i = segments.length - 1; i >= 0 && moraSegIndices.length < moraCount; i--) {
    if (isMoraChar(segments[i])) moraSegIndices.unshift(i);
  }
  const moraOffset = moraCount - moraSegIndices.length;
  return { segments, moraSegIndices, moraOffset };
}

// ─── VowelBar (kept for the header vowel-skeleton display) ──────────────────

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

// ─── AnnotatedText ───────────────────────────────────────────────────────────
// Characters are neutral-colored; the vowel letter floats above as ruby annotation.

interface AnnotatedTextProps {
  text: string;
  vowelPattern: string;
  matchPositions?: Set<number>;
  maxLength?: number;
}

export function AnnotatedText({ text, vowelPattern, matchPositions, maxLength }: AnnotatedTextProps) {
  const moras = vowelPattern.split('-').filter(Boolean);
  const moraCount = moras.length;
  const paddingOffset = maxLength != null ? maxLength - moraCount : 0;
  const { segments, moraSegIndices, moraOffset } = buildSegMoraMap(text, moras);

  const segToMora = new Map<number, { mora: string; paddedPos: number }>();
  moraSegIndices.forEach((segIdx, k) => {
    const moraIdx = moraOffset + k;
    segToMora.set(segIdx, { mora: moras[moraIdx], paddedPos: paddingOffset + moraIdx });
  });

  return (
    <span style={{ lineHeight: 2.2 }}>
      {segments.map((seg, i) => {
        const entry = segToMora.get(i);
        if (!entry) {
          return (
            <span key={i} style={{ color: 'var(--tx-2)' }}>{seg}</span>
          );
        }
        const cfg = MORA_CONFIG[entry.mora];
        if (!cfg) return <span key={i} style={{ color: 'var(--tx-1)' }}>{seg}</span>;
        const dimmed = matchPositions ? !matchPositions.has(entry.paddedPos) : false;

        return (
          <ruby key={i}>
            <span style={{ color: 'var(--tx-1)', fontWeight: 600 }}>{seg}</span>
            <rt style={{
              color: cfg.color,
              opacity: dimmed ? 0.3 : 1,
              fontSize: '0.7em',
              fontWeight: 700,
              letterSpacing: 0,
            }}>
              {cfg.label}
            </rt>
          </ruby>
        );
      })}
    </span>
  );
}

// ─── VowelLine (SVG line chart) ──────────────────────────────────────────────

const COL_W = 16;
const COL_GAP = 4;
const CHART_H = 44;
const TOP_PAD = 6;

export function VowelLine({ pattern, matchPositions, maxLength }: VowelBarProps) {
  const raw = pattern.split('-').filter(Boolean);
  const moras = maxLength != null ? padLeft(raw, maxLength) : raw;
  const n = moras.length;
  const svgW = n * COL_W + (n - 1) * COL_GAP;

  type Pt = { x: number; y: number; mora: string; color: string; idx: number };
  const pts: (Pt | null)[] = moras.map((mora, i) => {
    if (mora === null) return null;
    const cfg = MORA_CONFIG[mora] ?? { color: '#e2e8f0', height: 8 };
    const x = i * (COL_W + COL_GAP) + COL_W / 2;
    const y = CHART_H - TOP_PAD - cfg.height;
    return { x, y, mora, color: cfg.color, idx: i };
  });

  return (
    <div>
      <svg
        width={svgW}
        height={CHART_H}
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* connecting lines between adjacent non-null points */}
        {pts.map((pt, i) => {
          if (!pt || i === n - 1) return null;
          const next = pts[i + 1];
          if (!next) return null;
          const dimA = matchPositions ? !matchPositions.has(pt.idx) : false;
          const dimB = matchPositions ? !matchPositions.has(next.idx) : false;
          return (
            <line
              key={`l${i}`}
              x1={pt.x} y1={pt.y}
              x2={next.x} y2={next.y}
              stroke={pt.color}
              strokeWidth={1.5}
              opacity={(dimA && dimB) ? 0.12 : 0.45}
              strokeLinecap="round"
            />
          );
        })}

        {/* dots */}
        {pts.map((pt, i) => {
          if (!pt) return null;
          const dimmed = matchPositions ? !matchPositions.has(pt.idx) : false;
          const matched = matchPositions?.has(pt.idx) ?? false;
          return (
            <g key={`d${i}`}>
              {matched && (
                <circle cx={pt.x} cy={pt.y} r={8} fill={pt.color} opacity={0.15} />
              )}
              <circle
                cx={pt.x} cy={pt.y} r={matched ? 5 : 3.5}
                fill={pt.color}
                opacity={dimmed ? 0.18 : 1}
              />
            </g>
          );
        })}
      </svg>

      {/* vowel labels below */}
      <div className="flex" style={{ gap: COL_GAP, marginTop: 2 }}>
        {moras.map((mora, i) => {
          if (mora === null) return <div key={i} style={{ width: COL_W }} />;
          const cfg = MORA_CONFIG[mora] ?? { color: '#e2e8f0', label: mora };
          const dimmed = matchPositions ? !matchPositions.has(i) : false;
          return (
            <div key={i} style={{ width: COL_W, textAlign: 'center' }}>
              <span style={{ fontSize: 8, color: cfg.color, fontWeight: 600, opacity: dimmed ? 0.18 : 1 }}>
                {cfg.label}
              </span>
            </div>
          );
        })}
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
                width: 7, height: 7,
                backgroundColor: cfg.color,
                borderRadius: '50%',
                verticalAlign: 'middle',
              }}
            />
            {label}
          </span>
        );
      })}
      <span className="ml-1" style={{ color: 'var(--tx-3)' }}>｜ 高さ＝口の開き、色＝母音種類</span>
    </div>
  );
}
