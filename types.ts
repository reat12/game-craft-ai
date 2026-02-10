export interface TileType {
  name: string;
  effect: string;
  color: string; // Hex code or Tailwind color class name
}

export interface CardType {
  type: string;
  description: string;
  examples: string[];
}

export interface GameDesign {
  title: string;
  overview: string;
  goal: string;
  story: string;
  boardDesign: string;
  tileTypes: TileType[];
  components: string[];
  cardTypes: CardType[];
  rules: string[];
  gameplay: string[];
  winningCondition: string;
  reward: string;
  learningOutcomes: string[];
  sources?: { title: string; uri: string }[];
}

export interface GenerationState {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}
