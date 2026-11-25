import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, BedDouble, Calendar, Sparkles, 
  CheckCircle2, Clock, AlertCircle, User, ShieldCheck, RefreshCw 
} from 'lucide-react';
import { Room, Cottage, Booking } from '../lib/types';
import { useCurrency } from '../lib/currency';

interface OccupancyMatrixProps {
  rooms: Room[];
  cottages: Cottage[];
  bookings: Booking[];
  onSelectBooking?: (booking: Booking) => void;
}

type HousekeepingStatus = 'inspected' | 'occupied' | 'turnover' | 'maintenance';

export default function OccupancyMatrix({
  rooms,
  cottages,
  bookings,
  onSelectBooking
}: OccupancyMatrixProps) {
  const { formatPrice } = useCurrency();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [housekeepingMap, setHousekeepingMap] = useState<Record<string, HousekeepingStatus>>({
    'Habitación Estándar': 'inspected',
    'Habitación Deluxe': 'inspected',
    'Suite Premium': 'occupied',
    'Villa de Lujo': 'inspected',
    'Cabaña Pequeña': 'inspected',
    'Cabaña Familiar': 'turnover',
    'Cabaña Barkada': 'inspected',
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in selected month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const allAccommodations = [
    ...rooms.map(r => ({ ...r, typeLabel: 'Suite' })),
    ...cottages.map(c => ({ ...c, typeLabel: 'Cottage' })),
  ];

  // Helper: check if room is booked on day `d`
  const getBookingOnDate = (accId: string, dayNum: number) => {
    const targetDate = new Date(year, month, dayNum);
    targetDate.setHours(12, 0, 0, 0);

    return bookings.find(b => {
      if (b.status === 'cancelled') return false;
      const isMatchingAcc = b.room_id === accId || b.cottage_id === accId;
      if (!isMatchingAcc) return false;

      const checkIn = new Date(b.check_in_date);
      const checkOut = new Date(b.check_out_date);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(23, 59, 59, 999);

      return targetDate >= checkIn && targetDate <= checkOut;
    });
  };

  // Toggle housekeeping status
  const cycleHousekeeping = (name: string) => {
    const statuses: HousekeepingStatus[] = ['inspected', 'occupied', 'turnover', 'maintenance'];
    const current = housekeepingMap[name] || 'inspected';
    const nextIdx = (statuses.indexOf(current) + 1) % statuses.length;
    setHousekeepingMap(prev => ({ ...prev, [name]: statuses[nextIdx] }));
  };

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Month Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
        <div>
          <span className="text-[10px] font-cinzel uppercase tracking-[0.25em] text-palacio-bronze font-semibold block">
            Executive Timeline Matrix
          </span>
          <h3 className="font-playfair text-2xl text-palacio-alabaster">
            Sanctuary Room Occupancy (Gantt)
          </h3>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-palacio-alabaster/70 hover:text-palacio-bronze hover:border-palacio-bronze/40 transition-colors"
            aria-label="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>
          
          <span className="font-cinzel text-sm font-bold text-palacio-alabaster px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] min-w-[160px] text-center">
            {monthName}
          </span>

          <button
            onClick={nextMonth}
            className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-palacio-alabaster/70 hover:text-palacio-bronze hover:border-palacio-bronze/40 transition-colors"
            aria-label="Next Month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Housekeeping Status Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-cinzel">
        <span className="text-palacio-alabaster/50 uppercase tracking-wider text-[10px]">Housekeeping Legend:</span>
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Ready & Inspected</span>
        </span>
        <span className="flex items-center gap-1.5 text-palacio-bronze">
          <span className="w-2 h-2 rounded-full bg-palacio-bronze" />
          <span>Occupied</span>
        </span>
        <span className="flex items-center gap-1.5 text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Turnover Required</span>
        </span>
        <span className="flex items-center gap-1.5 text-rose-400">
          <span className="w-2 h-2 rounded-full bg-rose-400" />
          <span>Maintenance</span>
        </span>
      </div>

      {/* Interactive Gantt Matrix Grid */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#090909] shadow-2xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-palacio-bronze/20">
          <table className="w-full text-left border-collapse min-w-[900px]">
            
            {/* Header: Accommodation info + Days of Month */}
            <thead>
              <tr className="bg-white/[0.04] border-b border-white/[0.08]">
                <th className="py-3 px-4 w-64 text-left font-cinzel text-[11px] uppercase tracking-wider text-palacio-bronze sticky left-0 bg-[#0c0c0c] z-10 border-r border-white/[0.08]">
                  Accommodation & Status
                </th>
                {days.map(d => {
                  const dateObj = new Date(year, month, d);
                  const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'narrow' });
                  const isToday = isCurrentMonth && d === todayDate;

                  return (
                    <th
                      key={d}
                      className={`py-2 px-1 text-center font-mono text-[10px] min-w-[28px] border-r border-white/[0.04] ${
                        isToday ? 'bg-palacio-bronze/20 text-palacio-bronze font-bold' : 'text-palacio-alabaster/60'
                      }`}
                    >
                      <span className="block text-[8px] font-cinzel">{dayOfWeek}</span>
                      <span>{d}</span>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Rows: Each Accommodation */}
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {allAccommodations.map((acc) => {
                const hkStatus = housekeepingMap[acc.name] || 'inspected';
                const hkColor = 
                  hkStatus === 'inspected' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                  hkStatus === 'occupied' ? 'bg-palacio-bronze/20 text-palacio-bronze border-palacio-bronze/40' :
                  hkStatus === 'turnover' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                  'bg-rose-500/20 text-rose-300 border-rose-500/40';

                return (
                  <tr key={acc.id} className="hover:bg-white/[0.02] transition-colors">
                    
                    {/* Sticky Accommodation Row Header */}
                    <td className="py-3 px-4 sticky left-0 bg-[#090909] z-10 border-r border-white/[0.08] shadow-[2px_0_10px_rgba(0,0,0,0.5)]">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-playfair text-sm font-semibold text-palacio-alabaster truncate max-w-[130px]">
                            {acc.name}
                          </p>
                          <p className="text-[10px] font-cinzel text-palacio-bronze/80">
                            {formatPrice(acc.price_per_night)}/nt • {acc.capacity}p
                          </p>
                        </div>

                        {/* Housekeeping Status Pill (Clickable to cycle) */}
                        <button
                          onClick={() => cycleHousekeeping(acc.name)}
                          className={`px-2 py-0.5 rounded-full border text-[9px] font-cinzel uppercase tracking-wider transition-all hover:scale-105 ${hkColor}`}
                          title="Click to toggle Housekeeping Status"
                        >
                          {hkStatus}
                        </button>
                      </div>
                    </td>

                    {/* Days Cells */}
                    {days.map(d => {
                      const booking = getBookingOnDate(acc.id, d);
                      const isToday = isCurrentMonth && d === todayDate;

                      if (booking) {
                        const isConfirmed = booking.status === 'confirmed';
                        return (
                          <td 
                            key={d} 
                            className={`p-0.5 text-center border-r border-white/[0.04] ${isToday ? 'bg-palacio-bronze/10' : ''}`}
                            onClick={() => onSelectBooking?.(booking)}
                          >
                            <div 
                              className={`h-7 w-full rounded flex items-center justify-center font-mono text-[9px] font-bold cursor-pointer transition-transform hover:scale-110 shadow ${
                                isConfirmed 
                                  ? 'bg-palacio-bronze text-palacio-obsidian' 
                                  : 'bg-amber-500/80 text-palacio-obsidian'
                              }`}
                              title={`Guest: ${booking.username || 'Guest'} (${booking.reference_number})`}
                            >
                              •
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td 
                          key={d} 
                          className={`p-1 text-center border-r border-white/[0.04] ${
                            isToday ? 'bg-palacio-bronze/10' : ''
                          }`}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-white/[0.08] mx-auto" />
                        </td>
                      );
                    })}

                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
}
