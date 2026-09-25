import React, { useState, useMemo } from 'react';
import { PlayerLevelRecord, SharedLevelRecord, DemonRating, TabId } from '../types';
import {
  Trophy,
  Flame,
  Zap,
  Award,
  Target,
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  Swords,
  CheckCircle2,
  Search,
  Filter,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { DifficultyBadge, RatingIcon } from './DifficultyBadge';

interface StatsDashboardProps {
  ashritLevels: PlayerLevelRecord[];
  arshLevels: PlayerLevelRecord[];
  sharedLevels: SharedLevelRecord[];
  onNavigateToTab?: (tab: TabId) => void;
}

const isDemonOrImpossible = (rating?: string): boolean => {
  if (!rating) return false;
  const r = rating.toLowerCase();
  return r.includes('demon') || r.includes('impossible') || r.includes('immpossible');
};

const isPlayerLevelBeaten = (l?: PlayerLevelRecord | null): boolean => {
  if (!l) return false;
  return Boolean(
    (l.attempts !== undefined && l.attempts !== null && l.attempts.toString().trim() !== '') ||
    (l.date && l.date.trim() !== '')
  );
};

interface ComparedDemon {
  id: string;
  name: string;
  cleanName: string;
  levelId: string;
  rating: DemonRating;
  ashritDone: boolean;
  ashritAttempts?: string | number;
  ashritDate?: string;
  arshDone: boolean;
  arshAttempts?: string | number;
  arshDate?: string;
}

const DEMON_DIFFICULTY_RANK: Record<string, number> = {
  impossible: 10,
  immpossible: 10,
  'extreme demon': 9,
  'insane demon': 8,
  'hard demon': 7,
  'medium demon': 6,
  'easy demon': 5,
};

const DEMON_FILTER_RATINGS: DemonRating[] = [
  'Easy Demon',
  'Medium Demon',
  'Hard Demon',
  'Insane Demon',
  'Extreme Demon',
];

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  ashritLevels,
  arshLevels,
  sharedLevels,
  onNavigateToTab,
}) => {
  // Calculations for Ashrit
  const ashritAttempts = ashritLevels.reduce((acc, curr) => {
    const num = Number(curr.attempts);
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  const ashritHardest = ashritLevels.find((l) => l.currentHardest) || ashritLevels[0];
  const ashritDemonsCount = ashritLevels.filter(isPlayerLevelBeaten).length;

  // Calculations for Arsh
  const arshAttempts = arshLevels.reduce((acc, curr) => {
    const num = Number(curr.attempts);
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  const arshHardest = arshLevels.find((l) => l.currentHardest) || arshLevels[0];
  const arshDemonsCount = arshLevels.filter(isPlayerLevelBeaten).length;

  // Shared completion stats
  const ashritSharedDone = sharedLevels.filter((l) => l.ashritStatus === 'done').length;
  const ashritSharedAttempted = sharedLevels.filter((l) => l.ashritStatus === 'attempted').length;

  const arshSharedDone = sharedLevels.filter((l) => l.arshStatus === 'done').length;
  const arshSharedAttempted = sharedLevels.filter((l) => l.arshStatus === 'attempted').length;

  const bothDone = sharedLevels.filter((l) => l.ashritStatus === 'done' && l.arshStatus === 'done');

  // State for Demon Comparison
  type CompareFilter = 'all' | 'both' | 'ashrit' | 'arsh';
  const [compareFilter, setCompareFilter] = useState<CompareFilter>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [compareSearch, setCompareSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isComparisonCollapsed, setIsComparisonCollapsed] = useState<boolean>(false);

  const handleCopyId = (levelId: string) => {
    if (!levelId) return;
    navigator.clipboard.writeText(levelId);
    setCopiedId(levelId);
    setTimeout(() => {
      setCopiedId((prev) => (prev === levelId ? null : prev));
    }, 2000);
  };

  // Compile list of unique demons beaten by either player ONLY from their personal pages
  const comparedDemons = useMemo(() => {
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const demonMap = new Map<string, ComparedDemon>();

    const findExisting = (name: string, levelId: string) => {
      const cleanId = (levelId || '').trim();
      const cleanName = normalize(name || '');

      for (const entry of demonMap.values()) {
        if (cleanId && cleanId !== '0' && entry.levelId && entry.levelId !== '0' && entry.levelId === cleanId) {
          return entry;
        }
        if (cleanName && entry.cleanName === cleanName) {
          return entry;
        }
      }
      return null;
    };

    // 1. Process Ashrit's personal demons list
    ashritLevels.forEach((l) => {
      const beaten = isPlayerLevelBeaten(l);
      let entry = findExisting(l.name, l.levelId);
      let cleanId = (l.levelId || '').trim();
      if (normalize(l.name) === 'b' && !cleanId) cleanId = '34085027';
      if (cleanId === '5904109') cleanId = '590410';

      if (!entry) {
        const key = cleanId && cleanId !== '0' ? `id:${cleanId}` : `name:${normalize(l.name)}`;
        entry = {
          id: key,
          name: l.name.trim(),
          cleanName: normalize(l.name),
          levelId: cleanId,
          rating: l.demonRating || 'Easy Demon',
          ashritDone: beaten,
          ashritAttempts: l.attempts,
          ashritDate: l.date,
          arshDone: false,
        };
        demonMap.set(key, entry);
      } else {
        if (beaten) entry.ashritDone = true;
        if (l.attempts) entry.ashritAttempts = l.attempts;
        if (l.date) entry.ashritDate = l.date;
        if (l.demonRating) entry.rating = l.demonRating;
        if (!entry.levelId && cleanId) entry.levelId = cleanId;
      }
    });

    // 2. Process Arsh's personal demons list
    arshLevels.forEach((l) => {
      const beaten = isPlayerLevelBeaten(l);
      let entry = findExisting(l.name, l.levelId);
      let cleanId = (l.levelId || '').trim();
      if (cleanId === '5904109') cleanId = '590410';

      if (!entry) {
        const key = cleanId && cleanId !== '0' ? `id:${cleanId}` : `name:${normalize(l.name)}`;
        entry = {
          id: key,
          name: l.name.trim(),
          cleanName: normalize(l.name),
          levelId: cleanId,
          rating: l.demonRating || 'Easy Demon',
          ashritDone: false,
          arshDone: beaten,
          arshAttempts: l.attempts,
          arshDate: l.date,
        };
        demonMap.set(key, entry);
      } else {
        if (beaten) entry.arshDone = true;
        if (l.attempts) entry.arshAttempts = l.attempts;
        if (l.date) entry.arshDate = l.date;
        if (!entry.levelId && cleanId) entry.levelId = cleanId;
        if (l.demonRating) entry.rating = l.demonRating;
      }
    });

    // Cross-link uncompleted attempt/date info if recorded
    ashritLevels.forEach((l) => {
      const entry = findExisting(l.name, l.levelId);
      if (entry && !entry.ashritAttempts && l.attempts) {
        entry.ashritAttempts = l.attempts;
      }
      if (entry && !entry.ashritDate && l.date) {
        entry.ashritDate = l.date;
      }
    });

    arshLevels.forEach((l) => {
      const entry = findExisting(l.name, l.levelId);
      if (entry && !entry.arshAttempts && l.attempts) {
        entry.arshAttempts = l.attempts;
      }
      if (entry && !entry.arshDate && l.date) {
        entry.arshDate = l.date;
      }
    });

    // Only include demons beaten by at least one of the two players (strictly excludes wishlist & unattempted levels)
    const list = Array.from(demonMap.values()).filter((d) => d.ashritDone || d.arshDone);

    // Standardize level names for clean display
    list.forEach((d) => {
      if (d.cleanName === 'machinedeluxxe' || d.cleanName === 'machinadeluxxe') {
        d.name = 'Machine Deluxxe';
      }
      if (d.cleanName === 'b' && !d.levelId) {
        d.levelId = '34085027';
      }
    });

    // Sort: Demons beaten by both first, then difficulty rank descending, then alphabetical
    list.sort((a, b) => {
      const aBoth = a.ashritDone && a.arshDone ? 1 : 0;
      const bBoth = b.ashritDone && b.arshDone ? 1 : 0;
      if (bBoth !== aBoth) return bBoth - aBoth;

      const aRank = DEMON_DIFFICULTY_RANK[a.rating?.toLowerCase()] || 0;
      const bRank = DEMON_DIFFICULTY_RANK[b.rating?.toLowerCase()] || 0;
      if (bRank !== aRank) return bRank - aRank;

      return a.name.localeCompare(b.name);
    });

    return list;
  }, [ashritLevels, arshLevels]);

  const bothBeatenCount = comparedDemons.filter((d) => d.ashritDone && d.arshDone).length;
  const ashritTotalBeaten = comparedDemons.filter((d) => d.ashritDone).length;
  const arshTotalBeaten = comparedDemons.filter((d) => d.arshDone).length;

  // Available ratings in compared demons for the filter dropdown
  const availableRatings = useMemo(() => {
    const list = [...DEMON_FILTER_RATINGS];
    comparedDemons.forEach((d) => {
      if (d.rating && !list.includes(d.rating)) {
        list.push(d.rating);
      }
    });
    return list;
  }, [comparedDemons]);

  // Filter demons based on player filter, demon rating filter, and search query
  const filteredDemons = useMemo(() => {
    return comparedDemons.filter((d) => {
      if (compareFilter === 'both' && !(d.ashritDone && d.arshDone)) return false;
      if (compareFilter === 'ashrit' && !d.ashritDone) return false;
      if (compareFilter === 'arsh' && !d.arshDone) return false;

      if (ratingFilter !== 'all') {
        const dRating = (d.rating || '').toLowerCase();
        const rFilter = ratingFilter.toLowerCase();
        if (dRating !== rFilter) return false;
      }

      if (compareSearch.trim()) {
        const q = compareSearch.toLowerCase().trim();
        const matchName = d.name.toLowerCase().includes(q);
        const matchId = (d.levelId || '').includes(q);
        const matchRating = (d.rating || '').toLowerCase().includes(q);
        if (!matchName && !matchId && !matchRating) return false;
      }

      return true;
    });
  }, [comparedDemons, compareFilter, ratingFilter, compareSearch]);

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      
      {/* Top Banner: Head to Head */}
      <div className="relative rounded-2xl bg-gradient-to-r from-indigo-950/60 via-[#181a28] to-red-950/60 border border-[#2d3047] p-6 shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          
          {/* Ashrit Column */}
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border-2 border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-600/20">
              <Flame className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Player 1</span>
              <h2 className="text-2xl font-black text-white font-['Outfit']">Ashrit</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-gray-400">{ashritDemonsCount} Demons Beaten</p>
                {onNavigateToTab && (
                  <button
                    onClick={() => onNavigateToTab('ashrit')}
                    className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1 group/btn"
                  >
                    <span>View Showcase</span>
                    <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* VS Badge */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#1e2030] border-2 border-amber-400/60 flex items-center justify-center text-amber-300 font-black text-sm shadow-[0_0_15px_rgba(251,191,36,0.3)]">
              VS
            </div>
            <span className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Friendly Rivalry</span>
          </div>

          {/* Arsh Column */}
          <div className="flex items-center gap-4 text-right flex-row-reverse md:flex-row">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-400">Player 2</span>
              <h2 className="text-2xl font-black text-white font-['Outfit']">Arsh</h2>
              <div className="flex items-center justify-end gap-2 mt-0.5">
                {onNavigateToTab && (
                  <button
                    onClick={() => onNavigateToTab('arsh')}
                    className="text-[11px] font-semibold text-red-400 hover:text-red-300 transition-colors inline-flex items-center gap-1 group/btn"
                  >
                    <ArrowRight className="w-3 h-3 rotate-180 group-hover/btn:-translate-x-0.5 transition-transform" />
                    <span>View Showcase</span>
                  </button>
                )}
                <p className="text-xs text-gray-400">{arshDemonsCount} Demons Beaten</p>
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-red-600/20 border-2 border-red-500/40 flex items-center justify-center text-red-400 shadow-lg shadow-red-600/20">
              <Target className="w-7 h-7" />
            </div>
          </div>

        </div>
      </div>

      {/* Current Hardest Demons Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Ashrit's Hardest */}
        <div className="rounded-2xl bg-[#161724] border border-indigo-500/30 p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              Ashrit's Current Hardest
            </span>
            {ashritHardest && <DifficultyBadge rating={ashritHardest.demonRating} size="sm" />}
          </div>

          {ashritHardest ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3.5">
                <div className="p-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-md">
                  <RatingIcon rating={ashritHardest.demonRating} className="w-14 h-14" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white font-['Outfit']">{ashritHardest.name}</h3>
                  <span className="text-xs text-gray-400 font-mono">ID: {ashritHardest.levelId}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="p-2.5 rounded-xl bg-[#11121d] border border-[#222436]">
                  <span className="text-[10px] text-gray-400 block">Total Attempts</span>
                  <span className="text-sm font-bold text-amber-300 font-mono">
                    {Number(ashritHardest.attempts).toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#11121d] border border-[#222436]">
                  <span className="text-[10px] text-gray-400 block">Completion Date</span>
                  <span className="text-xs font-semibold text-white">{ashritHardest.date || 'Unknown'}</span>
                </div>
              </div>

              {ashritHardest.thoughts && (
                <div className="p-3 rounded-xl bg-[#10111a] border border-[#212336] text-xs text-gray-300 italic">
                  "{ashritHardest.thoughts}"
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No hardest demon marked yet.</p>
          )}
        </div>

        {/* Arsh's Hardest */}
        <div className="rounded-2xl bg-[#161724] border border-red-500/30 p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              Arsh's Current Hardest
            </span>
            {arshHardest && <DifficultyBadge rating={arshHardest.demonRating} size="sm" />}
          </div>

          {arshHardest ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3.5">
                <div className="p-2 rounded-2xl bg-red-500/10 border border-red-500/20 shadow-md">
                  <RatingIcon rating={arshHardest.demonRating} className="w-14 h-14" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white font-['Outfit']">{arshHardest.name}</h3>
                  <span className="text-xs text-gray-400 font-mono">ID: {arshHardest.levelId}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="p-2.5 rounded-xl bg-[#11121d] border border-[#222436]">
                  <span className="text-[10px] text-gray-400 block">Total Attempts</span>
                  <span className="text-sm font-bold text-amber-300 font-mono">
                    {Number(arshHardest.attempts).toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#11121d] border border-[#222436]">
                  <span className="text-[10px] text-gray-400 block">Completion Date</span>
                  <span className="text-xs font-semibold text-white">{arshHardest.date || 'Unknown'}</span>
                </div>
              </div>

              {arshHardest.thoughts && (
                <div className="p-3 rounded-xl bg-[#10111a] border border-[#212336] text-xs text-gray-300 italic">
                  "{arshHardest.thoughts}"
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No hardest demon marked yet.</p>
          )}
        </div>

      </div>

      {/* Xbox-Style Demon Completion Comparison */}
      <div className="rounded-2xl bg-[#151622] border border-[#26283b] p-5 sm:p-6 shadow-xl space-y-5 transition-all">
        
        {/* Header & Stats Chips (Clickable to collapse/expand) */}
        <div
          onClick={() => setIsComparisonCollapsed((prev) => !prev)}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none group"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <Swords className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-black text-white font-['Outfit'] group-hover:text-indigo-300 transition-colors">
              Demon Completion Comparison
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#1e2030] text-gray-300 border border-[#2e3148] font-mono">
              {comparedDemons.length} Unique Demons
            </span>
          </div>

          {/* Quick Stats Badges & Collapse Arrow */}
          <div className="flex items-center gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Both Complete: <strong className="text-white font-mono">{bothBeatenCount}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-semibold shadow-sm">
                <Flame className="w-3.5 h-3.5 text-indigo-400" />
                <span>Ashrit: <strong className="text-white font-mono">{ashritTotalBeaten}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 font-semibold shadow-sm">
                <Target className="w-3.5 h-3.5 text-red-400" />
                <span>Arsh: <strong className="text-white font-mono">{arshTotalBeaten}</strong></span>
              </div>
            </div>

            {/* Collapse toggle button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsComparisonCollapsed((prev) => !prev);
              }}
              className="p-1.5 rounded-xl bg-[#1c1e2d] hover:bg-[#25283d] text-gray-400 hover:text-white border border-[#2c2f46] transition-all flex items-center justify-center shrink-0"
              title={isComparisonCollapsed ? 'Expand comparison' : 'Collapse comparison'}
              aria-label={isComparisonCollapsed ? 'Expand comparison' : 'Collapse comparison'}
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  isComparisonCollapsed ? '-rotate-90 text-gray-400' : 'rotate-0 text-white'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Collapsible Content */}
        {!isComparisonCollapsed && (
          <div className="space-y-5 animate-fadeIn">

        {/* Filter Controls: Player Tabs, Demon Rating Filter, Search Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1">
          {/* Player Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {(['all', 'both', 'ashrit', 'arsh'] as const).map((filter) => {
              const label =
                filter === 'all'
                  ? `All (${comparedDemons.length})`
                  : filter === 'both'
                  ? `Both (${bothBeatenCount})`
                  : filter === 'ashrit'
                  ? `Ashrit (${ashritTotalBeaten})`
                  : `Arsh (${arshTotalBeaten})`;
              const active = compareFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setCompareFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40'
                      : 'bg-[#191b29] hover:bg-[#202235] text-gray-400 hover:text-white border border-[#27293d]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Right Controls: Difficulty Filter + Search Box */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Difficulty Filter Dropdown (like Showcase) */}
            <div className="relative min-w-[155px]">
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full appearance-none pl-8 pr-8 py-1.5 rounded-xl bg-[#11121d] border border-[#272a40] text-xs font-semibold text-gray-300 hover:text-white cursor-pointer focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="all">All Difficulties</option>
                {availableRatings.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <Filter className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Search Box */}
            <div className="relative min-w-[180px] sm:w-56">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search demons or ID..."
                value={compareSearch}
                onChange={(e) => setCompareSearch(e.target.value)}
                className="w-full bg-[#11121d] border border-[#272a40] focus:border-indigo-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Filtered count badge */}
            {(ratingFilter !== 'all' || compareFilter !== 'all' || compareSearch.trim()) && (
              <span className="text-[11px] font-semibold text-gray-400 px-2.5 py-1 rounded-lg bg-[#11121d] border border-[#272a40] whitespace-nowrap">
                {filteredDemons.length} of {comparedDemons.length}
              </span>
            )}
          </div>
        </div>

        {/* Player Headers Label row */}
        <div className="flex items-center justify-between px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 pt-1">
          <div className="flex items-center gap-2 text-indigo-400">
            <Flame className="w-3.5 h-3.5" />
            <span>Ashrit</span>
          </div>
          <span className="text-gray-400 text-[10px]">Level Details</span>
          <div className="flex items-center gap-2 text-red-400">
            <span>Arsh</span>
            <Target className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Render Card Helper Function */}
        {(() => {
          const renderDemonCard = (demon: ComparedDemon) => {
            const isBoth = demon.ashritDone && demon.arshDone;
            return (
              <div
                key={demon.id}
                className="group relative rounded-2xl bg-[#121320] border border-[#24263b] hover:border-[#383c5e] p-3.5 sm:p-4 shadow-lg transition-all"
              >
                {/* Main Row */}
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                  {/* Ashrit Side (Left) */}
                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                    <div
                      className={`p-1 sm:p-1.5 rounded-xl border transition-all flex-shrink-0 ${
                        demon.ashritDone
                          ? 'bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.25)]'
                          : 'bg-[#181a29]/30 border-[#24273d]/30'
                      }`}
                    >
                      <RatingIcon
                        rating={demon.rating}
                        className={`w-7 h-7 sm:w-9 sm:h-9 transition-all ${
                          demon.ashritDone ? '' : 'grayscale opacity-25 contrast-75'
                        }`}
                      />
                    </div>
                    <div className="min-w-0 truncate">
                      <h4
                        className={`font-black font-['Outfit'] text-sm sm:text-base truncate transition-colors ${
                          demon.ashritDone ? 'text-white' : 'text-gray-400 font-semibold'
                        }`}
                        title={demon.name}
                      >
                        {demon.name}
                      </h4>
                      {demon.ashritDone ? (
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono mt-0.5">
                          {demon.ashritAttempts && (
                            <span className="text-amber-300 font-bold">
                              {Number(demon.ashritAttempts).toLocaleString()} att
                            </span>
                          )}
                          {demon.ashritDate && demon.ashritDate !== 'Unknown' && (
                            <span className="text-gray-400 text-[10px] hidden sm:inline">
                              • {demon.ashritDate}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 block mt-0.5 font-medium">
                          Not Beaten
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Center Column: Level ID Badge & Demon Difficulty Pill */}
                  <div className="flex flex-col items-center justify-center px-1 sm:px-2 flex-shrink-0 z-10">
                    {demon.levelId && demon.levelId !== '0' ? (
                      <button
                        onClick={() => handleCopyId(demon.levelId)}
                        title="Click to copy Level ID"
                        className="group/btn flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-[#181a2c] hover:bg-[#22253d] border border-[#2b2e47] hover:border-indigo-400/50 text-gray-400 hover:text-white transition-all text-[10px] sm:text-[11px] font-mono shadow-sm active:scale-95"
                      >
                        <span>ID: {demon.levelId}</span>
                        {copiedId === demon.levelId ? (
                          <Check className="w-3 h-3 text-emerald-400 animate-scaleIn" />
                        ) : (
                          <Copy className="w-3 h-3 text-gray-400 group-hover/btn:text-gray-300 transition-colors" />
                        )}
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-mono px-2 py-0.5 rounded bg-[#181a2c] border border-[#2b2e47]">
                        Main Level
                      </span>
                    )}
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mt-1">
                      {demon.rating}
                    </span>
                  </div>

                  {/* Arsh Side (Right) */}
                  <div className="flex items-center justify-end gap-2.5 sm:gap-3.5 min-w-0 flex-1 text-right">
                    <div className="min-w-0 truncate text-right">
                      <h4
                        className={`font-black font-['Outfit'] text-sm sm:text-base truncate transition-colors ${
                          demon.arshDone ? 'text-white' : 'text-gray-400 font-semibold'
                        }`}
                        title={demon.name}
                      >
                        {demon.name}
                      </h4>
                      {demon.arshDone ? (
                        <div className="flex items-center justify-end gap-2 text-[11px] text-gray-400 font-mono mt-0.5">
                          {demon.arshDate && demon.arshDate !== 'Unknown' && (
                            <span className="text-gray-400 text-[10px] hidden sm:inline">
                              {demon.arshDate} •
                            </span>
                          )}
                          {demon.arshAttempts && (
                            <span className="text-amber-300 font-bold">
                              {Number(demon.arshAttempts).toLocaleString()} att
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 block mt-0.5 font-medium">
                          Not Beaten
                        </span>
                      )}
                    </div>
                    <div
                      className={`p-1 sm:p-1.5 rounded-xl border transition-all flex-shrink-0 ${
                        demon.arshDone
                          ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.25)]'
                          : 'bg-[#181a29]/30 border-[#24273d]/30'
                      }`}
                    >
                      <RatingIcon
                        rating={demon.rating}
                        className={`w-7 h-7 sm:w-9 sm:h-9 transition-all ${
                          demon.arshDone ? '' : 'grayscale opacity-25 contrast-75'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Xbox-Style Neon Progress Bar */}
                <div className="mt-3 relative w-full h-2 sm:h-2.5 rounded-full bg-[#0a0b12] border border-[#1e2034] overflow-hidden flex">
                  {isBoth ? (
                    /* Continuous full-width glowing mint green bar when both completed */
                    <div className="h-full w-full bg-gradient-to-r from-emerald-500 via-[#3ee39a] to-emerald-500 shadow-[0_0_14px_rgba(62,227,154,0.85)] transition-all duration-500" />
                  ) : (
                    /* Half glowing mint green bar on completed player side */
                    <>
                      {/* Ashrit Left Half */}
                      <div
                        className={`h-full w-1/2 transition-all duration-500 ${
                          demon.ashritDone
                            ? 'bg-gradient-to-r from-emerald-500 to-[#3ee39a] shadow-[0_0_12px_rgba(62,227,154,0.7)]'
                            : 'bg-transparent'
                        }`}
                      />
                      {/* Center Divider Notch */}
                      <div className="w-[1px] h-full bg-[#24273f] z-10 opacity-70" />
                      {/* Arsh Right Half */}
                      <div
                        className={`h-full w-1/2 transition-all duration-500 ${
                          demon.arshDone
                            ? 'bg-gradient-to-r from-[#3ee39a] to-emerald-500 shadow-[0_0_12px_rgba(62,227,154,0.7)]'
                            : 'bg-transparent'
                        }`}
                      />
                    </>
                  )}
                </div>
              </div>
            );
          };

          if (filteredDemons.length === 0) {
            return (
              <div className="text-center py-10 rounded-2xl bg-[#11121d] border border-[#222438] text-gray-400 text-xs">
                No demons match the selected filters or search query.
              </div>
            );
          }

          return (
            <div className="space-y-3">
              {filteredDemons.map(renderDemonCard)}
            </div>
          );
        })()}

          </div>
        )}

      </div>

      {/* Shared Fun List Progress Bar */}
      <div className="rounded-2xl bg-[#151622] border border-[#26283b] p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Shared Fun Levels Progress ({sharedLevels.length} Levels Total)
            </h3>
            <p className="text-xs text-gray-400">Tracking both players through the wish list</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
              {bothDone.length} Beaten Together!
            </span>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('shared')}
                className="text-xs font-semibold px-3 py-1 rounded-full bg-[#1c1e2d] hover:bg-[#25283d] text-amber-300 border border-[#2c2f46] hover:border-amber-400/40 transition-all inline-flex items-center gap-1 group/btn"
              >
                <span>View Wishlist</span>
                <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>

        {/* Ashrit Shared Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-gray-300">
            <span className="text-indigo-400">Ashrit: {ashritSharedDone} Done, {ashritSharedAttempted} Attempted</span>
            <span>{Math.round((ashritSharedDone / (sharedLevels.length || 1)) * 100)}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-[#1e2030] overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${(ashritSharedDone / (sharedLevels.length || 1)) * 100}%` }}
            ></div>
            <div
              className="bg-blue-500 h-full transition-all duration-500"
              style={{ width: `${(ashritSharedAttempted / (sharedLevels.length || 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Arsh Shared Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-gray-300">
            <span className="text-red-400">Arsh: {arshSharedDone} Done, {arshSharedAttempted} Attempted</span>
            <span>{Math.round((arshSharedDone / (sharedLevels.length || 1)) * 100)}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-[#1e2030] overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${(arshSharedDone / (sharedLevels.length || 1)) * 100}%` }}
            ></div>
            <div
              className="bg-blue-500 h-full transition-all duration-500"
              style={{ width: `${(arshSharedAttempted / (sharedLevels.length || 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] text-gray-400 pt-2 border-t border-[#232537]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <span>Done</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
            <span>Attempted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1e2030] border border-gray-600"></div>
            <span>Not Done</span>
          </div>
        </div>

      </div>

    </div>
  );
};
