import { Apostle } from '@/types/apostle';
import {
  getApostleImagePath,
  getAsideIconPath,
  getPositionIconPath,
  getClassIconPath,
} from '@/utils/apostleImages';
import { getPersonalityBackground } from '@/utils/apostleUtils';

interface ApostleSelectorItemProps {
  apostle: Apostle;
  isPlaced: boolean;
  onClick: (apostle: Apostle) => void;
}

export const ApostleSelectorItem = ({ apostle, isPlaced, onClick }: ApostleSelectorItemProps) => {
  return (
    <div
      onClick={() => onClick(apostle)}
      className={`rounded-box group relative aspect-square cursor-pointer border-2 transition-all ${getPersonalityBackground(apostle.persona)} ${isPlaced ? 'opacity-50' : ''}`}
    >
      <img
        src={getAsideIconPath(apostle)}
        alt={apostle.name}
        loading="lazy"
        title={apostle.aside.importance?.toString()}
        className="absolute top-0 right-0 h-10 w-10 animate-bounce"
      />

      {/* 위치 아이콘 */}
      <div className="absolute bottom-5 left-0.5 h-6 w-6 rounded-full">
        <img
          src={getPositionIconPath(apostle)}
          className="h-full w-full object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      {/* 클래스 아이콘 */}
      <div className="absolute bottom-11 left-0.5 h-6 w-6 rounded-full">
        <img
          src={getClassIconPath(apostle.role.main)}
          className="h-full w-full object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
      <img
        src={getApostleImagePath(apostle)}
        className={`rounded-xl transition-all ${isPlaced ? 'grayscale-[0.5]' : 'group-hover:border-primary'}`}
        alt={apostle.name}
      />

      <div className="absolute right-0 bottom-0 left-0 bg-black/60 px-1 text-center">
        <p className="text-[10px] font-bold text-white sm:text-sm">{apostle.name}</p>
      </div>

      {isPlaced && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="badge badge-xs badge-neutral opacity-80">배치됨</div>
        </div>
      )}
    </div>
  );
};

ApostleSelectorItem.displayName = 'ApostleSelectorItem';
