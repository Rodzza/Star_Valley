import type { ReactElement } from 'react';
/** Ícones desenhados em grade 12x12, um caractere por pixel. Arte própria, sem sprites de terceiros. */
export type IconName =
  | 'house' | 'sprout' | 'gift' | 'chest' | 'scroll' | 'calendar'
  | 'heart' | 'cloud' | 'lock' | 'coin' | 'note'
  | 'cat' | 'chick' | 'tree' | 'person' | 'pot' | 'hammer' | 'star';

const COLORS: Record<string, string> = {
  k: '#3a1d0c', w: '#8b4a1e', W: '#c9893f', r: '#e0574a', R: '#b53a35',
  g: '#6fcf4f', G: '#2f7a2a', y: '#f6b92b', Y: '#b9801a', c: '#fff1d6',
  b: '#5aa9e6', s: '#aab0b8', o: '#f29a3a', p: '#f4c08f',
};

const GRIDS: Record<IconName, string[]> = {
  house: [
    '............', '.....kk.....', '....kRRk....', '...kRRRRk...', '..kRRRRRRk..', '.kRRRRRRRRk.',
    'kkkkkkkkkkkk', '.kcccccccck.', '.kcyycwwcck.', '.kcyycwwcck.', '.kccccwwcck.', '.kkkkkkkkkk.',
  ],
  sprout: [
    '............', '..gg....gg..', '.gGGg..gGGg.', '.gGGggggGGg.', '..gggGGggg..', '....gGGg....',
    '.....GG.....', '.....GG.....', '.....GG.....', '..wwwwwwww..', '.wwwwwwwwww.', '..kkkkkkkk..',
  ],
  gift: [
    '............', '...rr..rr...', '..r..rr..r..', '...rrrrrr...', 'kkkkkkkkkkkk', 'kRRRRyyRRRRk',
    'kRRRRyyRRRRk', 'kkkkkyykkkkk', 'kRRRRyyRRRRk', 'kRRRRyyRRRRk', 'kRRRRyyRRRRk', 'kkkkkkkkkkkk',
  ],
  chest: [
    '............', '..kkkkkkkk..', '.kwWWWWWWwk.', 'kwWWWWWWWWwk', 'kkkkkkkkkkkk', 'kWwwwyywwwWk',
    'kwwwwyywwwwk', 'kyyyyyyyyyyk', 'kwwwwyywwwwk', 'kwwwwwwwwwwk', 'kwwwwwwwwwwk', 'kkkkkkkkkkkk',
  ],
  scroll: [
    '............', '.kkkkkkkkkk.', 'kccccrrcccck', 'kccccrrcccck', 'kccccrrcccck', 'kccccrrcccck',
    'kcccccccccck', 'kccccrrcccck', 'kccccrrcccck', 'kcccccccccck', '.kkkkkkkkkk.', '............',
  ],
  calendar: [
    '............', '.kkkkkkkkkk.', 'kRRRRRRRRRRk', 'kRRRRRRRRRRk', 'kkkkkkkkkkkk', 'kcccccccccck',
    'kcwwcwwcwwck', 'kcwwcwwcwwck', 'kcccccccccck', 'kcwwcwwcyyck', 'kcwwcwwcyyck', 'kkkkkkkkkkkk',
  ],
  heart: [
    '............', '..kkk..kkk..', '.kRRRkkRRRk.', 'kRRrRRRRRRRk', 'kRRrRRRRRRRk', 'kRRRRRRRRRRk',
    '.kRRRRRRRRk.', '..kRRRRRRk..', '...kRRRRk...', '....kRRk....', '.....kk.....', '............',
  ],
  cloud: [
    '............', '............', '....kkkk....', '...kccccck..', '.kkkcccccckk', 'kcccccccccck',
    'kcccccccccck', '.kkkkkkkkkk.', '............', '............', '............', '............',
  ],
  lock: [
    '............', '....kkkk....', '...ks..sk...', '...ks..sk...', '..kkkkkkkk..', '.kyyyyyyyyk.',
    '.kyyyyyyyyk.', '.kyyykkyyyk.', '.kyyyykyyyk.', '.kyyyyyyyyk.', '..kkkkkkkk..', '............',
  ],
  coin: [
    '............', '....kkkk....', '..kkyyyykk..', '.kyWWyyyyYk.', '.kyWyyyyyYk.', 'kyyyyyyyyyYk',
    'kyyyyyyyyyYk', 'kyyyyyyyyyYk', 'kyyyyyyyyyYk', '.kyyyyyyyYk.', '..kkYYYYkk..', '............',
  ],
  note: [
    '............', '.kkkkkkkkkk.', 'kcccccccccck', 'kcwwwwwwwwck', 'kcccccccccck', 'kcwwwwwwccck',
    'kcccccccccck', 'kcwwwwwwwwck', 'kcccccccccck', 'kcwwwwccccck', '.kkkkkkkkkk.', '............',
  ],
  cat: [
    '............', '.kk......kk.', '.kok....kok.', '.kookkkkook.', '.kooooooook.', '.kokooookok.', '.kooooooook.', '.kooorrooook', '.kooooooook.', '..koooooook.', '...kkkkkk...', '............',
  ],
  chick: [
    '............', '....kkkk....', '..kkyyyykk..', '.kyyyyyyyyk.', '.kyykyyykyyk', '.kyyyyyyyyyk', 'kyyyyoooyyyk', 'kyyyyyyyyyyk', '.kyyyyyyyyk.', '..kkyyyykk..', '....kkkk....', '............',
  ],
  tree: [
    '............', '....kkkk....', '..kkggggkk..', '.kggggGgggk.', '.kgggggggGk.', 'kgGgggggggGk', 'kggggGgggggk', '.kgggggggGk.', '..kkggggkk..', '....kwwk....', '....kwwk....', '...kkwwkk...',
  ],
  person: [
    '............', '...kkkkkk...', '..kyyyyyyk..', '.kkkkkkkkkk.', '..kppppppk..', '..kpkppkpk..', '..kppppppk..', '..kpprrppk..', '...kppppk...', '..kbbbbbbk..', '.kbbbbbbbbk.', '.kkkkkkkkkk.',
  ],
  pot: [
    '............', '....s..s....', '...s..s.....', '..kkkkkkkk..', 'kkkRRRRRRkkk', 'kssssssssssk', 'kssssssssssk', 'kssssssssssk', '.kssssssssk.', '..kkkkkkkk..', '............', '............',
  ],
  hammer: [
    '............', '..kkkkkkkk..', '.kssssssssk.', '.kssssssssk.', '..kkkwwkkk..', '....kwwk....', '....kwwk....', '....kwwk....', '....kwwk....', '....kwwk....', '....kwwk....', '....kkkk....',
  ],
  star: [
    '............', '.....kk.....', '....kyyk....', '...kyyyyk...', 'kkkkyyyykkkk', 'kyyyyyyyyyyk', '.kyyyyyyyyk.', '..kyyyyyyk..', '..kyyyyyyk..', '.kyyykkyyyk.', '.kyyk..kyyk.', '..kk....kk..',
  ],
};

export const ICON_GRIDS = GRIDS;

export function PixelIcon({ name, size = 32 }: { name: IconName; size?: number }) {
  const rects: ReactElement[] = [];
  GRIDS[name].forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x] as string;
      if (ch === '.') {
        x++;
        continue;
      }
      let end = x;
      while (end + 1 < row.length && row[end + 1] === ch) end++;
      rects.push(<rect key={`${y}-${x}`} x={x} y={y} width={end - x + 1} height={1} fill={COLORS[ch]} />);
      x = end + 1;
    }
  });
  return (
    <svg
      className="pixel-icon"
      viewBox="0 0 12 12"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {rects}
    </svg>
  );
}
