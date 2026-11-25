import React, { useState } from 'react';
import { Compass, Anchor, Sparkles, Waves, Wine, ShieldCheck } from 'lucide-react';

interface IslandAsset {
  id: string;
  name: string;
  code: string;
  category: string;
  status: 'operational' | 'reserved' | 'event' | 'maintenance';
  statusText: string;
  detail: string;
}

export default function IslandTelemetryBadge() {
  const [assets, setAssets] = useState<IslandAsset[]>([
    {
      id: 'helipad',
      name: 'Helipad Alpha Pier',
      code: 'HLP-01',
      category: 'Aviation Gate',
      status: 'operational',
      statusText: 'Clear for Inbound',
      detail: 'Next arrival: 14:30 PHT (VIP Augusta Charter)',
    },
    {
      id: 'yacht',
      name: 'Palacio Luxury Catamaran',
      code: 'YCT-GOLD',
      category: 'Maritime Asset',
      status: 'operational',
      statusText: 'Docked at Sanctuary Pier',
      detail: 'Sunset cruise scheduled: 17:15 PHT',
    },
    {
      id: 'lagoon',
      name: 'Infinity Lagoon & Cabanas',
      code: 'LGN-MAIN',
      category: 'Recreational Sanctuary',
      status: 'operational',
      statusText: 'Open Sanctuary Access',
      detail: 'Water temp 28°C · 6 Cabanas reserved',
    },
    {
      id: 'cellar',
      name: 'Grand Reserve Wine Cellar',
      code: 'WNE-CLR',
      category: 'Fine Dining Sommelier',
      status: 'reserved',
      statusText: 'Private Tasting in Session',
      detail: 'Château Margaux 2010 allocation review',
    },
  ]);

  const toggleStatus = (id: string) => {
    setAssets(prev =>
      prev.map(asset => {
        if (asset.id !== id) return asset;
        const nextStatus = asset.status === 'operational' ? 'reserved' : 'operational';
        const nextStatusText = nextStatus === 'operational' ? 'Active & Clear' : 'Exclusive Reserved';
        return { ...asset, status: nextStatus, statusText: nextStatusText };
      })
    );
  };

  const getStatusColor = (status: IslandAsset['status']) => {
    switch (status) {
      case 'operational':
        return {
          pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400',
        };
      case 'reserved':
        return {
          pill: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400',
        };
      case 'event':
        return {
          pill: 'bg-palacio-bronze/10 text-palacio-bronze border-palacio-bronze/30',
          dot: 'bg-palacio-bronze',
        };
      default:
        return {
          pill: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          dot: 'bg-rose-400',
        };
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-xl hover:border-palacio-bronze/40 transition-all duration-500">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-palacio-bronze/10 border border-palacio-bronze/20 text-palacio-bronze">
            <Compass size={16} />
          </div>
          <div>
            <h3 className="font-playfair text-base text-palacio-alabaster font-medium">
              Island Infrastructure Telemetry
            </h3>
            <p className="text-[10px] font-cinzel tracking-wider uppercase text-palacio-alabaster/50">
              Live Amenity & Transit State
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-cinzel text-palacio-bronze tracking-wider uppercase">
          <ShieldCheck size={13} />
          Telemetry Active
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {assets.map((asset) => {
          const colors = getStatusColor(asset.status);
          return (
            <div
              key={asset.id}
              onClick={() => toggleStatus(asset.id)}
              className="p-4 rounded-xl bg-black/40 border border-white/[0.06] hover:border-palacio-bronze/40 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-palacio-bronze/80 font-bold">
                    {asset.code}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-cinzel font-semibold tracking-wider uppercase border ${colors.pill}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} animate-pulse`} />
                    {asset.statusText}
                  </span>
                </div>

                <h4 className="font-playfair text-sm text-palacio-alabaster group-hover:text-palacio-bronze transition-colors font-medium mb-1">
                  {asset.name}
                </h4>
                <p className="text-[11px] text-palacio-alabaster/60 font-light leading-relaxed">
                  {asset.detail}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-cinzel text-palacio-alabaster/40">
                <span>{asset.category}</span>
                <span className="group-hover:text-palacio-bronze transition-colors">Toggle State ↗</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
