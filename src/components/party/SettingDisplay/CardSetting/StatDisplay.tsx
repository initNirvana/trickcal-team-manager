import { Activity } from 'react';
import type { CardItem } from '@/types/card';
import { getIconPath } from '@/utils/apostleImages';

const STAT_ICONS: Record<string, string> = {
  physicalAttack: 'Icon_AttackPhysic',
  magicAttack: 'Icon_AttackMagic',
  criticalRate: 'Icon_CriticalRate',
  criticalDamage: 'Icon_CriticalMult',
  hp: 'Icon_Hp',
  physicalDefense: 'Icon_DefensePhysic',
  magicDefense: 'Icon_DefenseMagic',
  attackSpeed: 'Icon_AttackSpeed',
  healing: 'Icon_Healing',
  recoveryHp: 'Icon_RecoveryHp',
  criticalResist: 'Icon_CriticalResist',
  criticalDamageResist: 'Icon_CriticalMultResist',
};

const STAT_LABELS: Record<string, string> = {
  physicalAttack: '물리 공격력',
  magicAttack: '마법 공격력',
  criticalRate: '치명타',
  criticalDamage: '치명 피해',
  hp: '최대 체력',
  physicalDefense: '물리 방어력',
  magicDefense: '마법 방어력',
  attackSpeed: '공격 속도',
  healing: '주는 회복량',
  recoveryHp: '받는 회복량',
  criticalResist: '치명타 저항',
  criticalDamageResist: '치명 피해 저항',
};

interface StatDisplayProps {
  item: CardItem;
}

/**
 * 카드 스탯 정보 표시 컴포넌트
 */
export const StatDisplay = ({ item }: StatDisplayProps) => {
  return (
    <>
      <Activity mode={item.options?.length ? 'visible' : 'hidden'}>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {item.options?.map((opt) => (
            <div key={opt.type} className="flex items-center gap-1 font-bold text-gray-800 text-sm">
              {STAT_ICONS[opt.type] && (
                <img
                  src={getIconPath(STAT_ICONS[opt.type])}
                  alt={opt.type}
                  loading="lazy"
                  className="w-4 h-4 object-contain"
                />
              )}
              <span>{STAT_LABELS[opt.type] || opt.type}</span>
              <span className="text-gray-800">+{opt.value}%</span>
            </div>
          ))}
        </div>
      </Activity>
      <Activity mode={!item.options?.length ? 'visible' : 'hidden'}>
        <span className="text-gray-600 font-normal text-sm block h-5 truncate">
          {item.effectDescription || '효과 없음'}
        </span>
      </Activity>
    </>
  );
};
