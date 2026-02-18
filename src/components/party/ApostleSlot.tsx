import type { Apostle } from '@/types/apostle';
import { getApostleImagePath } from '@/utils/apostleImages';
import { getPersonalityBackground } from '@/utils/apostleUtils';
import Image from '../common/Image';

interface ApostleSlotProps {
  apostle?: Apostle;
  onSelect?: () => void;
}
const ApostleSlot = ({ apostle, onSelect }: ApostleSlotProps) => {
  if (apostle) {
    const primaryPersonality = apostle.persona;

    return (
      <div
        onClick={onSelect}
        className={`${getPersonalityBackground(
          primaryPersonality,
        )} group relative flex h-30 cursor-pointer flex-col overflow-hidden rounded-md text-white transition hover:opacity-50`}
      >
        <div className="flex flex-1 flex-col items-center justify-center">
          <Image
            src={getApostleImagePath(apostle)}
            alt={apostle.name}
            className="h-auto max-h-20 w-auto rounded-md object-cover"
          />
        </div>
        <div className="absolute right-0 bottom-0 left-0 bg-black/60 px-2 py-1 text-center">
          <p className="text-[12px] font-bold text-white">{apostle.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className="flex h-30 cursor-pointer items-center justify-center rounded-md border-2 border-black bg-white text-center transition hover:bg-gray-50"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onSelect) onSelect();
      }}
    >
      <p className="mt-1 text-xs">
        사도를 배치하려면 <br /> 클릭하세요
      </p>
    </div>
  );
};

export default ApostleSlot;
