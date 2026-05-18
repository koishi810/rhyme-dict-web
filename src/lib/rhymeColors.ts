// Color palette for rhyme groups — up to 12 distinct groups
export const RHYME_COLORS = [
  { bg: 'bg-rose-100',    border: 'border-rose-400',    text: 'text-rose-800',    dot: 'bg-rose-400'    },
  { bg: 'bg-amber-100',   border: 'border-amber-400',   text: 'text-amber-800',   dot: 'bg-amber-400'   },
  { bg: 'bg-lime-100',    border: 'border-lime-500',    text: 'text-lime-800',    dot: 'bg-lime-500'    },
  { bg: 'bg-cyan-100',    border: 'border-cyan-500',    text: 'text-cyan-800',    dot: 'bg-cyan-500'    },
  { bg: 'bg-violet-100',  border: 'border-violet-400',  text: 'text-violet-800',  dot: 'bg-violet-400'  },
  { bg: 'bg-pink-100',    border: 'border-pink-400',    text: 'text-pink-800',    dot: 'bg-pink-400'    },
  { bg: 'bg-orange-100',  border: 'border-orange-400',  text: 'text-orange-800',  dot: 'bg-orange-400'  },
  { bg: 'bg-teal-100',    border: 'border-teal-500',    text: 'text-teal-800',    dot: 'bg-teal-500'    },
  { bg: 'bg-indigo-100',  border: 'border-indigo-400',  text: 'text-indigo-800',  dot: 'bg-indigo-400'  },
  { bg: 'bg-yellow-100',  border: 'border-yellow-500',  text: 'text-yellow-800',  dot: 'bg-yellow-500'  },
  { bg: 'bg-emerald-100', border: 'border-emerald-500', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  { bg: 'bg-fuchsia-100', border: 'border-fuchsia-400', text: 'text-fuchsia-800', dot: 'bg-fuchsia-400' },
];

export function getColorForGroup(groupIndex: number) {
  return RHYME_COLORS[groupIndex % RHYME_COLORS.length];
}

export const AXIS_COLORS = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-300',   badge: 'bg-blue-100 text-blue-800 border-blue-300'   },
  green:  { bg: 'bg-green-50',  border: 'border-green-300',  badge: 'bg-green-100 text-green-800 border-green-300'  },
  yellow: { bg: 'bg-amber-50',  border: 'border-amber-300',  badge: 'bg-amber-100 text-amber-800 border-amber-300'  },
};
