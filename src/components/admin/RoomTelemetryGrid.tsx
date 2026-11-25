import React, { useState } from 'react';
import { BedDouble, CheckCircle2, AlertTriangle, Wrench, Sparkles, User, RefreshCw, Plus, Edit2 } from 'lucide-react';
import { Room, Cottage } from '../../lib/types';
import { useCurrency } from '../../lib/currency';
import { supabase } from '../../lib/supabase';

interface RoomTelemetryGridProps {
  rooms: Room[];
  cottages: Cottage[];
  onRefresh?: () => void;
  onEdit?: (item: Room | Cottage, type: 'room' | 'cottage') => void;
  onAddNew?: () => void;
}

export default function RoomTelemetryGrid({
  rooms,
  cottages,
  onRefresh,
  onEdit,
  onAddNew,
}: RoomTelemetryGridProps) {
  const { formatPrice } = useCurrency();
  const [filter, setFilter] = useState<'all' | 'rooms' | 'cottages' | 'available' | 'booked'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Normalize all inventory
  const allInventory = [
    ...rooms.map(r => ({ ...r, itemType: 'room' as const, typeLabel: r.room_type || 'Suite' })),
    ...cottages.map(c => ({ ...c, itemType: 'cottage' as const, typeLabel: `${c.cottage_type || 'Sanctuary'} Cottage` })),
  ];

  const filteredInventory = allInventory.filter(item => {
    if (filter === 'rooms') return item.itemType === 'room';
    if (filter === 'cottages') return item.itemType === 'cottage';
    if (filter === 'available') return item.status === 'available';
    if (filter === 'booked') return item.status === 'booked';
    return true;
  });

  const cycleStatus = async (item: Room | Cottage & { itemType: 'room' | 'cottage' }) => {
    const nextStatusMap: Record<string, 'available' | 'booked' | 'maintenance'> = {
      available: 'booked',
      booked: 'maintenance',
      maintenance: 'available',
      closed: 'available',
    };

    const nextStatus = nextStatusMap[item.status || 'available'] || 'available';
    setUpdatingId(item.id);

    try {
      const table = item.itemType === 'room' ? 'rooms' : 'cottages';
      const { error } = await supabase
        .from(table)
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', item.id);

      if (!error && onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to cycle status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'available':
        return {
          label: 'Available Now',
          icon: CheckCircle2,
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        };
      case 'booked':
        return {
          label: 'Occupied',
          icon: User,
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        };
      case 'maintenance':
      case 'closed':
        return {
          label: 'Turnover / Hold',
          icon: Wrench,
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
        };
      default:
        return {
          label: 'Available',
          icon: CheckCircle2,
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Action & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.03] border border-white/[0.08] p-4 rounded-xl">
        <div className="flex flex-wrap gap-2">
          {[
            { val: 'all', label: `All (${allInventory.length})` },
            { val: 'rooms', label: `Suites (${rooms.length})` },
            { val: 'cottages', label: `Cottages (${cottages.length})` },
            { val: 'available', label: 'Available' },
            { val: 'booked', label: 'Occupied' },
          ].map(tab => (
            <button
              key={tab.val}
              onClick={() => setFilter(tab.val as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-cinzel tracking-wider uppercase transition-all ${
                filter === tab.val
                  ? 'bg-palacio-bronze text-palacio-obsidian font-bold shadow-md'
                  : 'bg-white/[0.04] text-palacio-alabaster/60 hover:text-palacio-alabaster hover:bg-white/[0.08]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-palacio-alabaster/70 hover:text-palacio-bronze transition-colors border border-white/[0.06]"
              title="Refresh Telemetry"
            >
              <RefreshCw size={15} />
            </button>
          )}
          {onAddNew && (
            <button
              onClick={onAddNew}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-palacio-bronze text-palacio-obsidian font-cinzel text-xs font-semibold uppercase tracking-wider hover:bg-palacio-gold transition-all shadow-md"
            >
              <Plus size={14} /> Add Accommodation
            </button>
          )}
        </div>
      </div>

      {/* Cards Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredInventory.map((item) => {
          const statusConfig = getStatusBadge(item.status);
          const StatusIcon = statusConfig.icon;
          const isUpdating = updatingId === item.id;

          return (
            <div
              key={item.id}
              className="group relative rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.08] hover:border-palacio-bronze/40 transition-all duration-500 shadow-xl flex flex-col justify-between"
            >
              {/* Photo & Status Badge */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80'}
                  alt={item.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* 1-Click Status Trigger */}
                <button
                  onClick={() => cycleStatus(item as any)}
                  disabled={isUpdating}
                  className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-cinzel font-semibold tracking-wider uppercase border shadow-lg backdrop-blur-md transition-all active:scale-95 ${statusConfig.color}`}
                  title="Click to cycle status: Available -> Occupied -> Maintenance"
                >
                  <StatusIcon size={11} />
                  <span>{isUpdating ? 'Updating...' : statusConfig.label}</span>
                </button>

                {/* Edit Button */}
                {onEdit && (
                  <button
                    onClick={() => onEdit(item, item.itemType)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-palacio-bronze hover:text-palacio-obsidian text-palacio-alabaster transition-all opacity-0 group-hover:opacity-100"
                    title="Edit Accommodation"
                  >
                    <Edit2 size={13} />
                  </button>
                )}

                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <span className="text-[10px] font-cinzel tracking-wider uppercase text-palacio-alabaster/80 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
                    {item.typeLabel}
                  </span>
                  <span className="font-cinzel text-base font-bold text-palacio-bronze drop-shadow-md">
                    {formatPrice(item.price_per_night)}
                    <span className="text-[10px] text-palacio-alabaster/70 font-normal"> / nt</span>
                  </span>
                </div>
              </div>

              {/* Content Details */}
              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <h4 className="font-playfair text-base text-palacio-alabaster font-medium group-hover:text-palacio-bronze transition-colors line-clamp-1 mb-1">
                    {item.name}
                  </h4>
                  <p className="text-xs text-palacio-alabaster/60 font-light line-clamp-2 leading-relaxed mb-3">
                    {item.description || 'Exclusive private island accommodation with bespoke amenities.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-cinzel text-palacio-alabaster/50">
                  <span>Capacity: {item.capacity || 2} Guests</span>
                  <span
                    onClick={() => cycleStatus(item as any)}
                    className="text-palacio-bronze hover:underline cursor-pointer"
                  >
                    Cycle Status ↻
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
