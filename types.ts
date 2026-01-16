
export interface GenerationResult {
  originalImage: string | null;
  generatedImage: string | null;
  prompt: string;
}

export interface DesignIteration {
  id: string;
  prompt: string;
  image: string;
  timestamp: number;
}

export interface UserLead {
  name: string;
  email: string;
  phone?: string;
  propertyAddress?: string;
  timestamp: number;
}

export interface SavedDesign {
  id: string;
  timestamp: number;
  originalImage: string;
  generatedImage: string;
  prompt: string;
  iterations?: DesignIteration[];
  userId?: string; // Reference to the lead
}

export interface AutoSaveState {
  timestamp: number;
  prompt: string;
  imagePreview: string | null;
  generatedImage: string | null;
  pastIterations: DesignIteration[];
  originalImageRef: string | null;
  appState: AppState;
  user?: UserLead | null;
}

export interface LandscapingSuggestion {
  category: string;
  item: string;
  description: string;
}

export interface LandscapePreset {
  id: string;
  title: string;
  description: string;
  prompt: string;
  image: string;
  tag?: string;
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
