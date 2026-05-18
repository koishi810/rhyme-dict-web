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
              <p className="text-xs text-gray-500 mt-1">{sublabel}</p>
            </div>
            <div className="space-y-2">
              {byAxis(axis).map(chapter => (
                <Link
                  key={chapter.id}
                  href={`/chapters/${encodeURIComponent(chapter.id)}`}
                  className={`block rounded-lg p-3 border bg-white/70 hover:bg-white transition-colors group border-gray-100 hover:border-gray-200 hover:shadow-sm`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-sm">{chapter.id}</div>
                      <div className="text-xs text-gray-500 mt-0.5 leading-snug">{chapter.oneLiner}</div>
                    </div>
                    {songCounts[chapter.id] !== undefined && (
                      <span className="text-xs text-gray-400 shrink-0 mt-0.5">
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
