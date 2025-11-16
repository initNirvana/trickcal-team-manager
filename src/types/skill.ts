export interface ApostleSkill {
  // 고유 식별자
  id: string;
  apostleId: string;
  
  // 스킬 정보
  name: string;
  description: string;
  
  // 스킬 레벨 (저/고)
  level: 'low' | 'high';  // ← 문자열로 변경!
  
  // 스킬 효과
  effect: {
    damageReduction?: number;
    defenseBonus?: number;
    hpBonus?: number;
    healing?: number;
    critChance?: number;
  };
  
  // 어사이드 효과
  asideEffect?: {
    tier2?: {
      damageReduction?: number;
      defenseBonus?: number;
      hpBonus?: number;
    };
    tier3?: {
      damageReduction?: number;
      defenseBonus?: number;
      hpBonus?: number;
    };
  };
  
  type?: 'attack' | 'defense' | 'buff' | 'debuff' | 'support';
}