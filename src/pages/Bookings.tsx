import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Booking } from '../lib/types';
import GlassCard from '../components/GlassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

interface BookingsProps {
  userId?: string;
  isLoggedIn: boolean;
}

export default function Bookings({ userId, isLoggedIn }: BookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchBookings();
    }
  }, [isLoggedIn, userId]);

  const fetchBookings = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('guest_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen pt-24 flex items-center justify-center overflow-hidden">
        {/* Summer Background Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&q=80")',
            filter: 'brightness(0.2)' 
          }}
        />
        <GlassCard className="relative z-10 p-8 text-center max-w-md border border-palacio-gold/30">
          <h2 className="font-playfair text-2xl text-palacio-gold mb-4">
            Login Required
          </h2>
          <p className="text-gray-300">
            Please log in to view your luxury bookings.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-24 pb-20 overflow-hidden">
      {/* Summer Background Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center fixed"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80")',
          filter: 'brightness(0.15) saturate(1.2)' 
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title mb-8 text-palacio-gold drop-shadow-lg">My Reservations</h1>

        {loading ? (
          <LoadingSpinner />
        ) : bookings.length === 0 ? (
          <GlassCard className="p-12 text-center border border-white/10 backdrop-blur-md">
            <p className="text-gray-300 mb-6 font-cinzel">No bookings yet</p>
            <p className="text-sm text-gray-400 italic">
              Your summer story at Palacio de Oro starts here.
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <GlassCard key={booking.id} className="p-6 hover:border-palacio-gold/40 transition-all border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
                  <div className="space-y-1">
                    <p className="text-gray-400 text-[10px] uppercase tracking-widest font-cinzel">Reference</p>
                    <p className="font-cinzel text-lg text-palacio-gold">
                      {booking.reference_number}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400 text-[10px] uppercase tracking-widest font-cinzel">Check-in</p>
                    <p className="text-white font-poppins">
                      {new Date(booking.check_in_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400 text-[10px] uppercase tracking-widest font-cinzel">Check-out</p>
                    <p className="text-white font-poppins">
                      {new Date(booking.check_out_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400 text-[10px] uppercase tracking-widest font-cinzel">Guest Count</p>
                    <p className="text-white font-poppins">{booking.guest_count} Person/s</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400 text-[10px] uppercase tracking-widest font-cinzel">Total Amount</p>
                    <p className="font-cinzel text-xl text-palacio-gold">
                      ${booking.total_price}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-white/10 gap-4">
                  <StatusBadge status={booking.status} size="md" />
                  <div className="flex flex-wrap gap-6 text-xs font-cinzel">
                    <div className="flex flex-col items-end">
                      <span className="text-gray-500 uppercase tracking-tighter">Payment Mode</span>
                      <span className="text-palacio-gold font-bold">{booking.payment_method}</span>
                    </div>
                    {booking.downpayment_amount > 0 && (
                      <div className="flex flex-col items-end">
                        <span className="text-gray-500 uppercase tracking-tighter">Secured via Downpayment</span>
                        <span className="text-palacio-gold font-bold">${booking.downpayment_amount}</span>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
