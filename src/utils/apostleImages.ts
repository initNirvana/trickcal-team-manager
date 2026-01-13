import type { Personality } from '@/types/apostle';

const assetPathMap = import.meta.glob<string>(
  [
    '/src/assets/apostles/*.{png,webp}', // 사도 이미지
    '/src/assets/asideicons/*.{png,webp}', // 사도 어사이드 이미지
    '/src/assets/icon/*.{png,webp}', // 아이콘 이미지
    '/src/assets/artifacts/*.{png,webp}', // 아티팩트 이미지
    '/src/assets/spells/*.{png,webp}', // 스펠 이미지
    '/src/assets/icon/Common_UnitPersonality_*.png', // 성격 아이콘
    '/src/assets/icon/Synergy_Icon_*_On.png', // 시너지 ON 아이콘
    '/src/assets/icon/Synergy_Icon_*_Off.png', // 시너지 OFF 아이콘
    '/src/assets/icon/*star.webp', // 랭크 아이콘
    '/src/assets/icon/Common_Position*.png', // 위치 아이콘
    '/src/assets/icon/Common_UnitClass*.png', // 클래스 아이콘
    '/src/assets/networkicon/*.{png,webp}', // 네트워크 아이콘
  ],
  { eager: true, import: 'default' },
) as Record<string, string>;

export const placeholderImagePath = getAssetPath('/src/assets/apostles/placeholder.webp');

function getAssetPath(originalPath: string): string {
  const path = assetPathMap[originalPath];

  if (!path) {
    console.warn(`Asset not found in map for key: ${originalPath}`);
    return placeholderImagePath;
  }

  return path;
}

export function getApostleImagePath(engName: string): string {
  if (!engName) return placeholderImagePath;

  const pngKey = `/src/assets/apostles/${engName}.png`;
  const webpKey = `/src/assets/apostles/${engName}.webp`;

  if (assetPathMap[pngKey]) {
    return getAssetPath(pngKey);
  }
  if (assetPathMap[webpKey]) {
    return getAssetPath(webpKey);
  }

  return placeholderImagePath;
}

export function getAsideIconPath(engName: string): string {
  if (!engName) return placeholderImagePath;

  const pngKey = `/src/assets/asideicons/AsideIcon_${engName}.png`;
  const webpKey = `/src/assets/asideicons/AsideIcon_${engName}.webp`;

  if (assetPathMap[pngKey]) {
    return getAssetPath(pngKey);
  }
  if (assetPathMap[webpKey]) {
    return getAssetPath(webpKey);
  }

  return placeholderImagePath;
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

export function getPositionIconPath(iconName: string): string {
  const originalPath = `/src/assets/icon/${iconName}.png`;
  return getAssetPath(originalPath);
}

export function getClassIconPath(iconName: string): string {
  const originalPath = `/src/assets/icon/Common_UnitClass_${iconName}.png`;
  return getAssetPath(originalPath);
}

export function getIconPath(iconName: string): string {
  const originalPath = `/src/assets/icon/${iconName}.png`;
  return getAssetPath(originalPath);
}

export function getNetworkIconPath(): string {
  return '/src/assets/networkicon/NetworkIcon_Elena.png';
}
