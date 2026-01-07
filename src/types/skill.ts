export interface Skill {
  apostleId: string;
  name: string;
  level: 'low' | 'high';
  description: string;
  effectRange: string;
  damage: Array<{
    level: number;
    Increase: number;
    Reduction: number;
  }>;
}

export interface SkillsData {
  skills: Skill[];
}
