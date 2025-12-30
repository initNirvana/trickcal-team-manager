import { useMemo } from 'react';
import type { Apostle, Personality, Position } from '@/types/apostle';
import { getApostleImagePath } from '@/utils/apostleImages';
import { getPersonalityBackground } from '@/utils/apostleUtils';

interface PresetDeckGridProps {
  deck: Apostle[];
  deckSize: 6 | 9;
  personality: string;
}

const getLayoutByPosition = (deck: Apostle[], maxPerLine: number) => {
  const layout: Record<Position, Apostle[]> = { front: [], mid: [], back: [] };

  const sortedDeck = [...deck].sort((a, b) => {
    if (a.positionPriority && !b.positionPriority) return 1;
    if (!a.positionPriority && b.positionPriority) return -1;
    return 0;
  });

  sortedDeck.forEach((apostle) => {
    const preferredPositions =
      apostle.positionPriority ||
      (Array.isArray(apostle.position) ? apostle.position : [apostle.position]);

    for (const pos of preferredPositions) {
      if (layout[pos as Position].length < maxPerLine) {
        layout[pos as Position].push(apostle);
        break;
      }
    }
  });

  return layout;
};

const Slot = ({ apostle, personality }: { apostle: Apostle | null; personality: Personality }) => (
  <div
    className={`rounded-box aspect-square border-2 transition-all ${
      !apostle
        ? 'border-base-300 bg-base-100 border-dashed'
        : `group relative overflow-hidden shadow-sm hover:shadow-md ${getPersonalityBackground(personality)}`
    }`}
  >
    {apostle && (
      <>
        <img
          src={getApostleImagePath(apostle.engName)}
          alt={apostle.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute right-0 bottom-0 left-0 bg-black/60 px-2 py-1 text-center">
          <p className="text-[12px] font-bold text-white sm:text-sm">{apostle.name}</p>
        </div>
      </>
    )}
  </div>
);

const Column = ({
  title,
  items,
  colorClass,
  personality,
}: {
  title: string;
  items: (Apostle | null)[];
  colorClass: string;
  personality: Personality;
}) => (
  <div className="flex flex-col gap-0.5">
    <div className={`${colorClass} rounded-t-lg py-0.5 text-center text-xs font-bold sm:text-sm`}>
      {title}
    </div>
    <div className="flex flex-col gap-0.5">
      {items.map((item, idx) => (
        <Slot key={`${title}-${item?.id || idx}`} apostle={item} personality={personality} />
      ))}
    </div>
  </div>
);

const PresetDeckGrid = ({ deck, deckSize, personality }: PresetDeckGridProps) => {
  const maxPerLine = deckSize === 9 ? 3 : 2;

  const { frontLine, midLine, backLine } = useMemo(() => {
    const layout = getLayoutByPosition(deck, maxPerLine);

    const fill = (line: Apostle[]) => [...line, ...Array(maxPerLine - line.length).fill(null)];

    return {
      frontLine: fill(layout.front),
      midLine: fill(layout.mid),
      backLine: fill(layout.back),
    };
  }, [deck, maxPerLine]);

  return (
    <div className="grid w-full max-w-sm grid-cols-3 gap-2">
      <Column
        title="후열"
        items={backLine}
        colorClass="bg-primary text-primary-content"
        personality={personality as Personality}
      />
      <Column
        title="중열"
        items={midLine}
        colorClass="bg-success text-success-content"
        personality={personality as Personality}
      />
      <Column
        title="전열"
        items={frontLine}
        colorClass="bg-error text-error-content"
        personality={personality as Personality}
      />
    </div>
  );
};

export default PresetDeckGrid;
