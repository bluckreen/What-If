export type GameId = 'button' | 'chair' | 'mouse' | 'checkbox' | 'car';

export interface GameInfo {
  id: GameId;
  name: string;
  shortName: string;
  icon: string;
  tagline: string;
  description: string;
  themeColor: string;
}

export interface OverthinkingRound {
  round: number; // 1 to 4
  name: string;
  subtitle: string;
  thoughts: string[];
  selectedThought?: string;
  stageNarrative?: string;
}

export interface OverthinkingSession {
  situation: string;
  rounds: OverthinkingRound[];
  finalThoughts: string[];
  chosenFinalThought?: string;
  awardedGame?: GameId;
}

export interface GameEnding {
  id: string;
  title: string;
  badge: string;
  quote: string;
  stats?: Record<string, string | number>;
  flavorText: string;
}
