import type { Personality } from '../../types/apostle';
import { getPersonalityIconPath } from '../../utils/apostleImages';

interface PersonalityIconProps {
  personality: Personality;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * 성격 아이콘 컴포넌트
 * 성격에 따른 아이콘 이미지를 표시합니다
 */
const PersonalityIcon = ({ personality, size = 'md', className = '' }: PersonalityIconProps) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <img
      src={getPersonalityIconPath(personality)}
      alt={personality}
      className={`${sizeMap[size]} object-contain ${className}`}
      title={personality}
    />
  );
};

export default PersonalityIcon;
