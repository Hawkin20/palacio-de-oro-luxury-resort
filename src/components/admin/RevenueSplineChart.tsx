import React, { useState } from 'react';
import { TrendingUp, DollarSign, UtensilsCrossed, BedDouble } from 'lucide-react';
import { useCurrency } from '../../lib/currency';

interface RevenueDataPoint {
  date: string;
  label: string;
  suitesRevenue: number;
  diningRevenue: number;
  total: number;
}

interface RevenueSplineChartProps {
  data: RevenueDataPoint[];
  title?: string;
}

export default function RevenueSplineChart({
  data,
  title = 'Executive Revenue Yield Curves',
}: RevenueSplineChartProps) {
  const { formatPrice } = useCurrency();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Fallback if data is empty
  const chartData = data && data.length > 0 ? data : [
    { date: 'Day 1', label: 'Mon', suitesRevenue: 1200, diningRevenue: 450, total: 1650 },
    { date: 'Day 2', label: 'Tue', suitesRevenue: 1500, diningRevenue: 600, total: 2100 },
    { date: 'Day 3', label: 'Wed', suitesRevenue: 1100, diningRevenue: 520, total: 1620 },
    { date: 'Day 4', label: 'Thu', suitesRevenue: 1900, diningRevenue: 780, total: 2680 },
    { date: 'Day 5', label: 'Fri', suitesRevenue: 2400, diningRevenue: 1100, total: 3500 },
    { date: 'Day 6', label: 'Sat', suitesRevenue: 3200, diningRevenue: 1450, total: 4650 },
    { date: 'Day 7', label: 'Sun', suitesRevenue: 2800, diningRevenue: 1300, total: 4100 },
  ];

  // SVG dimensions & padding
  const svgWidth = 600;
  const svgHeight = 220;
  const padding = { top: 25, right: 25, bottom: 35, left: 45 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Scales
  const maxVal = Math.max(...chartData.map(d => d.total), 100);
  const getX = (index: number) => padding.left + (index / (chartData.length - 1)) * graphWidth;
  const getY = (val: number) => padding.top + graphHeight - (val / maxVal) * graphHeight;

  // Generate smooth cubic bezier SVG path
  const createSplinePath = (values: number[]) => {
    if (values.length === 0) return '';
    const points = values.map((val, idx) => ({ x: getX(idx), y: getY(val) }));

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const totalPoints = chartData.map(d => d.total);
  const suitesPoints = chartData.map(d => d.suitesRevenue);
  const diningPoints = chartData.map(d => d.diningRevenue);

  const totalSpline = createSplinePath(totalPoints);
  const suitesSpline = createSplinePath(suitesPoints);
  const diningSpline = createSplinePath(diningPoints);

  // Closed area paths for gradient fills
  const totalArea = totalSpline
    ? `${totalSpline} L ${getX(chartData.length - 1)} ${padding.top + graphHeight} L ${getX(0)} ${padding.top + graphHeight} Z`
    : '';

  const hoveredData = hoverIndex !== null ? chartData[hoverIndex] : chartData[chartData.length - 1];

  return (
    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-xl hover:border-palacio-bronze/40 transition-all duration-500 flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-palacio-bronze/10 border border-palacio-bronze/20 text-palacio-bronze">
            <TrendingUp size={16} />
          </div>
          <div>
            <h3 className="font-playfair text-lg text-palacio-alabaster font-medium">{title}</h3>
            <p className="text-[10px] font-cinzel tracking-wider uppercase text-palacio-alabaster/50">
              Dual-Yield Spline: Accommodations vs Gastronomy
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-cinzel">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-palacio-bronze shadow-[0_0_8px_rgba(197,168,128,0.6)]" />
            <span className="text-palacio-alabaster/70 text-[11px]">Suites</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5C9A3] border border-white/40" />
            <span className="text-palacio-alabaster/70 text-[11px]">Dining</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
            <span className="text-white text-[11px] font-bold">Gross Total</span>
          </div>
        </div>
      </div>

      {/* Dynamic Hover Metrics Banner */}
      <div className="grid grid-cols-3 gap-3 mb-4 p-3 rounded-xl bg-black/40 border border-white/[0.06]">
        <div>
          <span className="text-[10px] font-cinzel uppercase text-palacio-alabaster/50 flex items-center gap-1">
            <BedDouble size={11} className="text-palacio-bronze" /> Suites Revenue
          </span>
          <p className="font-cinzel text-base font-bold text-palacio-bronze mt-0.5">
            {formatPrice(hoveredData.suitesRevenue)}
          </p>
        </div>
        <div>
          <span className="text-[10px] font-cinzel uppercase text-palacio-alabaster/50 flex items-center gap-1">
            <UtensilsCrossed size={11} className="text-[#E5C9A3]" /> Dining Revenue
          </span>
          <p className="font-cinzel text-base font-bold text-[#E5C9A3] mt-0.5">
            {formatPrice(hoveredData.diningRevenue)}
          </p>
        </div>
        <div>
          <span className="text-[10px] font-cinzel uppercase text-palacio-alabaster/50 flex items-center gap-1">
            <DollarSign size={11} className="text-emerald-400" /> Gross Day Total
          </span>
          <p className="font-cinzel text-base font-bold text-white mt-0.5">
            {formatPrice(hoveredData.total)}
          </p>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            {/* Total Area Gradient */}
            <linearGradient id="splineAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C5A880" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#C5A880" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#C5A880" stopOpacity="0.00" />
            </linearGradient>

            {/* Suites Area Gradient */}
            <linearGradient id="suitesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#997A15" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#997A15" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + graphHeight * pct;
            return (
              <line
                key={i}
                x1={padding.left}
                y1={y}
                x2={svgWidth - padding.right}
                y2={y}
                stroke="rgba(255, 255, 255, 0.06)"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Shaded Area Fill */}
          {totalArea && (
            <path d={totalArea} fill="url(#splineAreaGrad)" className="transition-all duration-700" />
          )}

          {/* Suites Revenue Curve */}
          {suitesSpline && (
            <path
              d={suitesSpline}
              fill="none"
              stroke="#C5A880"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          )}

          {/* Dining Revenue Curve */}
          {diningSpline && (
            <path
              d={diningSpline}
              fill="none"
              stroke="#E5C9A3"
              strokeWidth="2"
              strokeDasharray="3 3"
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          )}

          {/* Gross Total Curve */}
          {totalSpline && (
            <path
              d={totalSpline}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ filter: 'drop-shadow(0px 2px 8px rgba(255,255,255,0.35))' }}
              className="transition-all duration-700"
            />
          )}

          {/* Data Points & Interactive Hitboxes */}
          {chartData.map((d, idx) => {
            const cx = getX(idx);
            const cy = getY(d.total);
            const isHovered = hoverIndex === idx;

            return (
              <g key={idx} className="cursor-pointer">
                {/* Vertical Cursor Indicator when active */}
                {isHovered && (
                  <line
                    x1={cx}
                    y1={padding.top}
                    x2={cx}
                    y2={padding.top + graphHeight}
                    stroke="#C5A880"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Visible Data Dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? '#FFFFFF' : '#C5A880'}
                  stroke="#080808"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />

                {/* X-Axis Labels */}
                <text
                  x={cx}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  className={`text-[10px] font-cinzel ${
                    isHovered ? 'fill-palacio-bronze font-bold' : 'fill-palacio-alabaster/50'
                  }`}
                >
                  {d.label}
                </text>

                {/* Invisible wide hitbox for easy mouse interaction */}
                <rect
                  x={cx - (graphWidth / chartData.length) / 2}
                  y={padding.top}
                  width={graphWidth / chartData.length}
                  height={graphHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoverIndex(idx)}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
