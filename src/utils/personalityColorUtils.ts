import type { Personality } from "../types/apostle";

export function getPersonalityBackgroundClass(
  personality: Personality
): string {
  switch (personality) {
    case "활발":
      return "bg-yellow-300";
    case "광기":
      return "bg-red-500";
    case "순수":
      return "bg-green-500";
    case "우울":
      return "bg-purple-500";
    case "냉정":
      return "bg-blue-500";
    default:
      return "bg-gray-800 ";
  }
}

export function getPersonalityIconPath(personality: Personality): string {
  return `/src/assets/personalities/${personality}.png`;
}
