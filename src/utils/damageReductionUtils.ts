import type { Apostle } from '../types/apostle';

export function calculateDamageReduction(apostles: Apostle[]): number {
  if (apostles.length === 0) return 0;

  let total = 0;
  apostles.forEach((apostle) => {
    let reduction = 0;

    total += Math.min(reduction, 75);
  });

  return Math.round((total / apostles.length) * 100) / 100;
}
