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
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <GlassCard className="p-8 text-center max-w-md">
          <h2 className="font-playfair text-2xl text-palacio-gold mb-4">
            Login Required
          </h2>
          <p className="text-gray-400">
            Please log in to view your bookings.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title mb-8">My Bookings</h1>

        {loading ? (
          <LoadingSpinner />
        ) : bookings.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <p className="text-gray-400 mb-6">No bookings yet</p>
            <p className="text-sm text-gray-500">
              Start planning your luxury getaway at Palacio de Oro
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <GlassCard key={booking.id} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Reference Number</p>
                    <p className="font-cinzel text-lg text-palacio-gold">
                      {booking.reference_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Check-in</p>
                    <p className="font-cinzel text-palacio-gold">
                      {new Date(booking.check_in_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Check-out</p>
                    <p className="font-cinzel text-palacio-gold">
                      {new Date(booking.check_out_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Guests</p>
                    <p className="font-cinzel text-palacio-gold">
                      {booking.guest_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total</p>
                    <p className="font-cinzel text-lg text-palacio-gold">
                      ${booking.total_price}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-palacio-gold/20">
                  <StatusBadge status={booking.status} size="md" />
                  <div className="flex gap-3 text-sm text-gray-400">
                    <span>
                      Payment:{' '}
                      <span className="text-palacio-gold capitalize">
                        {booking.payment_method}
                      </span>
                    </span>
                    {booking.downpayment_amount > 0 && (
                      <span>
                        Downpayment:{' '}
                        <span className="text-palacio-gold">
                          ${booking.downpayment_amount}
                        </span>
                      </span>
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
