import { getPersonalityKoreanName } from '@/utils/apostleUtils';
import { Personality } from '@/types/apostle';

interface PersonalityDropdownProps {
  personalities: Personality[];
  selectedPersonalities: Set<Personality>;
  onToggle: (personality: Personality | null) => void;
}

export const PersonalityDropdown = ({
  personalities,
  selectedPersonalities,
  onToggle,
}: PersonalityDropdownProps) => {
  // details tag handles open state natively

  // 버튼 텍스트 계산
  const getButtonText = () => {
    const count = selectedPersonalities.size;
    if (count === 0) return '전체';
    if (count === 1) return getPersonalityKoreanName(Array.from(selectedPersonalities)[0]);
    return `${getPersonalityKoreanName(Array.from(selectedPersonalities)[0])} (+${count - 1})`;
  };

  const handleAllClick = () => {
    onToggle(null);
  };

  return (
    <details className="dropdown dropdown-end">
      <summary className="btn m-1">{getButtonText()}</summary>
      <ul className="menu dropdown-content rounded-box bg-base-100 z-[1] w-52 p-2 shadow">
        {/* 전체 선택 옵션 */}
        <li>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={selectedPersonalities.size === 0}
              onChange={handleAllClick}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">전체</span>
          </label>
        </li>
        {personalities.map((personality) => (
          <li key={personality}>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={selectedPersonalities.has(personality)}
                onChange={() => onToggle(personality)}
                className="checkbox checkbox-sm"
              />
              <span className="text-sm">{getPersonalityKoreanName(personality)}</span>
            </label>
          </li>
        ))}
      </ul>
    </details>
  );
};

export default PersonalityDropdown;
