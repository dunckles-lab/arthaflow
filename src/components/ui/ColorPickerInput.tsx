'use client';

import React from 'react';
import { Pipette } from 'lucide-react';

interface ColorPickerInputProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  presets?: string[];
}

export const ColorPickerInput: React.FC<ColorPickerInputProps> = ({
  value,
  onChange,
  label = 'Pilihan Warna',
  presets = [
    '#10b981', // emerald
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#f59e0b', // amber
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f43f5e', // rose
    '#14b8a6', // teal
    '#6366f1', // indigo
    '#64748b', // slate
  ],
}) => {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-medium text-slate-300">{label}</label>}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Native Color Picker Box */}
        <div className="relative flex items-center bg-[#0a0b10] border border-[#1e2436] rounded-xl p-1 gap-2 shrink-0">
          <input
            type="color"
            value={value || '#3b82f6'}
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
            title="Buka Color Picker"
          />
          <span className="text-[11px] font-mono text-slate-300 pr-2 uppercase select-all">
            {value || '#3b82f6'}
          </span>
        </div>

        {/* Quick Color Palette Swatches */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              className={`w-6 h-6 rounded-lg transition-transform cursor-pointer ${
                value.toLowerCase() === preset.toLowerCase()
                  ? 'scale-110 ring-2 ring-white shadow-md'
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: preset }}
              title={preset}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
