import { SheetDataStore, TabId, PlayerLevelRecord, SharedLevelRecord } from '../types';
import { initialStore } from '../data/seedData';
import { GOOGLE_SHEET_CONFIG } from '../config';

const LOCAL_STORAGE_DATA_KEY = 'gd_tracker_data_v3';

export const getStoredData = (): SheetDataStore => {
  try {
    if (typeof localStorage === 'undefined') return initialStore;
    const raw = localStorage.getItem(LOCAL_STORAGE_DATA_KEY);
    if (!raw) return initialStore;
    const parsed = JSON.parse(raw);
    return {
      ashritLevels: parsed.ashritLevels || initialStore.ashritLevels,
      arshLevels: parsed.arshLevels || initialStore.arshLevels,
      sharedLevels: parsed.sharedLevels || initialStore.sharedLevels,
    };
  } catch (e) {
    console.error('Failed to load local storage data', e);
    return initialStore;
  }
};

export const saveStoredData = (data: SheetDataStore): void => {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(LOCAL_STORAGE_DATA_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to local storage', e);
  }
};

export const hasActiveSheetIntegration = (): boolean => {
  return Boolean(GOOGLE_SHEET_CONFIG.sheetId);
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const convertDateToGDFormat = (dateStr: string): string => {
  if (!dateStr || dateStr.trim() === '' || dateStr.toLowerCase() === 'unknown') return dateStr;
  if (/^[A-Za-z]{3}\s+\d+(st|nd|rd|th)\s*-\s*\d{4}$/.test(dateStr.trim())) return dateStr.trim();
  const mdyMatch = dateStr.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdyMatch) {
    const month = parseInt(mdyMatch[1], 10) - 1;
    const day = parseInt(mdyMatch[2], 10);
    const year = parseInt(mdyMatch[3], 10);
    const s = ['th', 'st', 'nd', 'rd'];
    const v = day % 100;
    const ordinal = day + (s[(v - 20) % 10] || s[v] || s[0]);
    return `${MONTH_NAMES[month]} ${ordinal} - ${year}`;
  }
  return dateStr;
};

/**
 * Parses Google Visualization (gviz) JSON response string
 */
const parseGvizResponse = (text: string) => {
  const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
  return JSON.parse(jsonString);
};

/**
 * Extracts raw cells from a Google Visualization API response object
 */
const extractGvizRows = (json: any): any[][] => {
  const rows = json?.table?.rows || [];
  return rows.map((r: any) =>
    (r.c || []).map((cell: any) => {
      if (!cell) return '';
      // Prefer formatted value 'f' (e.g. "128272104" or "07/02/2026"), fallback to 'v'
      if (cell.f !== undefined && cell.f !== null) return cell.f;
      return cell.v !== undefined && cell.v !== null ? cell.v : '';
    })
  );
};

/**
 * Fetches sheet data via JSONP in browser to bypass CORS restrictions completely
 */
const fetchSheetViaJsonp = (sheetId: string, gid: string): Promise<any[][]> => {
  return new Promise((resolve, reject) => {
    // If not in a browser environment (Node / test runner / SSR), fallback to standard fetch
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}&headers=1`;
      fetch(url)
        .then((r) => r.text())
        .then((text) => {
          const json = parseGvizResponse(text);
          resolve(extractGvizRows(json));
        })
        .catch(reject);
      return;
    }

    const callbackName = 'gviz_cb_' + Math.random().toString(36).substring(2) + '_' + Date.now();
    const script = document.createElement('script');

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error(`Timeout fetching tab GID ${gid}`));
    }, 12000);

    const cleanup = () => {
      clearTimeout(timeout);
      try {
        delete (window as any)[callbackName];
      } catch {
        (window as any)[callbackName] = undefined;
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    (window as any)[callbackName] = (response: any) => {
      cleanup();
      if (!response || !response.table) {
        reject(new Error('Invalid response structure from Google Sheet'));
        return;
      }
      resolve(extractGvizRows(response));
    };

    script.onerror = () => {
      cleanup();
      reject(new Error(`Failed to load Google Sheet tab script for GID ${gid}`));
    };

    script.src = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=responseHandler:${callbackName}&gid=${gid}&headers=1`;
    document.head.appendChild(script);
  });
};

/**
 * Merges and preserves custom user attachments (videoUrl, imageUrl, local modifications) across sheet refreshes
 */
const preserveCustomFields = <T extends { levelId: string; name: string; imageUrl?: string; videoUrl?: string }>(
  incoming: T[],
  existing: T[]
): T[] => {
  const mergedIncoming = incoming.map((item) => {
    const match = existing.find(
      (e) =>
        (e.levelId && item.levelId && e.levelId.trim() === item.levelId.trim()) ||
        e.name.toLowerCase() === item.name.toLowerCase()
    );
    if (match) {
      return {
        ...item,
        imageUrl: item.imageUrl || match.imageUrl,
        videoUrl: item.videoUrl || match.videoUrl,
      };
    }
    return item;
  });

  // Preserve any locally created levels that aren't present in the incoming sheet
  const localOnly = existing.filter(
    (e) =>
      !incoming.some(
        (inc) =>
          (inc.levelId && e.levelId && inc.levelId.trim() === e.levelId.trim()) ||
          inc.name.toLowerCase() === e.name.toLowerCase()
      )
  );

  return [...mergedIncoming, ...localOnly];
};

/**
 * Pulls all 3 tabs directly from Google Sheets
 */
export const pullFromGoogleSheet = async (throwOnError = false): Promise<SheetDataStore> => {
  const { sheetId, tabs } = GOOGLE_SHEET_CONFIG;
  if (!sheetId) return getStoredData();

  try {
    const [ashritRaw, arshRaw, sharedRaw] = await Promise.all([
      fetchSheetViaJsonp(sheetId, tabs.ashritGid),
      fetchSheetViaJsonp(sheetId, tabs.arshGid),
      fetchSheetViaJsonp(sheetId, tabs.sharedGid),
    ]);

    const parsePlayerRows = (rows: any[][], prefix: string): PlayerLevelRecord[] => {
      if (!rows || rows.length === 0) return [];
      return rows
        .map((r, i) => {
          const ratingRaw = (r[0] || 'Easy Demon').toString().trim();
          const name = (r[1] || '').toString().trim();

          // Guard against header rows or empty rows
          if (!name || name.toLowerCase() === 'name' || ratingRaw.toLowerCase() === 'demon rating') {
            return null;
          }

          const isHardest = r[6] === true || r[6] === 'TRUE' || r[6] === 'true' || r[6] === 1;

          return {
            id: `${prefix}-${i + 1}`,
            demonRating: ratingRaw as any,
            name,
            levelId: (r[2] || '').toString().trim(),
            attempts: r[3] !== undefined && r[3] !== null ? r[3].toString().trim() : '',
            date: convertDateToGDFormat((r[4] || '').toString().trim()),
            thoughts: (r[5] || '').toString().trim(),
            currentHardest: isHardest,
          };
        })
        .filter((l): l is PlayerLevelRecord => Boolean(l));
    };

    const parseSharedRows = (rows: any[][]): SharedLevelRecord[] => {
      if (!rows || rows.length === 0) return [];
      return rows
        .map((r, i) => {
          const ratingRaw = (r[0] || 'Medium Demon').toString().trim();
          const name = (r[1] || '').toString().trim();

          // Guard against header rows or empty rows
          if (!name || name.toLowerCase() === 'name' || ratingRaw.toLowerCase() === 'rating') {
            return null;
          }

          const ashritStatus = ((r[5] || 'not done').toString().toLowerCase().trim()) as any;
          const arshStatus = ((r[6] || 'not done').toString().toLowerCase().trim()) as any;

          return {
            id: `shared-${i + 1}`,
            rating: ratingRaw as any,
            name,
            levelId: (r[2] || '').toString().trim(),
            levelInfo: (r[3] || 'W Speed').toString().trim(),
            thoughts: (r[4] || '').toString().trim(),
            ashritStatus,
            arshStatus,
          };
        })
        .filter((l): l is SharedLevelRecord => Boolean(l));
    };

    const currentLocal = getStoredData();

    const freshAshrit = ashritRaw.length ? parsePlayerRows(ashritRaw, 'ash') : currentLocal.ashritLevels;
    const freshArsh = arshRaw.length ? parsePlayerRows(arshRaw, 'arsh') : currentLocal.arshLevels;
    const freshShared = sharedRaw.length ? parseSharedRows(sharedRaw) : currentLocal.sharedLevels;

    const finalStore: SheetDataStore = {
      ashritLevels: preserveCustomFields(freshAshrit, currentLocal.ashritLevels),
      arshLevels: preserveCustomFields(freshArsh, currentLocal.arshLevels),
      sharedLevels: preserveCustomFields(freshShared, currentLocal.sharedLevels),
    };

    saveStoredData(finalStore);
    return finalStore;
  } catch (err) {
    console.warn('Error fetching live data from Google Sheet, using local cache:', err);
    if (throwOnError) throw err;
    return getStoredData();
  }
};

/**
 * Pushes a single updated or new row to Google Apps Script (if available)
 */
export const pushRowToGoogleSheet = async (
  tab: TabId,
  action: 'updateRow' | 'addRow',
  row: PlayerLevelRecord | SharedLevelRecord
): Promise<boolean> => {
  const { appsScriptUrl } = GOOGLE_SHEET_CONFIG;
  if (!appsScriptUrl || !appsScriptUrl.trim()) return false;

  try {
    await fetch(appsScriptUrl.trim(), {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, tab, row }),
    });
    return true;
  } catch (e) {
    console.warn('Sync push notice (saved locally in browser):', e);
    return false;
  }
};
