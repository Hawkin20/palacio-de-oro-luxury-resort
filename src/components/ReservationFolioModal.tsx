import React from 'react';
import { X, Printer, Download, Sparkles, CheckCircle2, ShieldCheck, MapPin, Phone, Mail } from 'lucide-react';
import PalacioLogo from './PalacioLogo';
import { Booking } from '../lib/types';
import { useCurrency } from '../lib/currency';

interface ReservationFolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  guestName?: string;
  guestEmail?: string;
}

export default function ReservationFolioModal({
  isOpen,
  onClose,
  booking,
  guestName,
  guestEmail,
}: ReservationFolioModalProps) {
  const { formatPrice } = useCurrency();

  if (!isOpen || !booking) return null;

  const start = new Date(booking.check_in_date);
  const end = new Date(booking.check_out_date);
  const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const balanceDue = (booking.total_price || 0) - (booking.downpayment_amount || 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in print:p-0 print:bg-white">
      <div className="relative w-full max-w-3xl my-8 bg-[#0c0c0c] border border-palacio-bronze/40 rounded-2xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black print:my-0">
        
        {/* Action Header (Hidden during printing) */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/[0.03] border-b border-white/[0.08] print:hidden">
          <div className="flex items-center gap-2 text-xs font-cinzel text-palacio-bronze tracking-wider">
            <Sparkles size={14} />
            <span>Official Guest Reservation Folio</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-palacio-bronze text-palacio-obsidian font-cinzel text-xs font-semibold uppercase tracking-wider hover:bg-palacio-gold transition-colors"
            >
              <Printer size={14} />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-palacio-alabaster/60 hover:text-palacio-alabaster hover:bg-white/[0.06] transition-colors"
              aria-label="Close Folio"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Folio Content */}
        <div className="p-8 sm:p-12 space-y-8 bg-[#0a0a0a] text-palacio-alabaster print:bg-white print:text-neutral-900 print:p-8">
          
          {/* Folio Top Header: Brand & Crest */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-white/[0.1] pb-8 print:border-neutral-300">
            <div className="flex items-center gap-4">
              <PalacioLogo size={48} />
              <div>
                <h1 className="font-playfair text-2xl sm:text-3xl font-bold tracking-wider text-palacio-alabaster print:text-neutral-900">
                  Palacio de Oro
                </h1>
                <p className="text-[10px] font-cinzel tracking-[0.3em] uppercase text-palacio-bronze print:text-amber-800">
                  Private Island Sanctuary & Fine Dining
                </p>
                <p className="text-[11px] text-palacio-alabaster/50 print:text-neutral-500 mt-1">
                  Sanctuary Cove, El Nido Archipelago, Palawan, Philippines
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1 font-mono text-xs">
              <div className="inline-block px-3 py-1 rounded bg-palacio-bronze/10 border border-palacio-bronze/30 text-palacio-bronze font-cinzel font-bold text-[11px] uppercase tracking-wider print:border-amber-800 print:text-amber-800">
                Official Folio #{booking.reference_number}
              </div>
              <p className="text-palacio-alabaster/50 print:text-neutral-500 text-[10px] mt-1">
                Issued: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Guest and Stay Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
            {/* Guest Details */}
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] print:border-neutral-200 print:bg-neutral-50 space-y-2">
              <span className="font-cinzel text-[10px] text-palacio-bronze print:text-amber-800 uppercase tracking-widest block font-semibold">
                Guest of Honor
              </span>
              <p className="font-playfair text-lg text-palacio-alabaster print:text-neutral-900 font-bold">
                {guestName || booking.username || 'Distinguished Guest'}
              </p>
              <p className="text-palacio-alabaster/60 print:text-neutral-600 font-mono">
                {guestEmail || booking.user_email || 'guest@palaciodeoro.com'}
              </p>
              <div className="pt-2 flex items-center gap-2 text-[10px] font-cinzel text-emerald-400 print:text-emerald-700">
                <CheckCircle2 size={12} />
                <span>Verified Resident Reservation</span>
              </div>
            </div>

            {/* Stay Dates */}
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] print:border-neutral-200 print:bg-neutral-50 space-y-2">
              <span className="font-cinzel text-[10px] text-palacio-bronze print:text-amber-800 uppercase tracking-widest block font-semibold">
                Sanctuary Itinerary
              </span>
              <div className="flex justify-between items-center text-xs">
                <span className="text-palacio-alabaster/60 print:text-neutral-600">Check-In:</span>
                <span className="font-mono font-bold text-palacio-alabaster print:text-neutral-900">
                  {new Date(booking.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (2:00 PM)
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-palacio-alabaster/60 print:text-neutral-600">Check-Out:</span>
                <span className="font-mono font-bold text-palacio-alabaster print:text-neutral-900">
                  {new Date(booking.check_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (12:00 PM)
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-white/[0.06] print:border-neutral-200">
                <span className="text-palacio-alabaster/60 print:text-neutral-600">Duration & Guests:</span>
                <span className="font-cinzel text-palacio-bronze print:text-amber-800 font-bold">
                  {nights} {nights === 1 ? 'Night' : 'Nights'} • {booking.guest_count} {booking.guest_count === 1 ? 'Guest' : 'Guests'}
                </span>
              </div>
            </div>
          </div>

          {/* Accommodation & Financial Statement Table */}
          <div className="rounded-xl border border-white/[0.08] print:border-neutral-200 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-white/[0.04] print:bg-neutral-100 font-cinzel text-[10px] tracking-wider uppercase text-palacio-bronze print:text-amber-800 border-b border-white/[0.08] print:border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Sanctuary Accommodation</th>
                  <th className="py-3 px-4 text-center">Nights</th>
                  <th className="py-3 px-4 text-right">Rate</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] print:divide-neutral-200">
                <tr>
                  <td className="py-4 px-4">
                    <p className="font-playfair text-sm font-semibold text-palacio-alabaster print:text-neutral-900">
                      {booking.accommodation_name || booking.room_name || booking.cottage_name || 'Island Sanctuary Residence'}
                    </p>
                    <p className="text-[10px] text-palacio-alabaster/50 print:text-neutral-500">
                      Inclusive of island taxes, private concierge, and environmental sanctuary fees
                    </p>
                  </td>
                  <td className="py-4 px-4 text-center font-mono">{nights}</td>
                  <td className="py-4 px-4 text-right font-mono">
                    {formatPrice((booking.total_price || 0) / nights)}
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-bold text-palacio-alabaster print:text-neutral-900">
                    {formatPrice(booking.total_price || 0)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Financial Summary */}
            <div className="p-4 bg-white/[0.02] print:bg-neutral-50 border-t border-white/[0.08] print:border-neutral-200 space-y-2">
              <div className="flex justify-between text-xs text-palacio-alabaster/70 print:text-neutral-600">
                <span>Total Reservation Amount:</span>
                <span className="font-mono text-palacio-alabaster print:text-neutral-900 font-bold">{formatPrice(booking.total_price || 0)}</span>
              </div>
              <div className="flex justify-between text-xs text-palacio-bronze print:text-amber-800">
                <span>Deposit / Downpayment Paid:</span>
                <span className="font-mono font-bold">-{formatPrice(booking.downpayment_amount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-white/[0.08] print:border-neutral-200">
                <span className="font-cinzel text-palacio-alabaster print:text-neutral-900">Balance Due Upon Island Check-In:</span>
                <span className="font-cinzel text-palacio-bronze print:text-amber-800 text-base">{formatPrice(balanceDue)}</span>
              </div>
            </div>
          </div>

          {/* Complimentary Sanctuary Inclusions */}
          <div className="p-5 rounded-xl bg-palacio-bronze/5 border border-palacio-bronze/20 print:border-neutral-200 print:bg-neutral-50 space-y-2 text-xs">
            <span className="font-cinzel text-[10px] text-palacio-bronze print:text-amber-800 uppercase tracking-widest font-bold block">
              Complimentary Inclusions with your Stay
            </span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-palacio-alabaster/70 print:text-neutral-600">
              <li className="flex items-center gap-2">✓ Round-trip VIP Speedboat Transfers from Jetty</li>
              <li className="flex items-center gap-2">✓ Daily Curated Breakfast at Ocean Pavilion</li>
              <li className="flex items-center gap-2">✓ 24-Hour Dedicated Villa Butler Service</li>
              <li className="flex items-center gap-2">✓ Signature Sunset Champagne Tasting Session</li>
            </ul>
          </div>

          {/* Folio Bottom Sign-off */}
          <div className="pt-6 border-t border-white/[0.1] print:border-neutral-300 flex flex-col sm:flex-row justify-between items-end gap-6 text-[10px] text-palacio-alabaster/50 print:text-neutral-500">
            <div className="space-y-1">
              <p className="font-cinzel uppercase tracking-wider text-palacio-bronze print:text-amber-800 font-bold">
                Palacio de Oro Sanctuary Guarantee
              </p>
              <p>For inquiries or private helicopter transfer bookings, contact concierge@palaciodeoro.com</p>
              <p>International: +63 (2) 8888-PALACIO • Satellite: +870 773 992 101</p>
            </div>

            <div className="text-center sm:text-right">
              <div className="h-10 border-b border-palacio-bronze/40 print:border-neutral-400 w-48 mb-1 flex items-end justify-center">
                <span className="font-playfair italic text-xs text-palacio-bronze print:text-amber-800">
                  Vincent Paul Ecaldre
                </span>
              </div>
              <p className="font-cinzel tracking-wider uppercase text-[9px]">General Manager & Custodian</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
