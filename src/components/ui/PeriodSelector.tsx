'use client';

import React from 'react';
import { useFinance } from '@/lib/store';
import { PeriodType } from '@/types';
import { Calendar, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

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
    <div className="bg-[#12141d] border border-[#1e2436] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
      {/* Type Tabs */}
      <div className="flex items-center gap-1 bg-[#0a0b10] p-1 rounded-lg border border-[#1e2436]">
        {(['daily', 'monthly', 'yearly', 'custom'] as PeriodType[]).map((type) => {
          const labels: Record<PeriodType, string> = {
            daily: 'Harian',
            monthly: 'Bulanan',
            yearly: 'Tahunan',
            custom: 'Kustom',
          };
          const isActive = periodFilter.type === type;
          return (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#12141d]'
              }`}
            >
              {labels[type]}
            </button>
          );
        })}
      </div>

      {/* Controls per Period */}
      <div className="flex items-center gap-2">
        {periodFilter.type === 'daily' && (
          <div className="flex items-center gap-2 bg-[#0a0b10] border border-[#1e2436] rounded-lg px-3 py-1.5 text-xs text-slate-200">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <input
              type="date"
              value={periodFilter.selectedDate}
              onChange={(e) =>
                setPeriodFilter((prev) => ({ ...prev, selectedDate: e.target.value }))
              }
              className="bg-transparent text-slate-200 focus:outline-none text-xs"
            />
          </div>
        )}

        {periodFilter.type === 'monthly' && (
          <div className="flex items-center gap-1 bg-[#0a0b10] border border-[#1e2436] rounded-lg p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-[#1e2436] rounded text-slate-400 hover:text-slate-200"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-semibold text-slate-200 min-w-[130px] text-center">
              {monthNames[periodFilter.selectedMonth]} {periodFilter.selectedYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-[#1e2436] rounded text-slate-400 hover:text-slate-200"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {periodFilter.type === 'yearly' && (
          <div className="flex items-center gap-1 bg-[#0a0b10] border border-[#1e2436] rounded-lg p-1">
            <button
              onClick={handlePrevYear}
              className="p-1 hover:bg-[#1e2436] rounded text-slate-400 hover:text-slate-200"
              title="Tahun Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-slate-200">
              Tahun {periodFilter.selectedYear}
            </span>
            <button
              onClick={handleNextYear}
              className="p-1 hover:bg-[#1e2436] rounded text-slate-400 hover:text-slate-200"
              title="Tahun Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {periodFilter.type === 'custom' && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#0a0b10] border border-[#1e2436] rounded-lg px-2.5 py-1.5 text-xs text-slate-200">
              <span className="text-slate-400 text-[10px]">Mulai:</span>
              <input
                type="date"
                value={periodFilter.startDate}
                onChange={(e) =>
                  setPeriodFilter((prev) => ({ ...prev, startDate: e.target.value }))
                }
                className="bg-transparent text-slate-200 focus:outline-none text-xs"
              />
            </div>
            <span className="text-slate-400 text-xs">s/d</span>
            <div className="flex items-center gap-1.5 bg-[#0a0b10] border border-[#1e2436] rounded-lg px-2.5 py-1.5 text-xs text-slate-200">
              <span className="text-slate-400 text-[10px]">Selesai:</span>
              <input
                type="date"
                value={periodFilter.endDate}
                onChange={(e) =>
                  setPeriodFilter((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="bg-transparent text-slate-200 focus:outline-none text-xs"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
