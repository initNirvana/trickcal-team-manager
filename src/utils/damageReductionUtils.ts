import type { Apostle } from '../types/apostle';

export function calculateDamageReduction(apostles: Apostle[]): number {
  if (apostles.length === 0) return 0;

  let total = 0;
  apostles.forEach((apostle) => {
    let reduction = 0;

    switch (apostle.role) {
      case '탱커':
        reduction = 25;
        break;
      case '서포터':
        reduction = 15;
        break;
      case '딜러':
        reduction = 5;
        break;
    }

    if (apostle.method === '물리') {
      reduction += 5;
    }

    total += Math.min(reduction, 75);
  });

  return Math.round((total / apostles.length) * 100) / 100;
}

export function getDamageReductionGrade(value: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (value >= 60) return 'A';
  if (value >= 45) return 'B';
  if (value >= 30) return 'C';
  if (value >= 20) return 'D';
  return 'F';
}

export function getRemainingForNextGrade(current: number): number {
  if (current >= 60) return 0;
  if (current >= 45) return Math.ceil((60 - current) * 10) / 10;
  if (current >= 30) return Math.ceil((45 - current) * 10) / 10;
  if (current >= 20) return Math.ceil((30 - current) * 10) / 10;
  return Math.ceil((20 - current) * 10) / 10;
}

export function getGradeDescription(grade: 'A' | 'B' | 'C' | 'D' | 'F'): string {
  switch (grade) {
    case 'A':
      return '탁월 - 60% 이상';
    case 'B':
      return '좋음 - 45~59%';
    case 'C':
      return '보통 - 30~44%';
    case 'D':
      return '부족 - 20~29%';
    case 'F':
      return '낮음 - 20% 미만';
  }
}