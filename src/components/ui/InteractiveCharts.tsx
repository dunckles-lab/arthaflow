'use client';

import React from 'react';
import { useFinance } from '@/lib/store';
import { formatCurrency } from '@/lib/export';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

export const InteractiveCharts: React.FC = () => {
  const { transactions, categories, periodFilter } = useFinance();

  // Filter transactions according to selected period
  const filteredTransactions = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    if (periodFilter.type === 'daily') {
      return tx.date === periodFilter.selectedDate;
    } else if (periodFilter.type === 'monthly') {
      return (
        txDate.getMonth() === periodFilter.selectedMonth &&
        txDate.getFullYear() === periodFilter.selectedYear
      );
    } else if (periodFilter.type === 'yearly') {
      return txDate.getFullYear() === periodFilter.selectedYear;
    } else if (periodFilter.type === 'custom') {
      return tx.date >= periodFilter.startDate && tx.date <= periodFilter.endDate;
    }
    return true;
  });

  // Group transactions by date for trend chart
  const dateMap: Record<string, { date: string; income: number; expense: number }> = {};
  filteredTransactions.forEach((tx) => {
    const day = tx.date;
    if (!dateMap[day]) {
      dateMap[day] = { date: day.slice(5), income: 0, expense: 0 };
    }
    if (tx.type === 'income') {
      dateMap[day].income += tx.amount;
    } else if (tx.type === 'expense') {
      dateMap[day].expense += tx.amount;
    }
  });

  const trendData = Object.keys(dateMap)
    .sort()
    .map((k) => dateMap[k]);

  // Group expense by category for pie chart
  const categoryExpenseMap: Record<string, number> = {};
  filteredTransactions
    .filter((tx) => tx.type === 'expense')
    .forEach((tx) => {
      const cat = categories.find((c) => c.id === tx.category_id);
      const name = cat ? cat.name : tx.category_name || 'Lainnya';
      categoryExpenseMap[name] = (categoryExpenseMap[name] || 0) + tx.amount;
    });

  const COLORS = ['#f43f5e', '#fbbf24', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#64748b'];

  const categoryData = Object.keys(categoryExpenseMap).map((name, index) => ({
    name,
    value: categoryExpenseMap[name],
    color: COLORS[index % COLORS.length],
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#0a0b10] border border-slate-200 dark:border-[#1e2436] p-3 rounded-lg shadow-xl text-xs">
          <p className="text-slate-700 dark:text-slate-300 font-semibold mb-1">{label}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} style={{ color: item.color }} className="font-medium">
              {item.name}: {formatCurrency(item.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Trend Area Chart */}
      <div className="lg:col-span-2 bg-white dark:bg-[#12141d] border border-slate-200 dark:border-[#1e2436] rounded-xl p-5 shadow-sm transition-colors flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Tren Arus Kas Transaksi</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Komparasi Pemasukan vs Pengeluaran</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-500 dark:text-slate-400">Pemasukan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-500 dark:text-slate-400">Pengeluaran</span>
            </div>
          </div>
        </div>

        <div className="h-[240px] w-full">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${val / 1000000}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Pemasukan"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#incomeGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Pengeluaran"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#expenseGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Belum ada mutasi transaksi pada periode ini
            </div>
          )}
        </div>
      </div>

      {/* 2. Donut Chart - Proporsi Pengeluaran */}
      <div className="bg-white dark:bg-[#12141d] border border-slate-200 dark:border-[#1e2436] rounded-xl p-5 shadow-sm transition-colors flex flex-col justify-between">
        <div className="mb-2">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Distribusi Pengeluaran</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">Berdasarkan kategori pengeluaran</p>
        </div>

        <div className="h-[200px] w-full flex items-center justify-center">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-xs text-slate-500 text-center">
              Tidak ada pengeluaran pada periode ini
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="space-y-1.5 max-h-[90px] overflow-y-auto pr-1">
          {categoryData.slice(0, 4).map((cat, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                ></span>
                <span className="text-slate-300 truncate">{cat.name}</span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">
                {formatCurrency(cat.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
