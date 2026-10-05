'use client';

import React from 'react';
import { useFinance } from '@/lib/store';
import { PeriodType } from '@/types';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export const PeriodSelector: React.FC = () => {
  const { periodFilter, setPeriodFilter } = useFinance();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handleTypeChange = (type: PeriodType) => {
    setPeriodFilter((prev) => ({ ...prev, type }));
  };

  const handlePrevMonth = () => {
    setPeriodFilter((prev) => {
      let newMonth = prev.selectedMonth - 1;
      let newYear = prev.selectedYear;
      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      }
      return { ...prev, selectedMonth: newMonth, selectedYear: newYear };
    });
  };

  const handleNextMonth = () => {
    setPeriodFilter((prev) => {
      let newMonth = prev.selectedMonth + 1;
      let newYear = prev.selectedYear;
      if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }
      return { ...prev, selectedMonth: newMonth, selectedYear: newYear };
    });
  };

  const handlePrevYear = () => {
    setPeriodFilter((prev) => ({ ...prev, selectedYear: prev.selectedYear - 1 }));
  };

  const handleNextYear = () => {
    setPeriodFilter((prev) => ({ ...prev, selectedYear: prev.selectedYear + 1 }));
  };

  return (
    <div className="bg-white dark:bg-[#12141d] border border-slate-200 dark:border-[#1e2436] rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shadow-sm transition-colors">
      {/* Segmented Control Tabs */}
      <div className="grid grid-cols-4 gap-1 bg-slate-50 dark:bg-[#0a0b10] p-1 rounded-xl border border-slate-200 dark:border-[#1e2436]">
        {(['daily', 'monthly', 'yearly', 'custom'] as PeriodType[]).map((type) => {
          const labels: Record<PeriodType, string> = {
            daily: 'Harian',
            monthly: 'Bulan',
            yearly: 'Tahun',
            custom: 'Kustom',
          };
          const isActive = periodFilter.type === type;
          return (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`py-1.5 px-2 text-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#12141d]'
              }`}
            >
              {labels[type]}
            </button>
          );
        })}
      </div>

      {/* Date Controls per Period */}
      <div className="flex items-center justify-between sm:justify-end gap-2">
        {periodFilter.type === 'daily' && (
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0a0b10] border border-slate-200 dark:border-[#1e2436] rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 w-full sm:w-auto justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Tanggal:</span>
            </div>
            <input
              type="date"
              value={periodFilter.selectedDate}
              onChange={(e) =>
                setPeriodFilter((prev) => ({ ...prev, selectedDate: e.target.value }))
              }
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none text-xs cursor-pointer"
            />
          </div>
        )}

        {periodFilter.type === 'monthly' && (
          <div className="flex items-center justify-between bg-slate-50 dark:bg-[#0a0b10] border border-slate-200 dark:border-[#1e2436] rounded-xl p-1 w-full sm:w-auto">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-[#1e2436] rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-bold text-slate-900 dark:text-slate-200 text-center flex-1 sm:flex-initial sm:min-w-[140px]">
              {monthNames[periodFilter.selectedMonth]} {periodFilter.selectedYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-[#1e2436] rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {periodFilter.type === 'yearly' && (
          <div className="flex items-center justify-between bg-slate-50 dark:bg-[#0a0b10] border border-slate-200 dark:border-[#1e2436] rounded-xl p-1 w-full sm:w-auto">
            <button
              onClick={handlePrevYear}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-[#1e2436] rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              title="Tahun Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 text-xs font-bold text-slate-900 dark:text-slate-200 text-center flex-1 sm:flex-initial">
              Tahun {periodFilter.selectedYear}
            </span>
            <button
              onClick={handleNextYear}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-[#1e2436] rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              title="Tahun Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {periodFilter.type === 'custom' && (
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <div className="flex-1 sm:flex-initial flex items-center gap-1 bg-slate-50 dark:bg-[#0a0b10] border border-slate-200 dark:border-[#1e2436] rounded-xl px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200">
              <input
                type="date"
                value={periodFilter.startDate}
                onChange={(e) =>
                  setPeriodFilter((prev) => ({ ...prev, startDate: e.target.value }))
                }
                className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none text-[11px] w-full"
              />
            </div>
            <span className="text-slate-400 text-xs">-</span>
            <div className="flex-1 sm:flex-initial flex items-center gap-1 bg-slate-50 dark:bg-[#0a0b10] border border-slate-200 dark:border-[#1e2436] rounded-xl px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200">
              <input
                type="date"
                value={periodFilter.endDate}
                onChange={(e) =>
                  setPeriodFilter((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none text-[11px] w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
