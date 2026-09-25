import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { ShowcaseView } from './components/ShowcaseView';
import { StatsDashboard } from './components/StatsDashboard';
import {
  TabId,
  ViewMode,
  SheetDataStore,
  PlayerLevelRecord,
  SharedLevelRecord,
} from './types';
import {
  getStoredData,
  saveStoredData,
  pullFromGoogleSheet,
  pushRowToGoogleSheet,
  hasActiveSheetIntegration,
} from './services/sheetSyncService';
import { isFirebaseConfigured } from './services/firebase';
import {
  subscribeToLevelList,
  saveLevelToFirestore,
  deleteLevelFromFirestore,
} from './services/firestoreService';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [dataStore, setDataStore] = useState<SheetDataStore>(getStoredData);
  const [activeTab, setActiveTab] = useState<TabId>('ashrit');
  const [viewMode, setViewMode] = useState<ViewMode>('showcase');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [firebaseActive] = useState<boolean>(isFirebaseConfigured());
  const [syncToast, setSyncToast] = useState<{
    type: 'success' | 'error' | 'syncing';
    message: string;
  } | null>(null);

  // Real-time Firestore Subscriptions
  useEffect(() => {
    if (!firebaseActive) return;

    const unsubs: Array<() => void> = [];

    // Subscribe to Ashrit's levels
    const unsubAshrit = subscribeToLevelList('ashrit', (cloudLevels) => {
      if (cloudLevels && cloudLevels.length > 0) {
        setDataStore((prev) => ({ ...prev, ashritLevels: cloudLevels as PlayerLevelRecord[] }));
      }
    });
    if (unsubAshrit) unsubs.push(unsubAshrit);

    // Subscribe to Arsh's levels
    const unsubArsh = subscribeToLevelList('arsh', (cloudLevels) => {
      if (cloudLevels && cloudLevels.length > 0) {
        setDataStore((prev) => ({ ...prev, arshLevels: cloudLevels as PlayerLevelRecord[] }));
      }
    });
    if (unsubArsh) unsubs.push(unsubArsh);

    // Subscribe to Shared / Wishlist levels
    const unsubShared = subscribeToLevelList('shared', (cloudLevels) => {
      if (cloudLevels && cloudLevels.length > 0) {
        setDataStore((prev) => ({ ...prev, sharedLevels: cloudLevels as SharedLevelRecord[] }));
      }
    });
    if (unsubShared) unsubs.push(unsubShared);

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [firebaseActive]);

  // Save to localStorage whenever dataStore changes (offline cache)
  useEffect(() => {
    saveStoredData(dataStore);
  }, [dataStore]);

  // Pull from Google Sheets automatically if configured and Firebase not yet active
  useEffect(() => {
    if (hasActiveSheetIntegration() && !firebaseActive) {
      handlePullFromSheet(false);
    }
  }, [firebaseActive]);

  const handlePullFromSheet = useCallback(async (isManual = true) => {
    if (!hasActiveSheetIntegration()) return;
    setIsSyncing(true);
    if (isManual) {
      setSyncToast({
        type: 'syncing',
        message: 'Pulling latest demons from Google Sheets...',
      });
    }
    try {
      const freshData = await pullFromGoogleSheet(true);
      setDataStore(freshData);
      if (isManual) {
        setSyncToast({
          type: 'success',
          message: `Synced with Google Sheets (${freshData.ashritLevels.length} Ashrit, ${freshData.arshLevels.length} Arsh, ${freshData.sharedLevels.length} Wishlist)`,
        });
        setTimeout(() => setSyncToast(null), 3500);
      }
    } catch (err) {
      console.warn('Sync notice:', err);
      if (isManual) {
        setSyncToast({
          type: 'error',
          message: 'Could not fetch live sheet, loaded local copy',
        });
        setTimeout(() => setSyncToast(null), 3500);
      }
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Player level update (Ashrit or Arsh)
  const handleUpdatePlayerLevel = (tab: 'ashrit' | 'arsh', updated: PlayerLevelRecord) => {
    setDataStore((prev) => {
      const listKey = tab === 'ashrit' ? 'ashritLevels' : 'arshLevels';
      let currentList = prev[listKey];

      // If marking as current hardest, ensure other levels in this tab have currentHardest set to false
      if (updated.currentHardest) {
        currentList = currentList.map((item) =>
          item.id === updated.id ? updated : { ...item, currentHardest: false }
        );
      } else {
        currentList = currentList.map((item) => (item.id === updated.id ? updated : item));
      }

      return {
        ...prev,
        [listKey]: currentList,
      };
    });

    if (firebaseActive) {
      saveLevelToFirestore(tab, updated);
    }
    pushRowToGoogleSheet(tab, 'updateRow', updated);
  };

  const handleAddPlayerLevel = (tab: 'ashrit' | 'arsh', newLevel: PlayerLevelRecord) => {
    const listKey = tab === 'ashrit' ? 'ashritLevels' : 'arshLevels';
    const currentList = dataStore[listKey];
    const maxOrder = currentList.reduce((max, l) => Math.max(max, l.order || 0), currentList.length);
    const levelWithOrder: PlayerLevelRecord = {
      ...newLevel,
      order: newLevel.order ?? (maxOrder + 1),
    };

    setDataStore((prev) => ({
      ...prev,
      [listKey]: [...prev[listKey], levelWithOrder],
    }));

    if (firebaseActive) {
      saveLevelToFirestore(tab, levelWithOrder);
    }
    pushRowToGoogleSheet(tab, 'addRow', levelWithOrder);
  };

  const handleDeletePlayerLevel = (tab: 'ashrit' | 'arsh', id: string) => {
    setDataStore((prev) => {
      const listKey = tab === 'ashrit' ? 'ashritLevels' : 'arshLevels';
      return {
        ...prev,
        [listKey]: prev[listKey].filter((l) => l.id !== id),
      };
    });

    if (firebaseActive) {
      deleteLevelFromFirestore(tab, id);
    }
  };

  // Shared levels update
  const handleUpdateSharedLevel = (updated: SharedLevelRecord) => {
    setDataStore((prev) => ({
      ...prev,
      sharedLevels: prev.sharedLevels.map((l) => (l.id === updated.id ? updated : l)),
    }));

    if (firebaseActive) {
      saveLevelToFirestore('shared', updated);
    }
    pushRowToGoogleSheet('shared', 'updateRow', updated);
  };

  const handleAddSharedLevel = (newLevel: SharedLevelRecord) => {
    const maxOrder = dataStore.sharedLevels.reduce((max, l) => Math.max(max, l.order || 0), dataStore.sharedLevels.length);
    const levelWithOrder: SharedLevelRecord = {
      ...newLevel,
      order: newLevel.order ?? (maxOrder + 1),
    };

    setDataStore((prev) => ({
      ...prev,
      sharedLevels: [...prev.sharedLevels, levelWithOrder],
    }));

    if (firebaseActive) {
      saveLevelToFirestore('shared', levelWithOrder);
    }
    pushRowToGoogleSheet('shared', 'addRow', levelWithOrder);
  };

  const handleDeleteSharedLevel = (id: string) => {
    setDataStore((prev) => ({
      ...prev,
      sharedLevels: prev.sharedLevels.filter((l) => l.id !== id),
    }));

    if (firebaseActive) {
      deleteLevelFromFirestore('shared', id);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0e15] text-gray-100 flex flex-col font-['Inter'] selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Sheet Tabs - only shown in Showcase mode */}
      {viewMode === 'showcase' && (
        <TabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          ashritCount={dataStore.ashritLevels.length}
          arshCount={dataStore.arshLevels.length}
          sharedCount={dataStore.sharedLevels.length}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {viewMode === 'showcase' && (
          <ShowcaseView
            activeTab={activeTab}
            ashritLevels={dataStore.ashritLevels}
            arshLevels={dataStore.arshLevels}
            sharedLevels={dataStore.sharedLevels}
            onUpdatePlayerLevel={handleUpdatePlayerLevel}
            onAddPlayerLevel={handleAddPlayerLevel}
            onDeletePlayerLevel={handleDeletePlayerLevel}
            onUpdateSharedLevel={handleUpdateSharedLevel}
            onAddSharedLevel={handleAddSharedLevel}
            onDeleteSharedLevel={handleDeleteSharedLevel}
          />
        )}

        {viewMode === 'stats' && (
          <StatsDashboard
            ashritLevels={dataStore.ashritLevels}
            arshLevels={dataStore.arshLevels}
            sharedLevels={dataStore.sharedLevels}
            onNavigateToTab={(tab) => {
              setActiveTab(tab);
              setViewMode('showcase');
            }}
          />
        )}
      </main>


      {/* Sync Status Toast */}
      {syncToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border shadow-2xl backdrop-blur-md text-xs font-semibold ${
              syncToast.type === 'success'
                ? 'bg-[#132a1f]/95 border-emerald-500/40 text-emerald-200 shadow-emerald-950/50'
                : syncToast.type === 'error'
                ? 'bg-[#2a1315]/95 border-rose-500/40 text-rose-200 shadow-rose-950/50'
                : 'bg-[#181c2e]/95 border-indigo-500/40 text-indigo-200 shadow-indigo-950/50'
            }`}
          >
            {syncToast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {syncToast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {syncToast.type === 'syncing' && <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />}
            <span>{syncToast.message}</span>
          </div>
        </div>
      )}

      {/* End of content */}
    </div>
  );
};

export default App;
