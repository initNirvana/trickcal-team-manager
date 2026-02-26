export type CardType = 'artifact' | 'spell';

export type CardGrade = '일반' | '고급' | '희귀' | '전설';
export type GradeFilter = CardGrade | '모두';

export interface CardOption {
  type: string;
  value: number;
}

export interface CardBase {
  id: number;
  level: number;
  grade: CardGrade;
  name: string;
  coin?: number;
  options?: CardOption[];
  effectDescription?: string;
}

export interface CardItem extends Omit<CardBase, 'id' | 'level' | 'coin'> {
  id: string | number;
  typeId: string;
  coin: number;
}
