import { useState } from 'react';

interface PersonalityDropdownProps {
  personalities: string[];
  selectedPersonalities: Set<string>;
  onToggle: (personality: string) => void;
}

export const PersonalityDropdown = ({
  personalities,
  selectedPersonalities,
  onToggle,
}: PersonalityDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="btn transition">
        성격선택 {selectedPersonalities.size > 0 && `(${selectedPersonalities.size})`}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 z-50 mt-2 min-w-max rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {personalities.map((personality) => (
            <label
              key={personality}
              className="flex cursor-pointer items-center gap-3 border-b border-gray-200 px-4 py-2 last:border-b-0 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <input
                type="checkbox"
                checked={selectedPersonalities.has(personality)}
                onChange={() => onToggle(personality)}
                className="cursor-pointer"
              />
              <span className="text-sm text-gray-900 dark:text-white">{personality}</span>
            </label>
          ))}
        </div>
      )}

      {/* 배경 클릭으로 닫기 */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
};

export default PersonalityDropdown;
