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
const assetPathMap = import.meta.glob<string>(
  [
    '/src/assets/apostles/*.{png,webp}', // 사도 이미지
    '/src/assets/placeholder.webp', // 플레이스홀더
    '/src/assets/icon/Common_UnitPersonality_*.png', // 성격 아이콘
    '/src/assets/icon/Synergy_Icon_*_On.png', // 시너지 ON 아이콘
    '/src/assets/icon/Synergy_Icon_*_Off.png', // 시너지 OFF 아이콘
    '/src/assets/icon/*star.webp', // 랭크 아이콘
  ],
  { eager: true, import: 'default' },
) as Record<string, string>;

function getAssetPath(originalPath: string): string {
  const path = assetPathMap[originalPath];

  if (!path) {
    console.warn(`Asset not found in map for key: ${originalPath}`);
    return assetPathMap['/src/assets/placeholder.webp'] || originalPath;
  }

  return path;
}

export function getApostleImagePath(engName: string): string {
  if (!engName) return getAssetPath('/src/assets/placeholder.webp');

  const pngKey = `/src/assets/apostles/${engName}.png`;
  const webpKey = `/src/assets/apostles/${engName}.webp`;

  if (assetPathMap[pngKey]) {
    return getAssetPath(pngKey);
  }
  if (assetPathMap[webpKey]) {
    return getAssetPath(webpKey);
  }

  return getAssetPath('/src/assets/placeholder.webp');
}

export function getPersonalityIconPath(personality: Personality): string {
  const originalPath = `/src/assets/icon/Common_UnitPersonality_${personality}.png`;
  return getAssetPath(originalPath);
}

export function getSynergyOnIconPath(personality: Personality): string {
  const originalPath = `/src/assets/icon/Synergy_Icon_${personality}_On.png`;
  return getAssetPath(originalPath);
}

export function getSynergyOffIconPath(personality: Personality): string {
  const originalPath = `/src/assets/icon/Synergy_Icon_${personality}_Off.png`;
  return getAssetPath(originalPath);
}

export function getRankIconPath(rank: number): string {
  const originalPath = `/src/assets/icon/${rank}star.webp`;
  return getAssetPath(originalPath);
}

export const getPositionIconPath = (iconName: string) => {
  return `/src/assets/icon/${iconName}.png`;
};
