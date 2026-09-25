import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Clock } from 'lucide-react';

interface CustomDatePickerProps {
  value: string;
  onChange: (formattedDate: string) => void;
  label?: string;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const FULL_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Formats date into exact format: "Jun 27th - 2026"
export const formatGDDate = (date: Date): string => {
  const month = MONTH_NAMES[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return `${month} ${getOrdinal(day)} - ${year}`;
};

// Parses GD formatted date "Jun 27th - 2026" or "07/02/2026" or standard date strings
export const parseGDDate = (str: string): Date | null => {
  if (!str || str.toLowerCase() === 'unknown') return null;
  const cleaned = str
    .replace(/(\d+)(st|nd|rd|th)/gi, '$1')
    .replace(/[-–—]/g, ' ')
    .trim();
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? null : d;
};

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  label = 'Date Beaten',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize active viewing month & year from current value or today
  const initialDate = parseGDDate(value) || new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  // Close calendar dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // When value changes from outside, sync view if valid
  useEffect(() => {
    const parsed = parseGDDate(value);
    if (parsed) {
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
    }
  }, [value]);

  const selectedDate = parseGDDate(value);

  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const chosen = new Date(viewYear, viewMonth, day);
    onChange(formatGDDate(chosen));
    setIsOpen(false);
  };

  const handleSetToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    onChange(formatGDDate(today));
    setIsOpen(false);
  };

  const handleSetUnknown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('Unknown');
    setIsOpen(false);
  };

  // Generate day cells for calendar grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const isCurrentSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === viewYear &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getDate() === day
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span>{label}</span>
        </label>
      )}

      {/* Input Box Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 rounded-xl bg-[#1c1f30] border transition-all cursor-pointer flex items-center justify-between text-sm ${
          isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
            : 'border-[#2d3148] hover:border-gray-500'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className={`font-semibold ${value ? 'text-white' : 'text-gray-500'}`}>
            {value || 'Select date beaten...'}
          </span>
        </div>

        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#25283b] transition-colors"
            title="Clear date"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Custom Calendar Dropdown Popup */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 w-full max-w-[320px] rounded-2xl bg-[#131422] border border-[#2d314b] shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-4 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl">
          {/* Calendar Header: Month, Year, Nav */}
          <div className="flex items-center justify-between mb-3.5 px-1">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#222538] transition-colors active:scale-95 border border-transparent hover:border-[#2f3248]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center font-['Outfit'] font-extrabold text-sm text-white">
              <span>{FULL_MONTH_NAMES[viewMonth]}</span>{' '}
              <span className="text-indigo-400 font-mono">{viewYear}</span>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#222538] transition-colors active:scale-95 border border-transparent hover:border-[#2f3248]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {DAYS_OF_WEEK.map((d) => (
              <span key={d} className="text-[11px] font-bold text-gray-500">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Previous month filler days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => {
              const dayNum = prevMonthDays - firstDayIndex + 1 + i;
              return (
                <div
                  key={`prev-${i}`}
                  className="h-8 flex items-center justify-center text-xs text-gray-600 font-medium select-none"
                >
                  {dayNum}
                </div>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = isCurrentSelected(day);
              const isTodayDate = isToday(day);

              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 w-8 mx-auto rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-600/50 font-bold scale-105'
                      : isTodayDate
                      ? 'border border-indigo-400/60 text-indigo-300 hover:bg-[#25283c]'
                      : 'text-gray-300 hover:text-white hover:bg-[#222538]'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick Buttons Footer */}
          <div className="flex items-center justify-between gap-1.5 mt-4 pt-3 border-t border-[#23263b] text-xs">
            <button
              type="button"
              onClick={handleSetToday}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1e2133] hover:bg-[#282d46] text-indigo-300 font-medium transition-colors"
            >
              <Clock className="w-3 h-3" />
              <span>Today</span>
            </button>

            <button
              type="button"
              onClick={handleSetUnknown}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                value === 'Unknown'
                  ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                  : 'bg-[#1c1e2e] hover:bg-[#25283b] text-gray-300 hover:text-white'
              }`}
            >
              Unknown
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                setIsOpen(false);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#1c1e2e] hover:bg-[#25283b] text-gray-400 hover:text-white transition-colors"
              title="Clear date"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
