import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { getFirestoreDb } from './firebase';
import { PlayerLevelRecord, SharedLevelRecord, TabId, SheetDataStore } from '../types';

export const COLLECTIONS = {
  ashrit: 'ashrit_demons',
  arsh: 'arsh_demons',
  shared: 'wishlist_demons',
} as const;

/**
 * Subscribe to real-time updates for a specific demon list
 */
export const subscribeToLevelList = (
  tab: TabId,
  onUpdate: (levels: any[]) => void,
  onError?: (error: Error) => void
): Unsubscribe | null => {
  const db = getFirestoreDb();
  if (!db) return null;

  const colRef = collection(db, COLLECTIONS[tab]);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const records: any[] = [];
      snapshot.forEach((docSnap) => {
        records.push({
          id: docSnap.id,
          ...docSnap.data(),
        });
      });

      // Ensure demons remain in exact intended order
      records.sort((a, b) => {
        if (typeof a.order === 'number' && typeof b.order === 'number') {
          return a.order - b.order;
        }
        const numA = parseInt((a.id || '').match(/\d+/)?.[0] || '0', 10);
        const numB = parseInt((b.id || '').match(/\d+/)?.[0] || '0', 10);
        return numA - numB;
      });

      onUpdate(records);
    },
    (err) => {
      console.error(`Firestore snapshot error for ${tab}:`, err);
      if (onError) onError(err);
    }
  );
};

/**
 * Save or update a level record in Firestore
 */
export const saveLevelToFirestore = async (
  tab: TabId,
  record: PlayerLevelRecord | SharedLevelRecord
): Promise<boolean> => {
  const db = getFirestoreDb();
  if (!db) return false;

  try {
    const colName = COLLECTIONS[tab];
    // Use existing record ID or create a clean sanitized ID
    const docId = record.id || `${tab}_${Date.now()}`;
    const docRef = doc(db, colName, docId);

    // Filter out undefined values to satisfy Firestore
    const dataToSave: Record<string, any> = {};
    for (const [key, value] of Object.entries(record)) {
      if (value !== undefined) {
        dataToSave[key] = value;
      }
    }

    await setDoc(docRef, dataToSave, { merge: true });
    return true;
  } catch (err) {
    console.error(`Failed to save record to Firestore [${tab}]:`, err);
    return false;
  }
};

/**
 * Delete a level record from Firestore
 */
export const deleteLevelFromFirestore = async (
  tab: TabId,
  id: string
): Promise<boolean> => {
  const db = getFirestoreDb();
  if (!db) return false;

  try {
    const colName = COLLECTIONS[tab];
    const docRef = doc(db, colName, id);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error(`Failed to delete record from Firestore [${tab}]:`, err);
    return false;
  }
};

/**
 * Migrate all local / Google Sheet cached levels into Firestore
 */
export const syncLocalDataToFirestore = async (
  store: SheetDataStore
): Promise<{ success: boolean; count: number }> => {
  const db = getFirestoreDb();
  if (!db) return { success: false, count: 0 };

  try {
    let totalSynced = 0;
    const batch = writeBatch(db);

    // Ashrit levels
    store.ashritLevels.forEach((level) => {
      const docRef = doc(db, COLLECTIONS.ashrit, level.id || `ash_${Date.now()}_${Math.random()}`);
      const cleanData = Object.fromEntries(Object.entries(level).filter(([_, v]) => v !== undefined));
      batch.set(docRef, cleanData, { merge: true });
      totalSynced++;
    });

    // Arsh levels
    store.arshLevels.forEach((level) => {
      const docRef = doc(db, COLLECTIONS.arsh, level.id || `arsh_${Date.now()}_${Math.random()}`);
      const cleanData = Object.fromEntries(Object.entries(level).filter(([_, v]) => v !== undefined));
      batch.set(docRef, cleanData, { merge: true });
      totalSynced++;
    });

    // Shared levels
    store.sharedLevels.forEach((level) => {
      const docRef = doc(db, COLLECTIONS.shared, level.id || `shared_${Date.now()}_${Math.random()}`);
      const cleanData = Object.fromEntries(Object.entries(level).filter(([_, v]) => v !== undefined));
      batch.set(docRef, cleanData, { merge: true });
      totalSynced++;
    });

    await batch.commit();
    return { success: true, count: totalSynced };
  } catch (err) {
    console.error('Failed to sync local data to Firestore:', err);
    return { success: false, count: 0 };
  }
};

/**
 * Check if Firestore has existing data
 */
export const hasFirestoreData = async (): Promise<boolean> => {
  const db = getFirestoreDb();
  if (!db) return false;

  try {
    const ashritSnap = await getDocs(collection(db, COLLECTIONS.ashrit));
    return !ashritSnap.empty;
  } catch {
    return false;
  }
};
