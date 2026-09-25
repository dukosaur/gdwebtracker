import React, { useState } from 'react';
import {
  TabId,
  PlayerLevelRecord,
  SharedLevelRecord,
  DemonRating,
  CompletionStatus,
} from '../types';
import { RatingIcon, getRatingColors } from './DifficultyBadge';
import { EditLevelModal } from './EditLevelModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import {
  Copy,
  Check,
  Crown,
  Calendar,
  Zap,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { YouTubeLogo } from './YouTubeLogo';
import { getYouTubeThumbnail, getYouTubeWatchUrl } from '../utils/youtube';
import confetti from 'canvas-confetti';

interface ShowcaseViewProps {
  activeTab: TabId;
  ashritLevels: PlayerLevelRecord[];
  arshLevels: PlayerLevelRecord[];
  sharedLevels: SharedLevelRecord[];
  onOpenImageModal?: (levelName: string, currentImage?: string, onSave?: (img: string) => void) => void;
  onUpdatePlayerLevel: (tab: 'ashrit' | 'arsh', updated: PlayerLevelRecord) => void;
  onAddPlayerLevel: (tab: 'ashrit' | 'arsh', newLevel: PlayerLevelRecord) => void;
  onDeletePlayerLevel: (tab: 'ashrit' | 'arsh', id: string) => void;
  onUpdateSharedLevel: (updated: SharedLevelRecord) => void;
  onAddSharedLevel: (newLevel: SharedLevelRecord) => void;
  onDeleteSharedLevel: (id: string) => void;
}

const PLAYER_DEMON_RATINGS: DemonRating[] = [
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

export const ShowcaseView: React.FC<ShowcaseViewProps> = ({
  activeTab,
  ashritLevels,
  arshLevels,
  sharedLevels,
  onOpenImageModal,
  onUpdatePlayerLevel,
  onAddPlayerLevel,
  onDeletePlayerLevel,
  onUpdateSharedLevel,
  onAddSharedLevel,
  onDeleteSharedLevel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit / Add Modal state
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    data: PlayerLevelRecord | SharedLevelRecord | null;
  }>({ isOpen: false, data: null });

  // Delete Modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
  }>({ isOpen: false, id: '', name: '' });

  const handleCopyId = (levelId: string) => {
    if (!levelId) return;
    navigator.clipboard.writeText(levelId);
    setCopiedId(levelId);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#6366f1', '#10b981'],
      });
    } catch {
      // ignore
    }
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

  const isPlayerTab = activeTab === 'ashrit' || activeTab === 'arsh';
  const playerList = sortLevels(activeTab === 'ashrit' ? ashritLevels : arshLevels);
  const sortedSharedLevels = sortLevels(sharedLevels);

  // Filter player levels
  const filteredPlayerLevels = playerList.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.levelId.toString().includes(searchTerm) ||
      l.thoughts.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === 'all' || l.demonRating === ratingFilter;
    return matchesSearch && matchesRating;
  });

  // Filter shared levels
  const filteredSharedLevels = sortedSharedLevels.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.levelId.toString().includes(searchTerm) ||
      l.levelInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.thoughts.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === 'all' || l.rating === ratingFilter;
    return matchesSearch && matchesRating;
  });

  const currentCount = isPlayerTab ? filteredPlayerLevels.length : filteredSharedLevels.length;
  const totalCount = isPlayerTab ? playerList.length : sharedLevels.length;

  return (
    <div className="w-full space-y-6">
      {/* Top Action & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#141522] border border-[#26283b] shadow-lg">
        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search level, ID, notes..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#1c1e2e] border border-[#2b2e44] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            />
          </div>

          {/* Difficulty Filter Dropdown */}
          <div className="relative">
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2 rounded-xl bg-[#1c1e2e] border border-[#2b2e44] text-xs font-semibold text-gray-300 hover:text-white cursor-pointer focus:outline-none focus:border-indigo-500 transition-all"
            >
              <option value="all">All Difficulties</option>
              {(isPlayerTab ? PLAYER_DEMON_RATINGS : ALL_RATINGS).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-500 pointer-events-none" />
            <ChevronDown className="w-3 h-3 absolute right-2.5 top-3 text-gray-500 pointer-events-none" />
          </div>

          {/* Results count badge */}
          <span className="text-[11px] font-medium text-gray-400 px-2.5 py-1 rounded-lg bg-[#1c1e2e]/80 border border-[#282a3d]">
            {currentCount} of {totalCount} levels
          </span>
        </div>

        {/* Add Level Primary Button */}
        <button
          onClick={() => setEditModal({ isOpen: true, data: null })}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isPlayerTab ? 'Add Demon' : 'Add Wishlist Level'}</span>
        </button>
      </div>

      {/* Main Grid View */}
      {isPlayerTab ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlayerLevels.map((level) => {
            const isBeaten = Boolean(
              level.attempts !== undefined &&
              level.attempts !== null &&
              level.attempts.toString().trim() !== ''
            );
            const colors = getRatingColors(level.demonRating);

            return (
              <div
                key={level.id}
                className={`group relative rounded-2xl bg-[#151622] border transition-all duration-300 hover:-translate-y-1 overflow-hidden shadow-xl flex flex-col justify-between ${
                  level.currentHardest
                    ? 'border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.2)] bg-gradient-to-b from-[#1b1c2e] to-[#141520]'
                    : isBeaten
                    ? 'border-[#26283b] hover:border-[#3d415e]'
                    : 'border-[#202232] hover:border-[#2f3248] opacity-95'
                }`}
              >
                {/* Current Hardest Crown Banner */}
                {level.currentHardest && (
                  <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-3.5 py-1.5 flex items-center justify-between text-black font-black text-xs uppercase tracking-wider shadow-md">
                    <span className="flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 fill-black" />
                      Current Hardest Demon
                    </span>
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                )}

                {/* Optional YouTube Video Thumbnail Banner */}
                {(() => {
                  const ytThumbnail = getYouTubeThumbnail(level.videoUrl || level.imageUrl);
                  const ytWatchUrl = getYouTubeWatchUrl(level.videoUrl || level.imageUrl);

                  if (!ytThumbnail) return null;

                  return (
                    <a
                      href={ytWatchUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative aspect-video w-full overflow-hidden bg-black/70 group/yt block cursor-pointer border-b border-[#202336]"
                      title="Watch completion on YouTube"
                    >
                      <img
                        src={ytThumbnail}
                        alt={`${level.name} YouTube thumbnail`}
                        className={`w-full h-full object-cover transition-transform duration-300 group-hover/yt:scale-105 ${
                          isBeaten
                            ? 'opacity-90 group-hover/yt:opacity-100'
                            : 'opacity-35 grayscale filter contrast-75 group-hover/yt:opacity-50'
                        }`}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </a>
                  );
                })()}

                {/* Card Main Content */}
                <div className="p-5 space-y-4 flex-1">
                  {/* Top Bar: Demon Rating dropdown + Actions */}
                  <div className="flex items-center justify-between gap-2">
                    {/* Demon Rating Dropdown */}
                    <div className="relative inline-block">
                      <select
                        value={level.demonRating}
                        onChange={(e) => {
                          const newRating = e.target.value as DemonRating;
                          onUpdatePlayerLevel(activeTab as 'ashrit' | 'arsh', {
                            ...level,
                            demonRating: newRating,
                          });
                        }}
                        className={`appearance-none cursor-pointer pl-3 pr-7 py-1 rounded-full text-xs font-bold border transition-all shadow-sm focus:outline-none ${
                          isBeaten
                            ? `${colors.bg} ${colors.text} ${colors.border}`
                            : 'bg-[#181926]/90 text-gray-400 border-gray-600/50 grayscale opacity-60 hover:opacity-90'
                        }`}
                      >
                        {PLAYER_DEMON_RATINGS.map((r) => (
                          <option key={r} value={r} className="bg-[#1a1b26] text-white">
                            {r}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className={`w-3 h-3 absolute right-2.5 top-2 pointer-events-none transition-opacity ${
                          isBeaten ? 'opacity-60 text-current' : 'opacity-40 text-gray-400'
                        }`}
                      />
                    </div>

                    {/* Action buttons: Crown, Edit, Delete */}
                    <div className="flex items-center gap-1">
                      {/* Hardest Toggle Button */}
                      <button
                        onClick={() => {
                          const nextHardest = !level.currentHardest;
                          onUpdatePlayerLevel(activeTab as 'ashrit' | 'arsh', {
                            ...level,
                            currentHardest: nextHardest,
                          });
                          if (nextHardest) triggerCelebration();
                        }}
                        className={`p-1.5 rounded-lg transition-all ${
                          level.currentHardest
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'text-gray-500 hover:text-amber-400 hover:bg-[#202235]'
                        }`}
                        title={level.currentHardest ? 'Remove hardest crown' : 'Mark as current hardest'}
                      >
                        <Crown className={`w-3.5 h-3.5 ${level.currentHardest ? 'fill-amber-400' : ''}`} />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => setEditModal({ isOpen: true, data: level })}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#202235] transition-colors"
                        title="Edit demon details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, id: level.id, name: level.name })}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete demon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Level Name & Big Icon */}
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`p-2 rounded-2xl border shrink-0 shadow-lg transition-all ${
                        isBeaten
                          ? 'bg-[#1c1e2d] border-[#2b2d42] group-hover:border-indigo-500/40'
                          : 'bg-[#12131d] border-[#1f2130]'
                      }`}
                    >
                      <RatingIcon
                        rating={level.demonRating}
                        className={`w-12 h-12 transition-all duration-300 ${
                          isBeaten
                            ? 'hover:scale-110 opacity-100'
                            : 'opacity-35 grayscale filter contrast-75 group-hover:opacity-60'
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className={`text-lg font-bold font-['Outfit'] tracking-wide truncate transition-colors ${
                          isBeaten ? 'text-white' : 'text-gray-300'
                        }`}
                      >
                        {level.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        {level.levelId && (
                          <button
                            onClick={() => handleCopyId(level.levelId)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1f2133] hover:bg-[#2a2d44] border border-[#2d3047] text-[10px] font-mono text-gray-300 hover:text-white transition-all"
                            title="Click to copy Level ID"
                          >
                            <span>ID: {level.levelId}</span>
                            {copiedId === level.levelId ? (
                              <Check className="w-2.5 h-2.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 text-gray-400" />
                            )}
                          </button>
                        )}
                        {level.date && level.date.trim() !== '' && (
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-500" />
                            <span>{level.date}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Thoughts Callout */}
                  {level.thoughts && level.thoughts !== '-' ? (
                    <div
                      onClick={() => setEditModal({ isOpen: true, data: level })}
                      className="p-3 rounded-xl bg-[#10111a] border border-[#212336] hover:border-[#32364f] text-xs text-gray-300 italic flex items-start gap-2 cursor-pointer transition-colors"
                      title="Click to edit thoughts"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">"{level.thoughts}"</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditModal({ isOpen: true, data: level })}
                      className="text-[11px] text-gray-500 hover:text-indigo-400 flex items-center gap-1 transition-colors"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Add thoughts / notes</span>
                    </button>
                  )}
                </div>

                {/* Card Footer: Attempts & YouTube Video Action */}
                <div className="px-5 py-3.5 bg-[#12131d] border-t border-[#232537] flex items-center justify-between text-xs">
                  <button
                    onClick={() => setEditModal({ isOpen: true, data: level })}
                    className="flex items-center gap-1.5 font-bold text-amber-300 hover:text-amber-200 transition-colors"
                    title="Click to edit attempts"
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>
                      {level.attempts && level.attempts.toString().trim() !== ''
                        ? `${!isNaN(Number(level.attempts)) ? Number(level.attempts).toLocaleString() : level.attempts} attempts`
                        : 'Log attempts'}
                    </span>
                  </button>

                  {/* YouTube Action Button */}
                  {(() => {
                    const ytWatchUrl = getYouTubeWatchUrl(level.videoUrl || level.imageUrl);
                    if (ytWatchUrl) {
                      return (
                        <a
                          href={ytWatchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-400 hover:text-red-300 text-[11px] font-bold transition-all shadow-sm group/ytbtn"
                          title="Watch completion on YouTube"
                        >
                          <YouTubeLogo className="w-4 h-3.5 group-hover/ytbtn:scale-110 transition-transform" />
                          <span>Watch Video</span>
                          <ExternalLink className="w-3 h-3 text-red-400/80" />
                        </a>
                      );
                    }
                    return (
                      <button
                        onClick={() => setEditModal({ isOpen: true, data: level })}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors group"
                        title="Add YouTube video"
                      >
                        <YouTubeLogo className="w-4 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                        <span>Add video</span>
                      </button>
                    );
                  })()}
                </div>
              </div>
            );
          })}

          {/* Dashed Add New Demon Card */}
          <button
            onClick={() => setEditModal({ isOpen: true, data: null })}
            className="rounded-2xl border-2 border-dashed border-[#292c42] hover:border-indigo-500/60 bg-[#12131d]/60 hover:bg-[#161726] p-8 flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-indigo-300 transition-all duration-300 group min-h-[260px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#1c1e2e] border border-[#2c3048] flex items-center justify-center text-gray-400 group-hover:text-indigo-400 group-hover:scale-110 transition-all shadow-lg">
              <Plus className="w-6 h-6" />
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-white font-['Outfit']">Add Another Demon</div>
              <div className="text-xs text-gray-500 mt-0.5">Click to log attempts, date & rating</div>
            </div>
          </button>
        </div>
      ) : (
        /* Shared Wishlist Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSharedLevels.map((level) => {
            const colors = getRatingColors(level.rating);

            return (
              <div
                key={level.id}
                className="group relative rounded-2xl bg-[#151622] border border-[#26283b] hover:border-[#3d415e] transition-all duration-300 hover:-translate-y-1 overflow-hidden shadow-xl flex flex-col justify-between"
              >
                {/* Optional YouTube Thumbnail Banner for Shared Card */}
                {(() => {
                  const ytThumbnail = getYouTubeThumbnail(level.videoUrl || level.imageUrl);
                  const ytWatchUrl = getYouTubeWatchUrl(level.videoUrl || level.imageUrl);

                  if (!ytThumbnail) return null;

                  return (
                    <a
                      href={ytWatchUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative aspect-video w-full overflow-hidden bg-black/70 group/yt block cursor-pointer border-b border-[#202336]"
                      title="Watch on YouTube"
                    >
                      <img
                        src={ytThumbnail}
                        alt={`${level.name} YouTube thumbnail`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/yt:scale-105 opacity-90 group-hover/yt:opacity-100"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </a>
                  );
                })()}

                <div className="p-5 space-y-4 flex-1">
                  {/* Top Bar: Difficulty Dropdown & Actions */}
                  <div className="flex items-center justify-between gap-2">
                    {/* Rating Dropdown */}
                    <div className="relative inline-block">
                      <select
                        value={level.rating}
                        onChange={(e) => {
                          const newRating = e.target.value as DemonRating;
                          onUpdateSharedLevel({ ...level, rating: newRating });
                        }}
                        className={`appearance-none cursor-pointer pl-3 pr-7 py-1 rounded-full text-xs font-bold border transition-all shadow-sm focus:outline-none ${colors.bg} ${colors.text} ${colors.border}`}
                      >
                        {ALL_RATINGS.map((r) => (
                          <option key={r} value={r} className="bg-[#1a1c2c] text-white">
                            {r}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="w-3 h-3 absolute right-2.5 top-2 pointer-events-none transition-opacity opacity-60 text-current"
                      />
                    </div>

                    {/* Actions: Edit, Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditModal({ isOpen: true, data: level })}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#202235] transition-colors"
                        title="Edit wishlist level"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteModal({ isOpen: true, id: level.id, name: level.name })}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete level"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Level Name & Icon */}
                  <div className="flex items-center gap-3.5">
                    <div
                      className="p-2 rounded-2xl border shrink-0 shadow-lg transition-all bg-[#1c1e2d] border-[#2b2d42] group-hover:border-indigo-500/40"
                    >
                      <RatingIcon
                        rating={level.rating}
                        className="w-12 h-12 transition-all duration-300 hover:scale-110 opacity-100"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className="text-lg font-bold font-['Outfit'] tracking-wide truncate transition-colors text-white"
                      >
                        {level.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        {level.levelId && (
                          <button
                            onClick={() => handleCopyId(level.levelId)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1f2133] hover:bg-[#2a2d44] border border-[#2d3047] text-[10px] font-mono text-gray-300 hover:text-white transition-all"
                            title="Click to copy Level ID"
                          >
                            <span>ID: {level.levelId}</span>
                            {copiedId === level.levelId ? (
                              <Check className="w-2.5 h-2.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 text-gray-400" />
                            )}
                          </button>
                        )}
                        {level.levelInfo && (
                          <span className="text-xs text-amber-300/90 font-medium">{level.levelInfo}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Thoughts if any */}
                  {level.thoughts ? (
                    <div
                      onClick={() => setEditModal({ isOpen: true, data: level })}
                      className="p-3 rounded-xl bg-[#10111a] border border-[#212336] hover:border-[#32364f] text-xs text-gray-300 italic flex items-start gap-2 whitespace-pre-line cursor-pointer transition-colors"
                      title="Click to edit thoughts"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">"{level.thoughts}"</span>
                    </div>
                  ) : null}

                  {/* Ashrit & Arsh Status Interactive Progress Dropdowns */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#232537]">
                    {/* Ashrit */}
                    <div className="p-2.5 rounded-xl bg-[#11121d] border border-[#232538] flex flex-col items-center">
                      <span className="text-[10px] uppercase font-bold text-indigo-300 mb-1">Ashrit</span>
                      <div className="relative w-full">
                        <select
                          value={level.ashritStatus}
                          onChange={(e) => {
                            const next = e.target.value as CompletionStatus;
                            onUpdateSharedLevel({ ...level, ashritStatus: next });
                            if (next === 'done') triggerCelebration();
                          }}
                          className={`w-full appearance-none cursor-pointer text-xs font-bold px-2 py-1 rounded-full border text-center capitalize focus:outline-none transition-all ${
                            level.ashritStatus === 'done'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : level.ashritStatus === 'attempted'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              : 'bg-gray-800 text-gray-400 border-gray-700'
                          }`}
                        >
                          {COMPLETION_STATUSES.map((s) => (
                            <option key={s} value={s} className="bg-[#1a1b26] text-white">
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Arsh */}
                    <div className="p-2.5 rounded-xl bg-[#11121d] border border-[#232538] flex flex-col items-center">
                      <span className="text-[10px] uppercase font-bold text-red-300 mb-1">Arsh</span>
                      <div className="relative w-full">
                        <select
                          value={level.arshStatus}
                          onChange={(e) => {
                            const next = e.target.value as CompletionStatus;
                            onUpdateSharedLevel({ ...level, arshStatus: next });
                            if (next === 'done') triggerCelebration();
                          }}
                          className={`w-full appearance-none cursor-pointer text-xs font-bold px-2 py-1 rounded-full border text-center capitalize focus:outline-none transition-all ${
                            level.arshStatus === 'done'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : level.arshStatus === 'attempted'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              : 'bg-gray-800 text-gray-400 border-gray-700'
                          }`}
                        >
                          {COMPLETION_STATUSES.map((s) => (
                            <option key={s} value={s} className="bg-[#1a1b26] text-white">
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 bg-[#12131d] border-t border-[#232537] flex items-center justify-end">
                  {(() => {
                    const ytWatchUrl = getYouTubeWatchUrl(level.videoUrl || level.imageUrl);
                    if (ytWatchUrl) {
                      return (
                        <a
                          href={ytWatchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-400 hover:text-red-300 text-[11px] font-bold transition-all shadow-sm group/ytbtn"
                          title="Watch on YouTube"
                        >
                          <YouTubeLogo className="w-4 h-3.5 group-hover/ytbtn:scale-110 transition-transform" />
                          <span>Watch Video</span>
                          <ExternalLink className="w-3 h-3 text-red-400/80" />
                        </a>
                      );
                    }
                    return (
                      <button
                        onClick={() => setEditModal({ isOpen: true, data: level })}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors group"
                        title="Add YouTube video"
                      >
                        <YouTubeLogo className="w-4 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                        <span>Add video</span>
                      </button>
                    );
                  })()}
                </div>
              </div>
            );
          })}

          {/* Dashed Add Wishlist Level Card */}
          <button
            onClick={() => setEditModal({ isOpen: true, data: null })}
            className="rounded-2xl border-2 border-dashed border-[#292c42] hover:border-indigo-500/60 bg-[#12131d]/60 hover:bg-[#161726] p-8 flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-indigo-300 transition-all duration-300 group min-h-[260px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#1c1e2e] border border-[#2c3048] flex items-center justify-center text-gray-400 group-hover:text-indigo-400 group-hover:scale-110 transition-all shadow-lg">
              <Plus className="w-6 h-6" />
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-white font-['Outfit']">Add To Wishlist</div>
              <div className="text-xs text-gray-500 mt-0.5">Click to add level to play next</div>
            </div>
          </button>
        </div>
      )}

      {/* Edit / Add Modal */}
      <EditLevelModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, data: null })}
        activeTab={activeTab}
        initialData={editModal.data}
        onSavePlayer={(record) => {
          if (editModal.data) {
            onUpdatePlayerLevel(activeTab as 'ashrit' | 'arsh', record);
          } else {
            onAddPlayerLevel(activeTab as 'ashrit' | 'arsh', record);
          }
        }}
        onSaveShared={(record) => {
          if (editModal.data) {
            onUpdateSharedLevel(record);
          } else {
            onAddSharedLevel(record);
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
        levelName={deleteModal.name}
        onConfirm={() => {
          if (isPlayerTab) {
            onDeletePlayerLevel(activeTab as 'ashrit' | 'arsh', deleteModal.id);
          } else {
            onDeleteSharedLevel(deleteModal.id);
          }
        }}
      />
    </div>
  );
};
