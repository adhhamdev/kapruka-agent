export type SavedInfoCategory =
  | 'people'
  | 'addresses'
  | 'preferences'
  | 'language'
  | 'other';

export interface SavedInfoItem {
  id: string;
  text: string;
  category: SavedInfoCategory;
}

export interface SavedInfoSnapshot {
  enabled: boolean;
  available: boolean;
  people: SavedInfoItem[];
  addresses: SavedInfoItem[];
  preferences: SavedInfoItem[];
  language: SavedInfoItem[];
  other: SavedInfoItem[];
}

export const EMPTY_SAVED_INFO_SNAPSHOT: SavedInfoSnapshot = {
  enabled: false,
  available: false,
  people: [],
  addresses: [],
  preferences: [],
  language: [],
  other: [],
};
