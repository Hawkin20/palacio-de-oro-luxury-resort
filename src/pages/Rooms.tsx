import { useState, useEffect } from 'react';
import { Calendar, Users, X, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Room, Cottage, Booking } from '../lib/types';
import GlassCard from '../components/GlassCard';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

interface RoomsProps {
  userId?: string;
  isLoggedIn: boolean;
  onNavigate: (page: string) => void;
}

export default function Rooms({ userId, isLoggedIn, onNavigate }: RoomsProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [cottages, setCottages] = useState<Cottage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<Room | Cottage | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guestCount: 1,
    paymentMethod: 'card' as 'cash' | 'gcash' | 'card',
    downpayment: false,
  });
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomsRes, cottagesRes] = await Promise.all([
        supabase.from('rooms').select('*'),
        supabase.from('cottages').select('*'),
      ]);

      if (roomsRes.data) setRooms(roomsRes.data);
      if (cottagesRes.data) setCottages(cottagesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!isLoggedIn || !userId) {
      setBookingError('Please log in to make a booking');
      return;
    }

    if (!bookingData.checkIn || !bookingData.checkOut) {
      setBookingError('Please select both check-in and check-out dates');
      return;
    }

    if (new Date(bookingData.checkOut) <= new Date(bookingData.checkIn)) {
      setBookingError('Check-out date must be after check-in date');
      return;
    }

    try {
      const nights =
        (new Date(bookingData.checkOut).getTime() -
          new Date(bookingData.checkIn).getTime()) /
        (1000 * 60 * 60 * 24);
      const room = selectedRoom as Room | Cottage;
      const totalPrice = nights * room.price_per_night;

      const refNumber = `BK${Date.now()}`;

      const bookingPayload: any = {
        guest_id: userId,
        check_in_date: bookingData.checkIn,
        check_out_date: bookingData.checkOut,
        guest_count: bookingData.guestCount,
        total_price: totalPrice,
        payment_method: bookingData.paymentMethod,
        downpayment_amount: bookingData.downpayment ? totalPrice * 0.5 : 0,
        reference_number: refNumber,
        status: 'pending',
      };

      if ('room_type' in room) {
        bookingPayload.room_id = room.id;
      } else {
        bookingPayload.cottage_id = room.id;
      }

      const { error } = await supabase.from('bookings').insert([bookingPayload]);
      if (error) throw error;

      setBookingSuccess(true);
      setBookingData({
        checkIn: '', checkOut: '', guestCount: 1, paymentMethod: 'card', downpayment: false,
      });

      setTimeout(() => {
        setShowBookingModal(false);
        setSelectedRoom(null);
        setBookingSuccess(false);
      }, 2000);
    } catch (error: any) {
      setBookingError(error.message || 'Failed to create booking');
    }
  };

  const filtered = filter === 'all' 
    ? [...rooms.map(r => ({ ...r, type: 'room' })), ...cottages.map(c => ({ ...c, type: 'cottage' }))]
    : filter.startsWith('room_') 
      ? rooms.filter(r => r.room_type === filter.replace('room_', '')).map(r => ({ ...r, type: 'room' }))
      : cottages.filter(c => c.cottage_type === filter.replace('cottage_', '')).map(c => ({ ...c, type: 'cottage' }));

  return (
    <div className="relative min-h-screen pt-24 pb-20 overflow-hidden">
      {/* Summer Background Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center fixed"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80")', // Luxury resort pool view
          filter: 'brightness(0.15) saturate(1.1)' 
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-xl">
            <h1 className="section-title text-left mb-4 text-palacio-gold">Accommodations</h1>
            <p className="text-gray-300 font-poppins text-sm leading-relaxed italic">
              From majestic villas to cozy beachside cottages, discover your perfect sanctuary under the golden sun.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-end">
            {[
              { label: 'All', value: 'all' },
              { label: 'Rooms', value: 'room_standard' },
              { label: 'Luxury', value: 'room_luxury_villa' },
              { label: 'Cottages', value: 'cottage_family' },
            ].map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`px-6 py-2 rounded-full font-cinzel text-[10px] tracking-widest smooth-transition border ${
                  filter === btn.value
                    ? 'bg-palacio-gold text-palacio-black border-palacio-gold'
                    : 'bg-white/5 text-palacio-gold border-palacio-gold/30 hover:bg-palacio-gold/20'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((item: any) => (
              <GlassCard
                key={item.id}
                className="overflow-hidden group hover:border-palacio-gold/50 transition-all duration-500 flex flex-col h-full"
                onClick={() => {
                  setSelectedRoom(item);
                  setShowBookingModal(true);
                }}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <StatusBadge status={item.status} size="sm" />
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 uppercase font-cinzel tracking-tighter">Starts at</p>
                      <p className="text-palacio-gold font-cinzel font-bold text-xl">${item.price_per_night}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="font-playfair text-2xl text-white mb-3 group-hover:text-palacio-gold transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-gray-400 text-xs mb-6 line-clamp-2 italic leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-auto space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Users size={14} className="text-palacio-gold" />
                        <span className="text-[11px] font-cinzel tracking-widest">{item.capacity} Guests</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Info size={14} className="text-palacio-gold" />
                        <span className="text-[11px] font-cinzel tracking-widest uppercase">{item.type}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {item.amenities?.slice(0, 3).map((amenity: string) => (
                        <span key={amenity} className="text-[9px] font-cinzel tracking-widest bg-white/5 text-gray-400 px-3 py-1 rounded-full border border-white/10">
                          {amenity}
                        </span>
                      ))}
                    </div>

                    <button
                      disabled={item.status !== 'available'}
                      className="w-full py-3 bg-palacio-gold text-palacio-black rounded-lg font-cinzel text-xs font-bold hover:bg-white smooth-transition shadow-lg shadow-palacio-gold/10 disabled:opacity-30"
                    >
                      {item.status === 'available' ? 'RESERVE NOW' : 'FULLY BOOKED'}
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false); setSelectedRoom(null); setBookingError(''); setBookingSuccess(false);
        }}
        title={selectedRoom ? `Reserve ${selectedRoom.name}` : 'Reservation'}
        footer={
          <div className="flex gap-3 w-full">
            <button
              onClick={() => { setShowBookingModal(false); setSelectedRoom(null); }}
              className="flex-1 px-4 py-3 bg-white/5 text-gray-400 rounded-lg font-cinzel text-xs hover:bg-white/10"
            >
              Back
            </button>
            <button
              onClick={handleBooking}
              disabled={bookingSuccess}
              className="flex-1 px-4 py-3 bg-palacio-gold text-palacio-black rounded-lg font-cinzel text-xs font-bold hover:bg-white shadow-xl shadow-palacio-gold/20"
            >
              {bookingSuccess ? 'Confirmed!' : 'Confirm Reservation'}
            </button>
          </div>
        }
      >
        {bookingSuccess ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-6">🌞</div>
            <h3 className="font-playfair text-2xl text-palacio-gold mb-3">Reservation Placed!</h3>
            <p className="text-gray-400 text-sm italic">Get your beach gear ready, we'll see you soon at Palacio de Oro.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookingError && (
              <div className="p-3 bg-red-900/40 border border-red-500 rounded text-red-300 text-[10px] font-bold tracking-widest uppercase text-center">
                {bookingError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-cinzel text-palacio-gold tracking-widest uppercase">Check-in</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 text-palacio-gold opacity-50" size={14} />
                  <input
                    type="date"
                    value={bookingData.checkIn}
                    onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:border-palacio-gold outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-cinzel text-palacio-gold tracking-widest uppercase">Check-out</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 text-palacio-gold opacity-50" size={14} />
                  <input
                    type="date"
                    value={bookingData.checkOut}
                    onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:border-palacio-gold outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-cinzel text-palacio-gold tracking-widest uppercase">Guests</label>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 text-palacio-gold opacity-50" size={14} />
                  <input
                    type="number"
                    min="1"
                    max={selectedRoom?.capacity || 10}
                    value={bookingData.guestCount}
                    onChange={(e) => setBookingData({ ...bookingData, guestCount: parseInt(e.target.value) || 1 })}
                    className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:border-palacio-gold outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-cinzel text-palacio-gold tracking-widest uppercase">Payment</label>
                <select
                  value={bookingData.paymentMethod}
                  onChange={(e) => setBookingData({ ...bookingData, paymentMethod: e.target.value as any })}
                  className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:border-palacio-gold outline-none"
                >
                  <option value="card">Credit Card</option>
                  <option value="gcash">GCash</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 smooth-transition">
              <input
                type="checkbox"
                checked={bookingData.downpayment}
                onChange={(e) => setBookingData({ ...bookingData, downpayment: e.target.checked })}
                className="w-4 h-4 rounded accent-palacio-gold"
              />
              <div className="flex flex-col">
                <span className="text-[11px] font-cinzel text-white tracking-wider">Secure with Downpayment</span>
                <span className="text-[9px] text-gray-500 uppercase tracking-tighter italic">Pay 50% now to confirm your slot</span>
              </div>
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
}
