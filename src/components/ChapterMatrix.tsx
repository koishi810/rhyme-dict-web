'use client';

import Link from 'next/link';
import type { Chapter } from '@/lib/types';
import { AXIS_COLORS } from '@/lib/rhymeColors';

interface Props {
  chapters: Chapter[];
  songCounts?: Record<string, number>;
}

const AXIS_GROUPS = [
  { axis: '子音軸', label: '子音軸', sublabel: '発声器官', color: 'blue' as const },
  { axis: '母音軸', label: '母音軸', sublabel: '音色・配列', color: 'green' as const },
  { axis: '構造軸', label: '構造軸', sublabel: '特殊技法', color: 'yellow' as const },
];

export default function ChapterMatrix({ chapters, songCounts = {} }: Props) {
  const byAxis = (axis: string) => chapters.filter(c => c.axis === axis);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {AXIS_GROUPS.map(({ axis, label, sublabel, color }) => {
        const axisColor = AXIS_COLORS[color];
        return (
          <div key={axis} className={`rounded-xl border ${axisColor.border} ${axisColor.bg} p-4`}>
            <div className="mb-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${axisColor.badge}`}>
                {label}
              </span>
              <p className="text-xs mt-1" style={{ color: 'var(--tx-3)' }}>{sublabel}</p>
            </div>
            <div className="space-y-2">
              {byAxis(axis).map(chapter => (
                <Link
                  key={chapter.id}
                  href={`/chapters/${encodeURIComponent(chapter.id)}`}
                  className="block rounded-lg p-3 border transition-colors group"
                  style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm" style={{ color: 'var(--tx-1)' }}>{chapter.id}</div>
                      <div className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--tx-2)' }}>{chapter.oneLiner}</div>
                    </div>
                    {songCounts[chapter.id] !== undefined && (
                      <span className="text-xs shrink-0 mt-0.5" style={{ color: 'var(--tx-3)' }}>
                        {songCounts[chapter.id]}曲
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
