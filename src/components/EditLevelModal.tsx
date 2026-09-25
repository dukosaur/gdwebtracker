import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Crown,
  Save,
  Plus,
  Sparkles,
  Zap,
  MessageSquare,
  Trophy,
  Hash,
  ChevronDown,
  Flame,
  Check,
  Youtube,
  Play,
} from 'lucide-react';
import {
  PlayerLevelRecord,
  SharedLevelRecord,
  DemonRating,
  CompletionStatus,
  TabId,
} from '../types';
import { RatingIcon } from './DifficultyBadge';
import { CustomDatePicker, formatGDDate } from './CustomDatePicker';
import { extractYouTubeId, getYouTubeThumbnail, getYouTubeWatchUrl } from '../utils/youtube';
import confetti from 'canvas-confetti';

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

const STATUS_OPTIONS: CompletionStatus[] = ['not done', 'attempted', 'done'];

interface EditLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabId;
  initialData?: PlayerLevelRecord | SharedLevelRecord | null;
  onSavePlayer: (record: PlayerLevelRecord) => void;
  onSaveShared: (record: SharedLevelRecord) => void;
}

const getRatingButtonLabel = (r: string) => {
  switch (r) {
    case 'Medium Demon':
      return 'MED DEMON';
    default:
      return r.toUpperCase();
  }
};

// Dynamic theme styling matching the active Demon difficulty
const getDemonTheme = (rating: DemonRating) => {
  switch (rating) {
    case 'NA':
      return {
        glow: 'rgba(148, 163, 184, 0.25)',
        headerGradient: 'from-slate-950/80 via-slate-900/30 to-[#12131f]',
        border: 'border-slate-500/50',
        text: 'text-slate-300',
        badge: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
        accentRing: 'focus:border-slate-500 focus:ring-slate-500/30',
        saveButton: 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 shadow-slate-600/35',
      };
    case 'Auto':
      return {
        glow: 'rgba(56, 189, 248, 0.35)',
        headerGradient: 'from-sky-950/80 via-cyan-950/30 to-[#12131f]',
        border: 'border-sky-500/50',
        text: 'text-sky-400',
        badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        accentRing: 'focus:border-sky-500 focus:ring-sky-500/30',
        saveButton: 'bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 shadow-sky-600/35',
      };
    case 'Easy':
      return {
        glow: 'rgba(6, 182, 212, 0.35)',
        headerGradient: 'from-cyan-950/80 via-cyan-900/30 to-[#12131f]',
        border: 'border-cyan-400/50',
        text: 'text-cyan-300',
        badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        accentRing: 'focus:border-cyan-400 focus:ring-cyan-400/30',
        saveButton: 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 shadow-cyan-600/35',
      };
    case 'Normal':
      return {
        glow: 'rgba(34, 197, 94, 0.35)',
        headerGradient: 'from-green-950/80 via-emerald-950/30 to-[#12131f]',
        border: 'border-green-500/50',
        text: 'text-green-400',
        badge: 'bg-green-500/20 text-green-300 border-green-500/40',
        accentRing: 'focus:border-green-500 focus:ring-green-500/30',
        saveButton: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-green-600/35',
      };
    case 'Hard':
      return {
        glow: 'rgba(245, 158, 11, 0.35)',
        headerGradient: 'from-amber-950/80 via-amber-900/30 to-[#12131f]',
        border: 'border-amber-500/50',
        text: 'text-amber-400',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        accentRing: 'focus:border-amber-500 focus:ring-amber-500/30',
        saveButton: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-amber-500/35 text-black font-extrabold',
      };
    case 'Harder':
      return {
        glow: 'rgba(249, 115, 22, 0.35)',
        headerGradient: 'from-orange-950/80 via-orange-900/30 to-[#12131f]',
        border: 'border-orange-500/50',
        text: 'text-orange-400',
        badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        accentRing: 'focus:border-orange-500 focus:ring-orange-500/30',
        saveButton: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-orange-600/35',
      };
    case 'Insane':
      return {
        glow: 'rgba(236, 72, 153, 0.35)',
        headerGradient: 'from-pink-950/80 via-rose-950/30 to-[#12131f]',
        border: 'border-pink-500/50',
        text: 'text-pink-400',
        badge: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
        accentRing: 'focus:border-pink-500 focus:ring-pink-500/30',
        saveButton: 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-pink-600/35',
      };
    case 'Easy Demon':
      return {
        glow: 'rgba(16, 185, 129, 0.35)',
        headerGradient: 'from-emerald-950/80 via-emerald-900/30 to-[#12131f]',
        border: 'border-emerald-500/50',
        text: 'text-emerald-400',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        accentRing: 'focus:border-emerald-500 focus:ring-emerald-500/30',
        saveButton: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/35',
      };
    case 'Medium Demon':
      return {
        glow: 'rgba(245, 158, 11, 0.35)',
        headerGradient: 'from-amber-950/80 via-amber-900/30 to-[#12131f]',
        border: 'border-amber-500/50',
        text: 'text-amber-400',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        accentRing: 'focus:border-amber-500 focus:ring-amber-500/30',
        saveButton: 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-amber-500 shadow-amber-500/35 text-black font-extrabold',
      };
    case 'Hard Demon':
      return {
        glow: 'rgba(249, 115, 22, 0.35)',
        headerGradient: 'from-orange-950/80 via-orange-900/30 to-[#12131f]',
        border: 'border-orange-500/50',
        text: 'text-orange-400',
        badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        accentRing: 'focus:border-orange-500 focus:ring-orange-500/30',
        saveButton: 'bg-gradient-to-r from-orange-600 via-orange-500 to-red-600 hover:from-orange-500 hover:to-orange-400 shadow-orange-600/35',
      };
    case 'Insane Demon':
      return {
        glow: 'rgba(168, 85, 247, 0.38)',
        headerGradient: 'from-purple-950/80 via-purple-900/30 to-[#12131f]',
        border: 'border-purple-500/50',
        text: 'text-purple-400',
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        accentRing: 'focus:border-purple-500 focus:ring-purple-500/30',
        saveButton: 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-700 hover:from-purple-500 hover:to-fuchsia-500 shadow-purple-600/35',
      };
    case 'Extreme Demon':
      return {
        glow: 'rgba(239, 68, 68, 0.45)',
        headerGradient: 'from-red-950/90 via-rose-900/40 to-[#12131f]',
        border: 'border-red-500/60',
        text: 'text-red-400',
        badge: 'bg-red-500/25 text-red-300 border-red-500/50',
        accentRing: 'focus:border-red-500 focus:ring-red-500/30',
        saveButton: 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 shadow-red-600/40',
      };
    case 'Impossible':
      return {
        glow: 'rgba(217, 70, 239, 0.45)',
        headerGradient: 'from-fuchsia-950/90 via-purple-950/50 to-[#12131f]',
        border: 'border-fuchsia-500/60',
        text: 'text-fuchsia-400',
        badge: 'bg-fuchsia-500/25 text-fuchsia-300 border-fuchsia-500/50',
        accentRing: 'focus:border-fuchsia-500 focus:ring-fuchsia-500/30',
        saveButton: 'bg-gradient-to-r from-fuchsia-600 via-purple-600 to-rose-700 hover:from-fuchsia-500 hover:to-purple-500 shadow-fuchsia-600/40',
      };
    default:
      return {
        glow: 'rgba(99, 102, 241, 0.25)',
        headerGradient: 'from-indigo-950/80 via-indigo-900/30 to-[#12131f]',
        border: 'border-indigo-500/40',
        text: 'text-indigo-400',
        badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        accentRing: 'focus:border-indigo-500 focus:ring-indigo-500/30',
        saveButton: 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-600/35',
      };
  }
};

export const EditLevelModal: React.FC<EditLevelModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  initialData,
  onSavePlayer,
  onSaveShared,
}) => {
  const isPlayerTab = activeTab === 'ashrit' || activeTab === 'arsh';
  const isEditing = Boolean(initialData);

  // Form states
  const [rating, setRating] = useState<DemonRating>('Easy Demon');
  const [name, setName] = useState('');
  const [levelId, setLevelId] = useState('');
  const [attempts, setAttempts] = useState('');
  const [date, setDate] = useState('');
  const [thoughts, setThoughts] = useState('');
  const [currentHardest, setCurrentHardest] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  // Shared tab specific fields
  const [levelInfo, setLevelInfo] = useState('W Speed');
  const [ashritStatus, setAshritStatus] = useState<CompletionStatus>('not done');
  const [arshStatus, setArshStatus] = useState<CompletionStatus>('not done');

  const [error, setError] = useState<string | null>(null);
  const [wishlistLayout, setWishlistLayout] = useState<'row' | 'grid'>('row');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setLevelId(initialData.levelId || '');
      setThoughts(initialData.thoughts || '');
      // Normalize YouTube URL for editing so it shows a clean watch link rather than internal thumbnail URL
      let initialVideo = initialData.videoUrl || initialData.imageUrl || '';
      const extractedYtId = extractYouTubeId(initialVideo);
      if (extractedYtId) {
        setVideoUrl(`https://www.youtube.com/watch?v=${extractedYtId}`);
      } else {
        setVideoUrl(initialVideo);
      }

      if (isPlayerTab) {
        const p = initialData as PlayerLevelRecord;
        setRating(p.demonRating || 'Easy Demon');
        setAttempts(p.attempts !== undefined && p.attempts !== null ? p.attempts.toString() : '');
        setDate(p.date || '');
        setCurrentHardest(Boolean(p.currentHardest));
      } else {
        const s = initialData as SharedLevelRecord;
        setRating(s.rating || 'Medium Demon');
        setLevelInfo(s.levelInfo || 'W Speed');
        setAshritStatus(s.ashritStatus || 'not done');
        setArshStatus(s.arshStatus || 'not done');
      }
    } else {
      setName('');
      setLevelId('');
      setThoughts('');
      setVideoUrl('');
      setError(null);

      if (isPlayerTab) {
        setRating('Easy Demon');
        setAttempts('');
        setDate('');
        setCurrentHardest(false);
      } else {
        setRating('Medium Demon');
        setLevelInfo('W Speed');
        setAshritStatus('not done');
        setArshStatus('not done');
      }
    }
  }, [initialData, isPlayerTab, isOpen]);

  // Prevent background scrolling while modal is open & lock root
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const theme = getDemonTheme(rating);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a level name');
      return;
    }

    const cleanVideo = videoUrl.trim();
    const ytThumbnail = getYouTubeThumbnail(cleanVideo);
    const cleanWatchUrl = getYouTubeWatchUrl(cleanVideo);

    if (isPlayerTab) {
      const record: PlayerLevelRecord = {
        id: initialData?.id || `${activeTab}-${Date.now()}`,
        demonRating: rating,
        name: name.trim(),
        levelId: levelId.trim(),
        attempts: attempts.trim(),
        date: date.trim(),
        thoughts: thoughts.trim() || '-',
        currentHardest,
        order: initialData?.order,
        videoUrl: cleanWatchUrl || cleanVideo || '',
        imageUrl: ytThumbnail || '',
      };

      if (currentHardest && (!initialData || !(initialData as PlayerLevelRecord).currentHardest)) {
        try {
          confetti({
            particleCount: 110,
            spread: 85,
            origin: { y: 0.6 },
            colors: ['#fbbf24', '#f59e0b', '#6366f1', '#10b981'],
          });
        } catch {
          // ignore
        }
      }

      onSavePlayer(record);
    } else {
      const record: SharedLevelRecord = {
        id: initialData?.id || `shared-${Date.now()}`,
        rating,
        name: name.trim(),
        levelId: levelId.trim(),
        levelInfo: levelInfo.trim() || 'W Speed',
        thoughts: thoughts.trim(),
        ashritStatus,
        arshStatus,
        order: initialData?.order,
        videoUrl: cleanWatchUrl || cleanVideo || '',
        imageUrl: ytThumbnail || '',
      };

      if (ashritStatus === 'done' || arshStatus === 'done') {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      }

      onSaveShared(record);
    }

    onClose();
  };

  const ratingsList = isPlayerTab ? PLAYER_DEMON_RATINGS : ALL_RATINGS;

  const modalContent = (
    <div
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen min-h-screen z-[999999] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200 overflow-y-auto"
      style={{ margin: 0 }}
      onClick={onClose}
    >
      {/* Outer Glow & Window Container */}
      <div
        className={`relative w-full max-w-xl rounded-3xl bg-[#11121c] border ${theme.border} shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all duration-300 my-auto`}
        style={{
          boxShadow: `0 0 50px -10px ${theme.glow}, 0 25px 50px -12px rgba(0, 0, 0, 0.8)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dynamic Glow Banner Header */}
        <div
          className={`relative px-6 py-5 bg-gradient-to-r ${theme.headerGradient} border-b border-[#23263b] flex items-center justify-between`}
        >
          <div className="flex items-center gap-4">
            {/* Glowing GD Difficulty Avatar */}
            <div className="relative group">
              <div
                className="w-14 h-14 rounded-2xl bg-[#181a28] border border-[#2e324a] p-2 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 duration-200"
                style={{
                  boxShadow: `0 0 24px ${theme.glow}`,
                }}
              >
                <RatingIcon rating={rating} className="w-10 h-10 drop-shadow-md" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full border ${theme.badge} shadow-sm`}>
                  {rating}
                </span>
                <span className="text-[11px] font-semibold text-gray-400 capitalize">
                  • {activeTab === 'ashrit' ? "Ashrit's Tracker" : activeTab === 'arsh' ? "Arsh's Tracker" : 'Wishlist'}
                </span>
              </div>
              <h2 className="text-xl font-black text-white font-['Outfit'] tracking-tight mt-1 truncate max-w-[280px] sm:max-w-md">
                {isEditing ? (name ? `Edit ${name}` : 'Edit Demon') : isPlayerTab ? 'Add Completed Demon' : 'Add Wishlist Level'}
              </h2>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#181a27] hover:bg-[#25283d] border border-[#2b2e44] text-gray-400 hover:text-white flex items-center justify-center transition-all active:scale-90"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {error && (
            <div className="p-3 text-xs font-semibold rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-2 animate-shake">
              <X className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Interactive Demon Difficulty Selector */}
          {isPlayerTab ? (
            <div className="p-4 rounded-2xl bg-[#151726]/90 border border-[#23263b] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5 font-['Outfit']">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Select Demon Difficulty</span>
                </span>
              </div>

              {/* 5 Demon Difficulty Buttons Grid */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {PLAYER_DEMON_RATINGS.map((r) => {
                  const isSelected = rating === r;
                  const btnTheme = getDemonTheme(r);
                  return (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRating(r)}
                      className={`group relative p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? `${btnTheme.border} bg-[#1f2238] scale-[1.04] shadow-lg`
                          : 'border-[#26293f] bg-[#12131e]/90 hover:border-gray-500 hover:bg-[#181a29]'
                      }`}
                      style={
                        isSelected
                          ? { boxShadow: `0 0 20px -2px ${btnTheme.glow}` }
                          : undefined
                      }
                    >
                      <div className={`transition-transform duration-200 ${isSelected ? 'scale-110 drop-shadow-md' : 'opacity-70 group-hover:opacity-100 group-hover:scale-105'}`}>
                        <RatingIcon rating={r} className="w-7 h-7 sm:w-8 sm:h-8" />
                      </div>
                      <span
                        className={`text-[9px] sm:text-[10px] font-black uppercase tracking-tight text-center leading-tight truncate w-full ${
                          isSelected ? `${btnTheme.text} font-bold` : 'text-gray-400 group-hover:text-gray-200'
                        }`}
                      >
                        {r.replace(' Demon', '')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#151726]/90 border border-[#23263b] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5 font-['Outfit']">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Select Rating / Difficulty</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 hidden sm:inline">
                    {wishlistLayout === 'row' ? 'Scroll for all 13 →' : 'All 13 ratings'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setWishlistLayout(wishlistLayout === 'row' ? 'grid' : 'row')}
                    className="px-2 py-0.5 rounded-lg bg-[#1e2032] hover:bg-[#282b42] border border-[#2f324d] text-[10px] font-bold text-gray-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                    title={wishlistLayout === 'row' ? 'Switch to Multi-row Grid' : 'Switch to 1 Scrollable Row'}
                  >
                    {wishlistLayout === 'row' ? '⊞ Multi-row' : '⇄ 1 Row'}
                  </button>
                </div>
              </div>

              {/* 13 Rating Difficulty Buttons */}
              <div
                className={
                  wishlistLayout === 'row'
                    ? 'flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2.5 pt-1 px-1 custom-scrollbar snap-x'
                    : 'grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2 pt-1'
                }
              >
                {ALL_RATINGS.map((r) => {
                  const isSelected = rating === r;
                  const btnTheme = getDemonTheme(r);
                  return (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRating(r)}
                      className={`group relative p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer snap-start ${
                        wishlistLayout === 'row'
                          ? 'min-w-[72px] w-[72px] sm:min-w-[80px] sm:w-[80px] shrink-0'
                          : 'w-full'
                      } ${
                        isSelected
                          ? `${btnTheme.border} bg-[#1f2238] scale-[1.04] shadow-lg`
                          : 'border-[#26293f] bg-[#12131e]/90 hover:border-gray-500 hover:bg-[#181a29]'
                      }`}
                      style={
                        isSelected
                          ? { boxShadow: `0 0 20px -2px ${btnTheme.glow}` }
                          : undefined
                      }
                    >
                      <div
                        className={`transition-transform duration-200 ${
                          isSelected
                            ? 'scale-110 drop-shadow-md'
                            : 'opacity-70 group-hover:opacity-100 group-hover:scale-105'
                        }`}
                      >
                        <RatingIcon rating={r} className="w-7 h-7 sm:w-8 sm:h-8" />
                      </div>
                      <span
                        className={`text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-tight text-center leading-tight truncate w-full ${
                          isSelected ? `${btnTheme.text} font-bold` : 'text-gray-400 group-hover:text-gray-200'
                        }`}
                      >
                        {getRatingButtonLabel(r)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: Level Name, ID & Attempts */}
          <div className="p-4 rounded-2xl bg-[#151726]/90 border border-[#23263b] space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-indigo-400" />
                <span>Level Name</span>
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. The Nightmare, Bloodbath, B..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#1c1f30] border border-[#2d3148] text-white text-sm font-semibold placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-['Outfit']"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Geometry Dash Level ID</span>
                </label>
                <input
                  type="text"
                  value={levelId}
                  onChange={(e) => setLevelId(e.target.value)}
                  placeholder="e.g. 13519"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1f30] border border-[#2d3148] text-indigo-200 text-sm font-mono placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              {isPlayerTab ? (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Attempt Count</span>
                  </label>
                  <input
                    type="text"
                    value={attempts}
                    onChange={(e) => setAttempts(e.target.value)}
                    placeholder="e.g. 329"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1f30] border border-[#2d3148] text-amber-300 text-sm font-bold placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Extra / Level Info</span>
                  </label>
                  <input
                    type="text"
                    value={levelInfo}
                    onChange={(e) => setLevelInfo(e.target.value)}
                    placeholder="e.g. W Speed, Bossfight"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1c1f30] border border-[#2d3148] text-white text-sm font-medium placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              )}
            </div>

            {/* Date Beaten with Custom Calendar Picker */}
            {isPlayerTab && (
              <div className="pt-1">
                <CustomDatePicker
                  value={date}
                  onChange={(formatted) => setDate(formatted)}
                  label="Date Beaten"
                />
              </div>
            )}
          </div>

          {/* Section 3: Current Hardest Demon Royalty Banner (Player Tab) */}
          {isPlayerTab && (
            <div
              onClick={() => {
                const nextVal = !currentHardest;
                setCurrentHardest(nextVal);
                if (nextVal) {
                  try {
                    confetti({
                      particleCount: 50,
                      spread: 60,
                      origin: { y: 0.6 },
                      colors: ['#fbbf24', '#f59e0b', '#fef08a'],
                    });
                  } catch {
                    // ignore
                  }
                }
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center justify-between select-none ${
                currentHardest
                  ? 'bg-gradient-to-r from-amber-500/25 via-amber-500/10 to-[#161826] border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.25)]'
                  : 'bg-[#151726]/90 border-[#23263b] text-gray-300 hover:border-gray-500 hover:bg-[#1b1e32]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                    currentHardest
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-lg shadow-amber-500/40'
                      : 'bg-[#1e2133] text-gray-500 border border-[#2b2e44]'
                  }`}
                >
                  <Crown className={`w-5 h-5 ${currentHardest ? 'fill-black' : ''}`} />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                    <span className={currentHardest ? 'text-amber-300 font-bold' : 'text-gray-200'}>
                      {currentHardest ? 'Current Hardest Demon' : 'Mark as Current Hardest Demon'}
                    </span>
                    {currentHardest && <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Displays with a golden crown and banner in your showcase
                  </div>
                </div>
              </div>

              {/* Animated Switch Slider */}
              <div
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  currentHardest
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.7)]'
                    : 'bg-[#2b2e44]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                    currentHardest ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Section 4: Shared Tab Completion Statuses */}
          {!isPlayerTab && (
            <div className="p-4 rounded-2xl bg-[#151726]/90 border border-[#23263b] space-y-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Completion Progress
              </label>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3 rounded-xl bg-[#12131d] border border-[#23263b]">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-indigo-300 mb-1.5">
                    Ashrit Status
                  </label>
                  <select
                    value={ashritStatus}
                    onChange={(e) => setAshritStatus(e.target.value as CompletionStatus)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#1c1f30] border border-[#2e324a] text-white text-xs font-bold focus:outline-none focus:border-indigo-500 capitalize"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-[#12131d] border border-[#23263b]">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-red-300 mb-1.5">
                    Arsh Status
                  </label>
                  <select
                    value={arshStatus}
                    onChange={(e) => setArshStatus(e.target.value as CompletionStatus)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#1c1f30] border border-[#2e324a] text-white text-xs font-bold focus:outline-none focus:border-red-500 capitalize"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Thoughts / Player Notes */}
          <div className="p-4 rounded-2xl bg-[#151726]/90 border border-[#23263b] space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span>Thoughts / Player Notes</span>
              </span>
              <span className="text-[10px] text-gray-500 font-normal">Optional</span>
            </label>
            <textarea
              value={thoughts}
              onChange={(e) => setThoughts(e.target.value)}
              placeholder="Your honest thoughts, deaths at 90%+, fluke stories, worst fails..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1c1f30] border border-[#2d3148] text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all custom-scrollbar resize-none"
            />
          </div>

          {/* Section 6: YouTube Completion Video */}
          <div className="p-4 rounded-2xl bg-[#151726]/90 border border-[#23263b] space-y-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Youtube className="w-4 h-4 text-red-500 fill-red-500" />
                <span className="text-gray-200">YouTube Completion Video</span>
              </span>
              <span className="text-[10px] text-gray-500 font-normal">Optional</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#1c1f30] border border-[#2d3148] text-xs font-mono text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500/80 focus:ring-2 focus:ring-red-500/20 transition-all"
              />
              <Youtube className="w-4 h-4 text-gray-500 absolute left-3.5 top-3 pointer-events-none" />
              {videoUrl && (
                <button
                  type="button"
                  onClick={() => setVideoUrl('')}
                  className="p-1 rounded-lg text-gray-400 hover:text-white absolute right-2.5 top-2.5 transition-colors"
                  title="Clear video URL"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live YouTube Thumbnail Preview */}
            {(() => {
              const previewThumb = getYouTubeThumbnail(videoUrl);
              const previewWatch = getYouTubeWatchUrl(videoUrl);

              if (previewThumb) {
                return (
                  <div className="relative aspect-video rounded-xl bg-black/80 border border-[#2c3048] overflow-hidden group shadow-lg">
                    <img
                      src={previewThumb}
                      alt="YouTube video thumbnail preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 rounded-2xl bg-red-600/90 text-white flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                );
              }

              if (videoUrl.trim()) {
                return (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Please enter a valid YouTube video link (e.g. youtube.com/watch?v=... or youtu.be/...)</span>
                  </div>
                );
              }

              return (
                <p className="text-[11px] text-gray-500 italic">
                  Paste your completion YouTube video link to display its official video thumbnail and enable one-click watching on the card.
                </p>
              );
            })()}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#23263b] bg-[#141523]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-[#202235] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl ${theme.saveButton} text-white text-xs font-black shadow-lg transition-all active:scale-95 tracking-wide uppercase font-['Outfit']`}
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isEditing ? 'Save Changes' : 'Add Level'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};
