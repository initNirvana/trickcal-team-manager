import type { Personality } from '../types/apostle';

export function getPersonalityBackgroundClass(personality: Personality): string {
  switch (personality) {
    case 'Jolly':
      return 'bg-yellow-300';
    case 'Mad':
      return 'bg-red-500';
    case 'Naive':
      return 'bg-lime-500';
    case 'Gloomy':
      return 'bg-purple-500';
    case 'Cool':
      return 'bg-cyan-300';
    default:
      return 'bg-slate-100 ';
  }
}

const apostleImages = import.meta.glob('/src/assets/apostles/*.{png,webp}', {
  eager: true,
  import: 'default',
});

export function getApostleImagePath(engName: string): string {
  if (!engName) return '/src/assets/placeholder.webp';

  const pngPath = `/src/assets/apostles/${engName}.png`;
  const webpPath = `/src/assets/apostles/${engName}.webp`;

  if (apostleImages[pngPath]) {
    return apostleImages[pngPath] as string;
  }
  if (apostleImages[webpPath]) {
    return apostleImages[webpPath] as string;
  }
  return '/src/assets/placeholder.webp';
}

export function getPersonalityIconPath(personality: Personality): string {
  return `/src/assets/icon/Common_UnitPersonality_${personality}.png`;
}

export function getSynergyOnIconPath(personality: Personality): string {
  return `/src/assets/icon/Synergy_Icon_${personality}_On.png`;
}

export function getSynergyOffIconPath(personality: Personality): string {
  return `/src/assets/icon/Synergy_Icon_${personality}_Off.png`;
}
