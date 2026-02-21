import { CardBase, CardOption } from './card';

export type ArtifactOption = CardOption;

export interface Artifact extends CardBase {}

export interface ArtifactsData {
  artifacts: Artifact[];
}
