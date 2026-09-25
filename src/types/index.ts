export type DemonRating =
  | 'Easy Demon'
  | 'Medium Demon'
  | 'Hard Demon'
  | 'Insane Demon'
  | 'Extreme Demon'
  | 'Impossible'
  | 'Easy'
  | 'Normal'
  | 'Hard'
  | 'Harder'
  | 'Insane'
  | 'Auto'
  | 'NA'
  | (string & {});

export type CompletionStatus = 'not done' | 'attempted' | 'done';

export interface PlayerLevelRecord {
  id: string; // unique local row identifier
  demonRating: DemonRating;
  name: string;
  levelId: string;
  attempts: string | number;
  date: string;
  thoughts: string;
  currentHardest: boolean;
  order?: number;
  videoUrl?: string;
  imageUrl?: string;
}

export interface SharedLevelRecord {
  id: string; // unique local row identifier
  rating: DemonRating;
  name: string;
  levelId: string;
  levelInfo: string;
  thoughts: string;
  ashritStatus: CompletionStatus;
  arshStatus: CompletionStatus;
  order?: number;
  videoUrl?: string;
  imageUrl?: string;
}

export type TabId = 'ashrit' | 'arsh' | 'shared';
export type ViewMode = 'spreadsheet' | 'showcase' | 'stats';

export interface SheetDataStore {
  ashritLevels: PlayerLevelRecord[];
  arshLevels: PlayerLevelRecord[];
  sharedLevels: SharedLevelRecord[];
}

export interface SyncConfig {
  webAppUrl: string;
  autoSync: boolean;
  lastSynced: string | null;
}
