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

export function getPersonalityIconPath(personality: Personality): string {
  return `/src/assets/icon/Common_UnitPersonality_${personality}.png`;
}

export function getSynergyOnIconPath(personality: Personality): string {
  return `/src/assets/icon/Synergy_Icon_${personality}_On.png`;
}

export function getSynergyOffIconPath(personality: Personality): string {
  return `/src/assets/icon/Synergy_Icon_${personality}_Off.png`;
}
