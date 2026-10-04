'use client';

import React, { useState, useEffect } from 'react';
import {
  formatNumberWithDots,
  parseFormattedNumber,
  formatTerbilangRupiah,
  formatCompactUnit,
} from '@/lib/currency';

interface AmountInputProps {
  value: number | string;
  onChange: (numericVal: number) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  colorScheme?: 'emerald' | 'rose' | 'indigo' | 'purple' | 'amber';
  showPresets?: boolean;
  presets?: number[];
  max?: number;
  className?: string;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  label = 'Nominal (IDR)',
  placeholder = '0',
  required = false,
  colorScheme = 'emerald',
  showPresets = true,
  presets = [50000, 100000, 500000, 1000000, 5000000],
  max,
  className = '',
}) => {
  const numValue = typeof value === 'string' ? parseFormattedNumber(value) : value || 0;
  const [displayValue, setDisplayValue] = useState<string>(
    numValue > 0 ? formatNumberWithDots(numValue) : ''
  );

  useEffect(() => {
    const incomingNum = typeof value === 'string' ? parseFormattedNumber(value) : value || 0;
    setDisplayValue(incomingNum > 0 ? formatNumberWithDots(incomingNum) : '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawText = e.target.value;
    const cleanDigits = rawText.replace(/[^0-9]/g, '');

    if (!cleanDigits) {
      setDisplayValue('');
      onChange(0);
      return;
    }

    let parsed = parseInt(cleanDigits, 10);
    if (max !== undefined && parsed > max) {
      parsed = max;
    }

    setDisplayValue(formatNumberWithDots(parsed));
    onChange(parsed);
  };

  const handleAddPreset = (amountToAdd: number) => {
    let nextVal = numValue + amountToAdd;
    if (max !== undefined && nextVal > max) {
      nextVal = max;
    }
    setDisplayValue(formatNumberWithDots(nextVal));
    onChange(nextVal);
  };

  const terbilangText = formatTerbilangRupiah(numValue);
  const compactText = formatCompactUnit(numValue);

  const getBorderFocusClass = () => {
    switch (colorScheme) {
      case 'rose':
        return 'focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30';
      case 'indigo':
        return 'focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30';
      case 'purple':
        return 'focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30';
      case 'amber':
        return 'focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30';
      default:
        return 'focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30';
    }
  };

  const getBadgeColor = () => {
    switch (colorScheme) {
      case 'rose':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
      case 'indigo':
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
      case 'purple':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
      case 'amber':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-slate-300">{label}</label>
          {numValue > 0 && (
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-semibold border ${getBadgeColor()}`}>
              {compactText}
            </span>
          )}
        </div>
      )}

      {/* Input container with prefix */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-xs font-bold font-mono text-slate-400">
          Rp
        </div>
        <input
          type="text"
          inputMode="numeric"
          required={required}
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full bg-[#0a0b10] border border-[#1e2436] rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-semibold text-slate-100 font-mono tracking-wide placeholder:text-slate-600 focus:outline-none transition-all ${getBorderFocusClass()}`}
        />
      </div>

      {/* Real-time Indonesian Terbilang Word & Unit Hint */}
      {numValue > 0 && (
        <div className="flex items-start gap-1 px-1 py-0.5 text-[11px] text-slate-400 italic">
          <span className="shrink-0 text-slate-500">&bull;</span>
          <span className="leading-snug">{terbilangText}</span>
        </div>
      )}

      {/* Quick Increment Shortcut Pills */}
      {showPresets && presets && presets.length > 0 && (
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-0.5 no-scrollbar">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleAddPreset(preset)}
              className="px-2 py-1 rounded-lg bg-[#12141d] hover:bg-[#1e2436] border border-[#1e2436] text-[10px] font-mono font-medium text-slate-300 transition-colors whitespace-nowrap active:scale-95 cursor-pointer"
            >
              +{formatCompactUnit(preset).replace('Rp ', '')}
            </button>
          ))}
          {numValue > 0 && (
            <button
              type="button"
              onClick={() => {
                setDisplayValue('');
                onChange(0);
              }}
              className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-[10px] font-mono font-medium text-rose-400 transition-colors whitespace-nowrap active:scale-95 cursor-pointer ml-auto"
            >
              Reset
            </button>
          )}
        </div>
      )}
    </div>
  );
};
