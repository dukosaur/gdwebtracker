import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  TabId,
  PlayerLevelRecord,
  SharedLevelRecord,
  DemonRating,
  CompletionStatus,
} from '../types';
import { DifficultyBadge, RatingIcon } from './DifficultyBadge';
import {
  Search,
  Plus,
  Trash2,
  Image as ImageIcon,
  Copy,
  Check,
  Crown,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface SpreadsheetViewProps {
  activeTab: TabId;
  ashritLevels: PlayerLevelRecord[];
  arshLevels: PlayerLevelRecord[];
  sharedLevels: SharedLevelRecord[];
  onUpdatePlayerLevel: (tab: 'ashrit' | 'arsh', updated: PlayerLevelRecord) => void;
  onAddPlayerLevel: (tab: 'ashrit' | 'arsh', newLevel: PlayerLevelRecord) => void;
  onDeletePlayerLevel: (tab: 'ashrit' | 'arsh', id: string) => void;
  onUpdateSharedLevel: (updated: SharedLevelRecord) => void;
  onAddSharedLevel: (newLevel: SharedLevelRecord) => void;
  onDeleteSharedLevel: (id: string) => void;
  onOpenImageModal: (levelName: string, currentImage?: string, onSave?: (img: string) => void) => void;
}

const DEMON_ONLY_RATINGS: DemonRating[] = [
  'Easy Demon',
  'Medium Demon',
  'Hard Demon',
  'Insane Demon',
  'Extreme Demon',
];

const ALL_RATINGS: DemonRating[] = [
  'NA',
  'Auto',
  'Easy',
  'Normal',
  'Hard',
  'Harder',
  'Insane',
  'Easy Demon',
  'Medium Demon',
  'Hard Demon',
  'Insane Demon',
  'Extreme Demon',
  'Impossible',
];

const COMPLETION_STATUSES: CompletionStatus[] = ['not done', 'attempted', 'done'];

export const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({
  activeTab,
  ashritLevels,
  arshLevels,
  sharedLevels,
  onUpdatePlayerLevel,
  onAddPlayerLevel,
  onDeletePlayerLevel,
  onUpdateSharedLevel,
  onAddSharedLevel,
  onDeleteSharedLevel,
  onOpenImageModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Styling accents for header based on active tab
  const getHeaderTheme = () => {
    if (activeTab === 'ashrit') {
      return {
        bg: 'bg-[#252b48]',
        border: 'border-[#3b4371]',
        accent: 'text-indigo-300',
        title: 'ashrit',
      };
    }
    if (activeTab === 'arsh') {
      return {
        bg: 'bg-[#8c2621]',
        border: 'border-[#b7322b]',
        accent: 'text-red-200',
        title: 'mahmoud arsh im sorry',
      };
    }
    return {
      bg: 'bg-[#151620]',
      border: 'border-[#2d3045]',
      accent: 'text-amber-300',
      title: 'fun shit',
    };
  };

  const headerTheme = getHeaderTheme();

  const handleCopyId = (levelId: string) => {
    if (!levelId) return;
    navigator.clipboard.writeText(levelId);
    setCopiedId(levelId);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f43f5e', '#6366f1', '#10b981'],
      });
    } catch (e) {
      // safe fallback
    }
  };

  // Status badge styling helper for shared tab
  const renderStatusBadge = (status: CompletionStatus, onChange: (s: CompletionStatus) => void) => {
    let colorClasses = 'bg-[#374151] text-gray-300 border-[#4b5563]';
    if (status === 'done') {
      colorClasses = 'bg-[#1b4332] text-[#74c69d] border-[#2d6a4f]';
    } else if (status === 'attempted') {
      colorClasses = 'bg-[#1e3a8a] text-[#93c5fd] border-[#1d4ed8]';
    }

    return (
      <div className="relative inline-block">
        <select
          value={status}
          onChange={(e) => {
            const next = e.target.value as CompletionStatus;
            onChange(next);
            if (next === 'done') triggerCelebration();
          }}
          className={`appearance-none cursor-pointer text-xs font-bold px-3 py-1 rounded-full border ${colorClasses} focus:outline-none pr-6 text-center select-none shadow-sm transition-all`}
        >
          {COMPLETION_STATUSES.map((s) => (
            <option key={s} value={s} className="bg-[#1a1b26] text-white">
              {s}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3 h-3 absolute right-2 top-2 pointer-events-none opacity-60 text-current" />
      </div>
    );
  };

  // Add new row handlers
  const handleAddNewPlayerLevel = () => {
    const tab = activeTab as 'ashrit' | 'arsh';
    const newRecord: PlayerLevelRecord = {
      id: `${tab}-${Date.now()}`,
      demonRating: 'Easy Demon',
      name: 'New Demon Level',
      levelId: '',
      attempts: '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      thoughts: '',
      currentHardest: false,
    };
    onAddPlayerLevel(tab, newRecord);
  };

  const handleAddNewSharedLevel = () => {
    const newRecord: SharedLevelRecord = {
      id: `shared-${Date.now()}`,
      rating: 'Medium Demon',
      name: 'New Future Level',
      levelId: '',
      levelInfo: 'W Speed',
      thoughts: '',
      ashritStatus: 'not done',
      arshStatus: 'not done',
    };
    onAddSharedLevel(newRecord);
  };

  const sortLevels = <T extends { id: string; order?: number }>(list: T[]): T[] => {
    return [...list].sort((a, b) => {
      if (typeof a.order === 'number' && typeof b.order === 'number') {
        return a.order - b.order;
      }
      const numA = parseInt((a.id || '').match(/\d+/)?.[0] || '0', 10);
      const numB = parseInt((b.id || '').match(/\d+/)?.[0] || '0', 10);
      return numA - numB;
    });
  };

  // Filtering
  const isPlayerTab = activeTab === 'ashrit' || activeTab === 'arsh';
  const playerList = sortLevels(activeTab === 'ashrit' ? ashritLevels : arshLevels);
  const sortedSharedLevels = sortLevels(sharedLevels);

  const filteredPlayerLevels = playerList.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.levelId.toString().includes(searchTerm) ||
      l.thoughts.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === 'all' || l.demonRating === ratingFilter;
    return matchesSearch && matchesRating;
  });

  const filteredSharedLevels = sortedSharedLevels.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.levelId.toString().includes(searchTerm) ||
      l.levelInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.thoughts.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === 'all' || l.rating === ratingFilter;
    return matchesSearch && matchesRating;
  });

  return (
    <div className="w-full space-y-4">
      
      {/* Controls Bar: Search & Filter & Add */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#161723] p-3 rounded-2xl border border-[#26283b] shadow-md">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search level name, ID, or thoughts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0f1019] border border-[#282a3d] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-2.5 overflow-x-auto">
          {/* Rating filter dropdown */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#0f1019] border border-[#282a3d] text-xs text-gray-300 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Difficulties</option>
            {(isPlayerTab ? DEMON_ONLY_RATINGS : ALL_RATINGS).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {/* Add Row Button */}
          <button
            id="add-level-row-btn"
            onClick={isPlayerTab ? handleAddNewPlayerLevel : handleAddNewSharedLevel}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Level</span>
          </button>
        </div>

      </div>

      {/* Spreadsheet Table Container */}
      <div className="w-full overflow-x-auto rounded-2xl border border-[#282a3e] bg-[#12131d] shadow-2xl">
        <table className="w-full text-left border-collapse min-w-[980px]">
          
          {/* Table Header Row matching Google Sheet */}
          <thead>
            <tr className={`${headerTheme.bg} border-b ${headerTheme.border} text-white font-bold text-sm tracking-wide select-none`}>
              
              {/* Dropdown label badge matching screenshot */}
              <th className="py-3 px-4 w-[210px] min-w-[210px] border-r border-[#ffffff15]">
                <div className="flex items-center justify-between">
                  <span>{isPlayerTab ? 'Demon Rating' : 'Rating'}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>

              <th className="py-3 px-4 min-w-[170px] border-r border-[#ffffff15]">
                <div className="flex items-center justify-between">
                  <span>Name</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>

              <th className="py-3 px-4 w-[120px] border-r border-[#ffffff15]">
                <div className="flex items-center justify-between">
                  <span>ID</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>

              {isPlayerTab ? (
                <>
                  <th className="py-3 px-4 w-[110px] border-r border-[#ffffff15]">
                    <div className="flex items-center justify-between">
                      <span>Attempts</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                    </div>
                  </th>

                  <th className="py-3 px-4 w-[140px] border-r border-[#ffffff15]">
                    <div className="flex items-center justify-between">
                      <span>Date</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                    </div>
                  </th>

                  <th className="py-3 px-4 min-w-[260px] border-r border-[#ffffff15]">
                    <div className="flex items-center justify-between">
                      <span>thoughts after playing</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                    </div>
                  </th>

                  <th className="py-3 px-4 w-[140px] text-center border-r border-[#ffffff15]">
                    <div className="flex items-center justify-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-300" />
                      <span>current hardest</span>
                    </div>
                  </th>
                </>
              ) : (
                <>
                  <th className="py-3 px-4 min-w-[200px] border-r border-[#ffffff15]">
                    <div className="flex items-center justify-between">
                      <span>Level/Extra Info</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                    </div>
                  </th>

                  <th className="py-3 px-4 min-w-[260px] border-r border-[#ffffff15]">
                    <div className="flex items-center justify-between">
                      <span>thoughts after playing</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                    </div>
                  </th>

                  <th className="py-3 px-4 w-[130px] text-center border-r border-[#ffffff15]">
                    <div className="flex items-center justify-center gap-1">
                      <span>ashrit</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                    </div>
                  </th>

                  <th className="py-3 px-4 w-[130px] text-center border-r border-[#ffffff15]">
                    <div className="flex items-center justify-center gap-1">
                      <span>arsh</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                    </div>
                  </th>
                </>
              )}

              {/* Extra Column: Level Image & Actions */}
              <th className="py-3 px-3 w-[100px] text-center">
                <span>Extra</span>
              </th>

            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[#232536] text-xs">
            {isPlayerTab ? (
              filteredPlayerLevels.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    No levels match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPlayerLevels.map((row) => (
                  <tr
                    key={row.id}
                    className={`group hover:bg-[#181a27] transition-colors ${
                      row.currentHardest ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    {/* Demon Rating Selector (Demons Only) */}
                    <td className="py-2.5 px-4 w-[210px] min-w-[210px] border-r border-[#212333]">
                      <div className="relative">
                        <select
                          value={row.demonRating}
                          onChange={(e) =>
                            onUpdatePlayerLevel(activeTab as 'ashrit' | 'arsh', {
                              ...row,
                              demonRating: e.target.value as DemonRating,
                            })
                          }
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                        >
                          {DEMON_ONLY_RATINGS.map((r) => (
                            <option key={r} value={r} className="bg-[#1a1b26] text-white">
                              {r}
                            </option>
                          ))}
                        </select>
                        <div className="cursor-pointer flex items-center justify-between">
                          <DifficultyBadge rating={row.demonRating} size="sm" />
                          <ChevronDown className="w-3 h-3 text-gray-500 ml-1 group-hover:text-gray-300" />
                        </div>
                      </div>
                    </td>

                    {/* Level Name (Editable) */}
                    <td className="py-2.5 px-4 font-semibold text-gray-100 border-r border-[#212333]">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) =>
                          onUpdatePlayerLevel(activeTab as 'ashrit' | 'arsh', { ...row, name: e.target.value })
                        }
                        className="w-full bg-transparent border border-transparent hover:border-[#2f334a] focus:border-indigo-500 rounded px-1.5 py-1 text-xs text-white font-medium focus:bg-[#12131d] focus:outline-none transition-all"
                      />
                    </td>

                    {/* Level ID with copy button */}
                    <td className="py-2.5 px-4 border-r border-[#212333] font-mono text-gray-400">
                      <div className="flex items-center justify-between gap-1 group/id">
                        <input
                          type="text"
                          value={row.levelId}
                          placeholder="ID"
                          onChange={(e) =>
                            onUpdatePlayerLevel(activeTab as 'ashrit' | 'arsh', { ...row, levelId: e.target.value })
                          }
                          className="w-20 bg-transparent border border-transparent hover:border-[#2f334a] focus:border-indigo-500 rounded px-1.5 py-1 text-xs text-gray-300 font-mono focus:bg-[#12131d] focus:outline-none"
                        />
                        {row.levelId && (
                          <button
                            onClick={() => handleCopyId(row.levelId)}
                            className="p-1 rounded hover:bg-[#25283c] text-gray-500 hover:text-indigo-400 opacity-60 group-hover/id:opacity-100 transition-all"
                            title="Copy Level ID"
                          >
                            {copiedId === row.levelId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Attempts (Editable) */}
                    <td className="py-2.5 px-4 border-r border-[#212333]">
                      <input
                        type="text"
                        value={row.attempts}
                        placeholder="-"
                        onChange={(e) =>
                          onUpdatePlayerLevel(activeTab as 'ashrit' | 'arsh', { ...row, attempts: e.target.value })
                        }
                        className="w-full bg-transparent border border-transparent hover:border-[#2f334a] focus:border-indigo-500 rounded px-1.5 py-1 text-xs text-gray-200 font-mono focus:bg-[#12131d] focus:outline-none text-right"
                      />
                    </td>

                    {/* Date (Editable) */}
                    <td className="py-2.5 px-4 border-r border-[#212333] text-gray-400">
                      <input
                        type="text"
                        value={row.date}
                        placeholder="Unknown"
                        onChange={(e) =>
                          onUpdatePlayerLevel(activeTab as 'ashrit' | 'arsh', { ...row, date: e.target.value })
                        }
                        className="w-full bg-transparent border border-transparent hover:border-[#2f334a] focus:border-indigo-500 rounded px-1.5 py-1 text-xs text-gray-300 focus:bg-[#12131d] focus:outline-none"
                      />
                    </td>

                    {/* Thoughts after playing (Editable textarea / text) */}
                    <td className="py-2.5 px-4 border-r border-[#212333] text-gray-300">
                      <input
                        type="text"
                        value={row.thoughts}
                        placeholder="-"
                        onChange={(e) =>
                          onUpdatePlayerLevel(activeTab as 'ashrit' | 'arsh', { ...row, thoughts: e.target.value })
                        }
                        className="w-full bg-transparent border border-transparent hover:border-[#2f334a] focus:border-indigo-500 rounded px-1.5 py-1 text-xs text-gray-300 focus:bg-[#12131d] focus:outline-none"
                      />
                    </td>

                    {/* Current Hardest Checkbox */}
                    <td className="py-2.5 px-4 border-r border-[#212333] text-center">
                      <div className="flex items-center justify-center">
                        <label className="relative inline-flex items-center cursor-pointer p-1">
                          <input
                            type="checkbox"
                            checked={row.currentHardest}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              onUpdatePlayerLevel(activeTab as 'ashrit' | 'arsh', {
                                ...row,
                                currentHardest: checked,
                              });
                              if (checked) {
                                triggerCelebration();
                              }
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-5 h-5 rounded border border-[#3b3f5c] peer-checked:border-amber-400 peer-checked:bg-amber-400/20 flex items-center justify-center transition-all">
                            {row.currentHardest && (
                              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                            )}
                          </div>
                        </label>
                      </div>
                    </td>

                    {/* Extra / Actions: Image & Delete */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() =>
                            onOpenImageModal(row.name, row.imageUrl, (newImg) =>
                              onUpdatePlayerLevel(activeTab as 'ashrit' | 'arsh', { ...row, imageUrl: newImg })
                            )
                          }
                          className={`p-1.5 rounded-lg border transition-all ${
                            row.imageUrl
                              ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                              : 'hover:bg-[#25283c] border-transparent text-gray-400 hover:text-white'
                          }`}
                          title={row.imageUrl ? 'View / Change Level Image' : 'Attach Level Screenshot'}
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeletePlayerLevel(activeTab as 'ashrit' | 'arsh', row.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-gray-500 hover:text-rose-400 transition-colors"
                          title="Delete row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )
            ) : (
              /* Shared Tab ("fun googogoaaaagga") */
              filteredSharedLevels.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    No shared levels found.
                  </td>
                </tr>
              ) : (
                filteredSharedLevels.map((row) => (
                  <tr key={row.id} className="group hover:bg-[#181a27] transition-colors">
                    {/* Rating Selector */}
                    <td className="py-2.5 px-4 w-[210px] min-w-[210px] border-r border-[#212333]">
                      <div className="relative">
                        <select
                          value={row.rating}
                          onChange={(e) =>
                            onUpdateSharedLevel({ ...row, rating: e.target.value as DemonRating })
                          }
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                        >
                          {ALL_RATINGS.map((r) => (
                            <option key={r} value={r} className="bg-[#1a1b26] text-white">
                              {r}
                            </option>
                          ))}
                        </select>
                        <div className="cursor-pointer flex items-center justify-between">
                          <DifficultyBadge rating={row.rating} size="sm" />
                          <ChevronDown className="w-3 h-3 text-gray-500 ml-1 group-hover:text-gray-300" />
                        </div>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-2.5 px-4 font-semibold text-gray-100 border-r border-[#212333]">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => onUpdateSharedLevel({ ...row, name: e.target.value })}
                        className="w-full bg-transparent border border-transparent hover:border-[#2f334a] focus:border-indigo-500 rounded px-1.5 py-1 text-xs text-white font-medium focus:bg-[#12131d] focus:outline-none transition-all"
                      />
                    </td>

                    {/* ID */}
                    <td className="py-2.5 px-4 border-r border-[#212333] font-mono text-gray-400">
                      <div className="flex items-center justify-between gap-1 group/id">
                        <input
                          type="text"
                          value={row.levelId}
                          placeholder="ID"
                          onChange={(e) => onUpdateSharedLevel({ ...row, levelId: e.target.value })}
                          className="w-20 bg-transparent border border-transparent hover:border-[#2f334a] focus:border-indigo-500 rounded px-1.5 py-1 text-xs text-gray-300 font-mono focus:bg-[#12131d] focus:outline-none"
                        />
                        {row.levelId && (
                          <button
                            onClick={() => handleCopyId(row.levelId)}
                            className="p-1 rounded hover:bg-[#25283c] text-gray-500 hover:text-indigo-400 opacity-60 group-hover/id:opacity-100 transition-all"
                            title="Copy Level ID"
                          >
                            {copiedId === row.levelId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Level / Extra Info */}
                    <td className="py-2.5 px-4 border-r border-[#212333] text-gray-300">
                      <input
                        type="text"
                        value={row.levelInfo}
                        placeholder="W Speed"
                        onChange={(e) => onUpdateSharedLevel({ ...row, levelInfo: e.target.value })}
                        className="w-full bg-transparent border border-transparent hover:border-[#2f334a] focus:border-indigo-500 rounded px-1.5 py-1 text-xs text-gray-300 focus:bg-[#12131d] focus:outline-none"
                      />
                    </td>

                    {/* Thoughts after playing */}
                    <td className="py-2.5 px-4 border-r border-[#212333] text-gray-300">
                      <input
                        type="text"
                        value={row.thoughts}
                        placeholder="-"
                        onChange={(e) => onUpdateSharedLevel({ ...row, thoughts: e.target.value })}
                        className="w-full bg-transparent border border-transparent hover:border-[#2f334a] focus:border-indigo-500 rounded px-1.5 py-1 text-xs text-gray-300 focus:bg-[#12131d] focus:outline-none"
                      />
                    </td>

                    {/* Ashrit Status Badge */}
                    <td className="py-2.5 px-4 border-r border-[#212333] text-center">
                      {renderStatusBadge(row.ashritStatus, (s) =>
                        onUpdateSharedLevel({ ...row, ashritStatus: s })
                      )}
                    </td>

                    {/* Arsh Status Badge */}
                    <td className="py-2.5 px-4 border-r border-[#212333] text-center">
                      {renderStatusBadge(row.arshStatus, (s) =>
                        onUpdateSharedLevel({ ...row, arshStatus: s })
                      )}
                    </td>

                    {/* Extra / Image */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() =>
                            onOpenImageModal(row.name, row.imageUrl, (newImg) =>
                              onUpdateSharedLevel({ ...row, imageUrl: newImg })
                            )
                          }
                          className={`p-1.5 rounded-lg border transition-all ${
                            row.imageUrl
                              ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                              : 'hover:bg-[#25283c] border-transparent text-gray-400 hover:text-white'
                          }`}
                          title={row.imageUrl ? 'View / Change Level Image' : 'Attach Level Screenshot'}
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteSharedLevel(row.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-gray-500 hover:text-rose-400 transition-colors"
                          title="Delete row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
