// Color palette for rhyme groups — dark theme
export const RHYME_COLORS = [
  { bg: 'bg-rose-950/70',    border: 'border-rose-700',    text: 'text-rose-300',    dot: 'bg-rose-400'    },
  { bg: 'bg-amber-950/70',   border: 'border-amber-700',   text: 'text-amber-300',   dot: 'bg-amber-400'   },
  { bg: 'bg-lime-950/70',    border: 'border-lime-700',    text: 'text-lime-300',    dot: 'bg-lime-500'    },
  { bg: 'bg-cyan-950/70',    border: 'border-cyan-700',    text: 'text-cyan-300',    dot: 'bg-cyan-500'    },
  { bg: 'bg-violet-950/70',  border: 'border-violet-700',  text: 'text-violet-300',  dot: 'bg-violet-400'  },
  { bg: 'bg-pink-950/70',    border: 'border-pink-700',    text: 'text-pink-300',    dot: 'bg-pink-400'    },
  { bg: 'bg-orange-950/70',  border: 'border-orange-700',  text: 'text-orange-300',  dot: 'bg-orange-400'  },
  { bg: 'bg-teal-950/70',    border: 'border-teal-700',    text: 'text-teal-300',    dot: 'bg-teal-500'    },
  { bg: 'bg-indigo-950/70',  border: 'border-indigo-700',  text: 'text-indigo-300',  dot: 'bg-indigo-400'  },
  { bg: 'bg-yellow-950/70',  border: 'border-yellow-700',  text: 'text-yellow-300',  dot: 'bg-yellow-500'  },
  { bg: 'bg-emerald-950/70', border: 'border-emerald-700', text: 'text-emerald-300', dot: 'bg-emerald-500' },
  { bg: 'bg-fuchsia-950/70', border: 'border-fuchsia-700', text: 'text-fuchsia-300', dot: 'bg-fuchsia-400' },
];

export function getColorForGroup(groupIndex: number) {
  return RHYME_COLORS[groupIndex % RHYME_COLORS.length];
}

export const AXIS_COLORS = {
  blue:   { bg: 'bg-blue-950/50',   border: 'border-blue-800',   badge: 'bg-blue-900/80 text-blue-300 border-blue-700'   },
  green:  { bg: 'bg-green-950/50',  border: 'border-green-800',  badge: 'bg-green-900/80 text-green-300 border-green-700'  },
  yellow: { bg: 'bg-amber-950/50',  border: 'border-amber-800',  badge: 'bg-amber-900/80 text-amber-300 border-amber-800'  },
};
