'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  badge?: string;
  icon?: React.ReactNode;
  description?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Pilih opsi...',
  label,
  disabled = false,
  className = '',
  id,
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

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

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef} id={id}>
      {label && (
        <label className="block text-xs font-medium text-slate-300 dark:text-slate-300 light-text-label mb-1">
          {label}
        </label>
      )}

      {/* Select Trigger Box */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 rounded-xl border font-medium transition-all duration-150 cursor-pointer text-left select-trigger ${
          size === 'sm'
            ? 'px-2.5 py-1.5 text-xs'
            : size === 'lg'
            ? 'px-3.5 py-3 text-sm'
            : 'px-3 py-2 sm:py-2.5 text-xs sm:text-sm'
        } ${
          isOpen
            ? 'bg-[#12141d] border-emerald-500/60 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/5'
            : 'bg-[#0a0b10] hover:bg-[#12141d] border-[#1e2436] hover:border-slate-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selectedOption?.icon && (
            <span className="shrink-0 text-slate-400">{selectedOption.icon}</span>
          )}
          <span className={`truncate ${selectedOption ? 'text-slate-100 select-value-text' : 'text-slate-500'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono shrink-0">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-emerald-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Options Popup */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 p-1 rounded-xl bg-[#12141d] border border-[#1e2436] shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto select-dropdown-menu">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-500 text-center">
              Tidak ada pilihan
            </div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs transition-all cursor-pointer select-option-item ${
                    isSelected
                      ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/20'
                      : 'text-slate-300 hover:bg-[#1a1e2d] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 text-left">
                    {option.icon && (
                      <span className={`shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {option.icon}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{option.label}</p>
                      {option.description && (
                        <p className="text-[10px] text-slate-500 truncate">{option.description}</p>
                      )}
                    </div>
                    {option.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono shrink-0">
                        {option.badge}
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 stroke-[2.5]" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
