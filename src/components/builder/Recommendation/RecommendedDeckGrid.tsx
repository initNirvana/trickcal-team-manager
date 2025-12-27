import { Apostle } from '@/types/apostle';
import { getApostleImagePath } from '@/utils/apostleImages';
import { getPersonalityBackgroundClass } from '@/types/apostle';

interface RecommendedDeckGridProps {
  deck: Apostle[];
  deckSize: 6 | 9;
}

const RecommendedDeckGrid = ({ deck, deckSize }: RecommendedDeckGridProps) => {
  const backLine: Apostle[] = [];
  const midLine: Apostle[] = [];
  const frontLine: Apostle[] = [];
  const posPerLine = deckSize === 9 ? 3 : 2;

  deck.forEach((apostle, index) => {
    if (index < posPerLine) {
      frontLine.push(apostle);
    } else if (index < posPerLine * 2) {
      midLine.push(apostle);
    } else {
      backLine.push(apostle);
    }
  });

  const fillSlots = (line: (Apostle | null)[]) => {
    const slots: (Apostle | null)[] = [...line];
    while (slots.length < posPerLine) {
      slots.push(null);
    }
    return slots;
  };

  const frontSlots = fillSlots(frontLine);
  const midSlots = fillSlots(midLine);
  const backSlots = fillSlots(backLine);

  const renderSlot = (apostle: Apostle | null) => {
    if (!apostle) {
      return (
        <div className="border-base-300 bg-base-100 aspect-square rounded-lg border-2 border-dashed" />
      );
    }

    return (
      <div className="group border-base-200 bg-base-100 hover:border-primary relative aspect-square overflow-hidden rounded-lg border-2 shadow-sm transition hover:shadow-md">
        {/* 사도 이미지 */}
        <img
          src={getApostleImagePath(apostle.engName)}
          className={`inline-flex h-full w-full items-center gap-1 rounded object-cover px-2 py-1 text-center text-xs ${getPersonalityBackgroundClass(apostle.persona)}`}
          alt={apostle.name}
        />

        {/* 사도 이름 오버레이 */}
        <div className="absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/80 to-transparent p-2 text-center">
          <p className="text-xs font-bold text-white">{apostle.name}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="grid max-w-sm grid-cols-3 gap-2">
      {/* 후열 컬럼 */}
      <div className="space-y-1">
        <div className="bg-primary text-primary-content rounded-t-lg px-3 py-2 text-center text-sm font-bold">
          후열
        </div>
        <div className="space-y-1">
          {backSlots.map((apostle, index) => (
            <div key={index}>{renderSlot(apostle)}</div>
          ))}
        </div>
      </div>

      {/* 중열 컬럼 */}
      <div className="space-y-1">
        <div className="bg-success text-success-content rounded-t-lg px-3 py-2 text-center text-sm font-bold">
          중열
        </div>
        <div className="space-y-1">
          {midSlots.map((apostle, index) => (
            <div key={index}>{renderSlot(apostle)}</div>
          ))}
        </div>
      </div>

      {/* 전열 컬럼 */}
      <div className="space-y-1">
        <div className="bg-error text-error-content rounded-t-lg px-3 py-2 text-center text-sm font-bold">
          전열
        </div>
        <div className="space-y-1">
          {frontSlots.map((apostle, index) => (
            <div key={index}>{renderSlot(apostle)}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendedDeckGrid;
