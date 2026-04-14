import { useState, useEffect } from 'react';
import { Calendar, Users, X } from 'lucide-react';
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

      const { error } = await supabase
        .from('bookings')
        .insert([bookingPayload]);

      if (error) throw error;

      setBookingSuccess(true);
      setBookingData({
        checkIn: '',
        checkOut: '',
        guestCount: 1,
        paymentMethod: 'card',
        downpayment: false,
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

  const getFilteredItems = () => {
    if (filter === 'all') {
      return [
        ...rooms.map((r) => ({ ...r, type: 'room' })),
        ...cottages.map((c) => ({ ...c, type: 'cottage' })),
      ];
    } else if (filter.startsWith('room_')) {
      return rooms
        .filter((r) => r.room_type === filter.replace('room_', ''))
        .map((r) => ({ ...r, type: 'room' }));
    } else {
      return cottages
        .filter((c) => c.cottage_type === filter.replace('cottage_', ''))
        .map((c) => ({ ...c, type: 'cottage' }));
    }
  };

  const filtered = getFilteredItems();

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title mb-8">Our Accommodations</h1>

        <div className="mb-8 flex flex-wrap gap-2">
          {[
            { label: 'All', value: 'all' },
            { label: 'Standard Room', value: 'room_standard' },
            { label: 'Deluxe Room', value: 'room_deluxe' },
            { label: 'Suite', value: 'room_suite' },
            { label: 'Luxury Villa', value: 'room_luxury_villa' },
            { label: 'Small Cottage', value: 'cottage_small' },
            { label: 'Family Cottage', value: 'cottage_family' },
            { label: 'Barkada Cottage', value: 'cottage_barkada' },
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`px-4 py-2 rounded-lg font-cinzel text-sm smooth-transition ${
                filter === btn.value
                  ? 'bg-palacio-gold text-palacio-black'
                  : 'bg-palacio-gold/10 text-palacio-gold hover:bg-palacio-gold/20'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item: any) => (
              <GlassCard
                key={item.id}
                className="overflow-hidden cursor-pointer"
                onClick={() => {
                  setSelectedRoom(item);
                  setShowBookingModal(true);
                }}
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="font-playfair text-xl text-palacio-gold mb-2">
                    {item.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {item.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Capacity:</span>
                      <span className="text-palacio-gold font-cinzel">
                        {item.capacity} guests
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Price:</span>
                      <span className="text-palacio-gold font-cinzel font-bold">
                        ${item.price_per_night}/night
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-xs font-cinzel text-palacio-gold mb-2 uppercase">
                      Amenities
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {item.amenities?.slice(0, 3).map((amenity: string) => (
                        <span
                          key={amenity}
                          className="text-xs bg-palacio-gold/10 text-gray-300 px-2 py-1 rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                      {item.amenities?.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{item.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <StatusBadge status={item.status} size="sm" />
                    <button
                      disabled={item.status !== 'available'}
                      className="px-3 py-2 bg-palacio-gold/20 text-palacio-gold rounded font-cinzel text-sm hover:bg-palacio-gold/30 disabled:opacity-50 disabled:cursor-not-allowed smooth-transition"
                    >
                      {item.status === 'available' ? 'Book Now' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedRoom(null);
          setBookingError('');
          setBookingSuccess(false);
        }}
        title={selectedRoom ? `Book ${selectedRoom.name}` : 'Booking'}
        footer={
          <div className="flex gap-3 w-full">
            <button
              onClick={() => {
                setShowBookingModal(false);
                setSelectedRoom(null);
                setBookingError('');
                setBookingSuccess(false);
              }}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 smooth-transition"
            >
              Cancel
            </button>
            <button
              onClick={handleBooking}
              disabled={bookingSuccess}
              className="flex-1 px-4 py-2 bg-palacio-gold text-palacio-black rounded font-cinzel font-semibold hover:bg-palacio-gold/80 disabled:opacity-50 smooth-transition"
            >
              {bookingSuccess ? 'Booking Confirmed!' : 'Confirm Booking'}
            </button>
          </div>
        }
      >
        {bookingSuccess ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✓</div>
            <h3 className="font-playfair text-xl text-palacio-gold mb-2">
              Booking Confirmed!
            </h3>
            <p className="text-gray-400">
              Your reservation has been submitted. Our team will contact you shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookingError && (
              <div className="p-4 bg-red-900/40 border border-red-500 rounded text-red-300 text-sm">
                {bookingError}
              </div>
            )}

            <div>
              <label className="block text-sm font-cinzel text-palacio-gold mb-2">
                Check-in Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-palacio-gold" size={18} />
                <input
                  type="date"
                  value={bookingData.checkIn}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, checkIn: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-palacio-gold/30 rounded text-white focus:border-palacio-gold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-cinzel text-palacio-gold mb-2">
                Check-out Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-palacio-gold" size={18} />
                <input
                  type="date"
                  value={bookingData.checkOut}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, checkOut: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-palacio-gold/30 rounded text-white focus:border-palacio-gold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-cinzel text-palacio-gold mb-2">
                Number of Guests
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-3 text-palacio-gold" size={18} />
                <input
                  type="number"
                  min="1"
                  max={selectedRoom?.capacity || 10}
                  value={bookingData.guestCount}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      guestCount: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-palacio-gold/30 rounded text-white focus:border-palacio-gold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-cinzel text-palacio-gold mb-2">
                Payment Method
              </label>
              <select
                value={bookingData.paymentMethod}
                onChange={(e) =>
                  setBookingData({
                    ...bookingData,
                    paymentMethod: e.target.value as any,
                  })
                }
                className="w-full px-4 py-2 bg-white/10 border border-palacio-gold/30 rounded text-white focus:border-palacio-gold focus:outline-none"
              >
                <option value="card">Credit Card</option>
                <option value="gcash">GCash</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={bookingData.downpayment}
                onChange={(e) =>
                  setBookingData({ ...bookingData, downpayment: e.target.checked })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-400">
                Pay 50% downpayment now
              </span>
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
}
