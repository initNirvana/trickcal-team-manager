import { Apostle } from '@/types/apostle';
import {
  getApostleImagePath,
  getPersonalityIconPath,
  getPositionIconPath,
} from '@/utils/apostleImages';
import { getPersonalityBackground } from '@/utils/apostleUtils';

interface SuggestionCardProps {
  apostle: Apostle;
  type: 'HEALER' | 'PVP';
  reason?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

const SuggestionCard = ({ apostle, type, isSelected = false, onClick }: SuggestionCardProps) => {
  return (
    <div
      onClick={onClick}
      className={`group bg-base-100 relative h-30 w-full cursor-pointer overflow-hidden rounded-lg border-2 shadow-sm transition hover:shadow-md ${type === 'PVP' ? (isSelected ? 'border-red-500 ring-2 ring-red-400' : 'border-red-200 hover:border-red-400') : isSelected ? 'border-primary ring-primary ring-2' : 'border-base-200 hover:border-primary'} `}
    >
      {/* 사도 이미지 */}
      <img
        src={getApostleImagePath(apostle)}
        className={
          'inline-flex h-full w-full items-center object-cover ' +
          getPersonalityBackground(apostle.persona)
        }
        alt={apostle.name}
        loading="lazy"
      />

      {/* [HEALER] 힐러 아이콘 배지 (우상단) - 선택사항 */}
      {type === 'HEALER' && (
        <div className="absolute top-1 right-1 z-10 rounded-full bg-white/20 p-0.5 backdrop-blur-sm">
          {/* 필요시 힐 아이콘 추가 */}
        </div>
      )}

      {/* 포지션 아이콘 (좌하단) */}
      <div className="absolute bottom-6 left-1 h-6 w-6 drop-shadow-md">
        <img
          src={getPositionIconPath(apostle)}
          className="h-full w-full object-contain"
          onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
          alt="Position"
        />
      </div>

      {/* 성격 아이콘 (우상단) */}
      <div className="absolute top-1 right-1 h-6 w-6 drop-shadow-md">
        <img
          src={getPersonalityIconPath(apostle.persona)}
          className="h-full w-full object-contain"
          onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
          alt="Personality"
        />
      </div>

      {/* 사도 이름 (하단) */}
      <div className="absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/90 to-transparent p-1 pt-4 text-center">
        <p className="truncate text-xs font-bold text-white">{apostle.name}</p>
      </div>
    </div>
  );
};

export default SuggestionCard;
