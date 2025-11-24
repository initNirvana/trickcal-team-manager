export interface Artifact {
  id: string;
  name: string;
  tier: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  effectDescription: string;
  effectValues: Record<string, number | string>;
}
