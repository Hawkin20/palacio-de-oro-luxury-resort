import React from 'react';
import { BedDouble, Sparkles, TrendingUp, Users } from 'lucide-react';

interface RadialOccupancyGaugeProps {
  totalRooms: number;
  totalCottages: number;
  activeBookings: number;
  guestCount?: number;
}

export default function RadialOccupancyGauge({
  totalRooms,
  totalCottages,
  activeBookings,
  guestCount = 0,
}: RadialOccupancyGaugeProps) {
  const totalCapacity = totalRooms + totalCottages;
  const occupancyRate = totalCapacity > 0 ? Math.min(100, Math.round((activeBookings / totalCapacity) * 100)) : 0;

  // SVG Geometry
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (occupancyRate / 100) * circumference;

  // Determine status color theme
  const getStatus = () => {
    if (occupancyRate >= 90) return { label: 'Peak Sanctuary Demand', color: 'text-amber-400', stroke: '#E5C9A3', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    if (occupancyRate >= 65) return { label: 'Optimal Yield', color: 'text-emerald-400', stroke: '#10B981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    return { label: 'Tranquil Sanctuary', color: 'text-palacio-bronze', stroke: '#C5A880', bg: 'bg-palacio-bronze/10', border: 'border-palacio-bronze/30' };
  };

  const status = getStatus();

  return (
    <div className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-xl hover:border-palacio-bronze/40 transition-all duration-500 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-palacio-bronze/10 border border-palacio-bronze/20 text-palacio-bronze">
            <BedDouble size={16} />
          </div>
          <div>
            <h3 className="font-playfair text-base text-palacio-alabaster font-medium">Sanctuary Occupancy</h3>
            <p className="text-[10px] font-cinzel tracking-wider uppercase text-palacio-alabaster/50">Live Capacity Gauge</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-cinzel font-semibold tracking-wider uppercase border ${status.bg} ${status.color} ${status.border}`}>
          {status.label}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
        {/* SVG Circular Radial Meter */}
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255, 255, 255, 0.06)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Active Progress Arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={status.stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
              style={{
                filter: 'drop-shadow(0px 0px 8px rgba(197, 168, 128, 0.4))',
              }}
            />
          </svg>

          {/* Center Stat Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-cinzel text-4xl font-bold text-palacio-alabaster tracking-tight">
              {occupancyRate}%
            </span>
            <span className="text-[10px] font-cinzel uppercase tracking-[0.2em] text-palacio-bronze mt-0.5">
              Occupied
            </span>
          </div>
        </div>

        {/* Detailed Inventory Breakdown */}
        <div className="flex flex-col gap-3 min-w-[140px] w-full sm:w-auto">
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
            <span className="text-xs text-palacio-alabaster/70 font-light">Active Bookings</span>
            <span className="font-cinzel text-sm font-bold text-palacio-alabaster">{activeBookings}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
            <span className="text-xs text-palacio-alabaster/70 font-light">Total Capacity</span>
            <span className="font-cinzel text-sm font-bold text-palacio-bronze">{totalCapacity} keys</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
            <span className="text-xs text-palacio-alabaster/70 font-light">Available Keys</span>
            <span className="font-cinzel text-sm font-bold text-emerald-400">
              {Math.max(0, totalCapacity - activeBookings)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-palacio-alabaster/50">
        <span className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-palacio-bronze" />
          Real-time room occupancy sync
        </span>
        <span className="font-mono text-palacio-bronze/80">
          {totalRooms} Suites · {totalCottages} Cottages
        </span>
      </div>
    </div>
  );
}
