import React, { useState } from 'react';
import { UtensilsCrossed, Wine, PieChart } from 'lucide-react';
import { useCurrency } from '../../lib/currency';

interface CategorySlice {
  category: string;
  label: string;
  amount: number;
  ordersCount: number;
  color: string;
}

interface CategoryDonutChartProps {
  slices: CategorySlice[];
  totalRevenue: number;
}

export default function CategoryDonutChart({
  slices,
  totalRevenue,
}: CategoryDonutChartProps) {
  const { formatPrice } = useCurrency();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Fallback sample slices if none provided
  const categoryData: CategorySlice[] = slices && slices.length > 0 ? slices : [
    { category: 'main_course', label: 'Main Courses', amount: 4800, ordersCount: 14, color: '#C5A880' },
    { category: 'wine', label: 'Vintage Cellar', amount: 3600, ordersCount: 9, color: '#E5C9A3' },
    { category: 'seafood', label: 'Island Seafood', amount: 2900, ordersCount: 11, color: '#10B981' },
    { category: 'appetizers', label: 'Appetizers & Tapas', amount: 1850, ordersCount: 16, color: '#F6F4EF' },
    { category: 'cocktails', label: 'Craft Cocktails', amount: 1420, ordersCount: 18, color: '#F59E0B' },
  ];

  const sumTotal = categoryData.reduce((sum, s) => sum + s.amount, 0) || totalRevenue || 1;

  // SVG Geometry
  const size = 180;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate segment offsets
  let accumulatedPercent = 0;
  const segments = categoryData.map((slice) => {
    const percent = slice.amount / sumTotal;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;
    return {
      ...slice,
      percent: Math.round(percent * 100),
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeSlice = activeCategory
    ? segments.find((s) => s.category === activeCategory)
    : segments[0];

  return (
    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-xl hover:border-palacio-bronze/40 transition-all duration-500 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-palacio-bronze/10 border border-palacio-bronze/20 text-palacio-bronze">
            <PieChart size={16} />
          </div>
          <div>
            <h3 className="font-playfair text-base text-palacio-alabaster font-medium">Gastronomy Yield</h3>
            <p className="text-[10px] font-cinzel tracking-wider uppercase text-palacio-alabaster/50">Category Revenue Share</p>
          </div>
        </div>
        <span className="text-xs font-cinzel text-palacio-bronze font-bold">
          {formatPrice(sumTotal)}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
        {/* SVG Donut Ring */}
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background base circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Segments */}
            {segments.map((seg) => {
              const isActive = activeCategory === seg.category;
              return (
                <circle
                  key={seg.category}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={seg.color}
                  strokeWidth={isActive ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  fill="transparent"
                  className="transition-all duration-300 cursor-pointer"
                  style={{
                    filter: isActive ? `drop-shadow(0px 0px 8px ${seg.color})` : undefined,
                  }}
                  onMouseEnter={() => setActiveCategory(seg.category)}
                />
              );
            })}
          </svg>

          {/* Center Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
            <span className="font-cinzel text-2xl font-bold text-palacio-alabaster">
              {activeSlice?.percent || 0}%
            </span>
            <span className="text-[10px] font-cinzel uppercase tracking-wider text-palacio-bronze truncate max-w-[100px]">
              {activeSlice?.label || 'Share'}
            </span>
          </div>
        </div>

        {/* Legend Slices List */}
        <div className="flex flex-col gap-2 w-full sm:w-auto min-w-[150px]">
          {segments.map((seg) => {
            const isActive = activeCategory === seg.category;
            return (
              <div
                key={seg.category}
                onMouseEnter={() => setActiveCategory(seg.category)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-white/[0.08] border-palacio-bronze/40 scale-102'
                    : 'bg-white/[0.02] border-transparent hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="text-xs text-palacio-alabaster/80 truncate font-light">
                    {seg.label}
                  </span>
                </div>
                <span className="font-cinzel text-xs font-bold text-palacio-bronze ml-3 shrink-0">
                  {seg.percent}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
