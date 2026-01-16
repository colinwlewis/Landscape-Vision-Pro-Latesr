
import { get, set, del } from 'idb-keyval';
import { SavedDesign, AutoSaveState } from '../types';

const STORAGE_KEY = 'landscape-vision-designs';
const DRAFT_KEY = 'landscape-vision-autosave';

export const getSavedDesigns = async (): Promise<SavedDesign[]> => {
  try {
    const stored = await get<SavedDesign[]>(STORAGE_KEY);
    return stored || [];
  } catch (e) {
    console.error("Failed to load designs", e);
    return [];
  }
};

export const saveDesign = async (design: SavedDesign): Promise<boolean> => {
  try {
    const current = await getSavedDesigns();
    const existingIndex = current.findIndex(d => d.id === design.id);
    
    let updated;
    if (existingIndex > -1) {
      // Update existing
      updated = [...current];
      updated[existingIndex] = design;
    } else {
      // Add to beginning of list
      updated = [design, ...current];
    }
    
    await set(STORAGE_KEY, updated);
    return true;
  } catch (e) {
    console.error("Failed to save design", e);
    return false;
  }
};

export const deleteDesign = async (id: string): Promise<SavedDesign[]> => {
  try {
    const current = await getSavedDesigns();
    const updated = current.filter(d => d.id !== id);
    await set(STORAGE_KEY, updated);
    return updated;
  } catch (e) {
    console.error("Failed to delete design", e);
    return [];
  }
};

// Auto-save / Draft functions
export const saveDraft = async (state: AutoSaveState): Promise<void> => {
  try {
    await set(DRAFT_KEY, state);
  } catch (e) {
    console.error("Failed to save draft", e);
  }
};

export const getDraft = async (): Promise<AutoSaveState | undefined> => {
  try {
    return await get<AutoSaveState>(DRAFT_KEY);
  } catch (e) {
    console.error("Failed to load draft", e);
    return undefined;
  }
};

export const clearDraft = async (): Promise<void> => {
  try {
    await del(DRAFT_KEY);
  } catch (e) {
    console.error("Failed to clear draft", e);
  }
};
