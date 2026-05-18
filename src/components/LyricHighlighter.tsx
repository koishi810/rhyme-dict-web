'use client';

import { useState } from 'react';
import type { RhymeGroup } from '@/lib/types';
import { getColorForGroup } from '@/lib/rhymeColors';

interface Props {
  lyrics: string;
  rhymeGroups: RhymeGroup[];
}

function buildLineMap(rhymeGroups: RhymeGroup[]): Map<string, number> {
  const map = new Map<string, number>();
  rhymeGroups.forEach((group, idx) => {
    group.lines.forEach(line => {
      const key = normalizeText(line.text);
      if (!map.has(key)) map.set(key, idx);
    });
  });
  return map;
}

function normalizeText(t: string): string {
  return t.replace(/[\s　]+/g, '').replace(/[?？!！。、]/g, '');
}

export default function LyricHighlighter({ lyrics, rhymeGroups }: Props) {
  const [activeGroup, setActiveGroup] = useState<number | null>(null);
  const lineMap = buildLineMap(rhymeGroups);
  const lines = lyrics.split('\n');

  const totalHighlighted = new Set(
    rhymeGroups.flatMap(g => g.lines.map(l => normalizeText(l.text)))
  ).size;

  return (
    <div className="space-y-4">
      {rhymeGroups.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {rhymeGroups.map((group, idx) => {
            const color = getColorForGroup(idx);
            const isActive = activeGroup === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveGroup(isActive ? null : idx)}
                className={`
                  flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                  border transition-all
                  ${color.bg} ${color.border} ${color.text}
                  ${isActive ? 'ring-2 ring-offset-2 ring-offset-[#13131e] ring-current shadow-lg' : 'opacity-60 hover:opacity-100'}
                `}
              >
                <span className={`w-2 h-2 rounded-full ${color.dot}`} />
                <span>グループ{group.index}</span>
                <span className="opacity-60">{group.label}</span>
                <span className="opacity-50">×{group.lineCount}</span>
              </button>
            );
          })}
          <span className="text-xs self-center ml-1" style={{ color: 'var(--tx-3)' }}>
            {totalHighlighted}行に韻あり
          </span>
        </div>
      )}

      <div className="font-mono text-sm leading-7 whitespace-pre-wrap">
        {lines.map((line, i) => {
          const norm = normalizeText(line);
          const groupIdx = norm ? lineMap.get(norm) : undefined;
          const isHighlighted = groupIdx !== undefined;
          const isDimmed = activeGroup !== null && groupIdx !== activeGroup;

          if (!line.trim()) {
            return <div key={i} className="h-3" />;
          }

          if (!isHighlighted) {
            return (
              <div
                key={i}
                className={`px-2 py-0.5 rounded transition-opacity ${isDimmed ? 'opacity-10' : ''}`}
                style={{ color: isDimmed ? undefined : 'var(--tx-2)' }}
              >
                {line}
              </div>
            );
          }

          const color = getColorForGroup(groupIdx!);
          return (
            <div
              key={i}
              className={`
                px-2 py-0.5 rounded border-l-[3px] transition-all cursor-pointer
                ${color.bg} ${color.border} ${color.text}
                ${isDimmed ? 'opacity-10' : ''}
                ${activeGroup === groupIdx ? 'shadow-sm' : ''}
              `}
              onClick={() => setActiveGroup(activeGroup === groupIdx ? null : groupIdx!)}
            >
              {line}
            </div>
          );
        })}
      </div>
    </div>
  );
}
