
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Mail, Phone, Calendar, Award, MapPin, Edit2, Camera, Save, X } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', phone: '', address: '' });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    setUser(authUser);

    if (authUser) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.name || '',
          phone: data.phone || '',
          address: data.address || ''
        });
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    
    const { error } = await supabase
      .from('users')
      .update({
        name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (!error) {
      await loadProfile();
      setEditing(false);
    }
  };

  const capitalizeFirst = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getDisplayName = () => {
    const name = profile?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest';
    return capitalizeFirst(name);
  };

  const getInitial = () => {
    return getDisplayName().charAt(0).toUpperCase();
  };

  const getRole = () => {
    return capitalizeFirst(profile?.role || 'Guest');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-[#FFD700] text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please login to view your profile</p>
          <button className="px-6 py-2 bg-[#FFD700] text-[#0a0a1a] rounded-lg font-semibold">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        <div className="bg-[#0f0f1e] border border-[#FFD700]/20 rounded-2xl overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-[#FFD700]/20 via-[#FFA500]/10 to-transparent relative">
            <button className="absolute bottom-4 right-4 p-2 bg-[#FFD700]/20 rounded-full text-[#FFD700] hover:bg-[#FFD700]/30 transition">
              <Camera size={16} />
            </button>
          </div>
          
          <div className="px-8 pb-8 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center text-[#0f0f1e] text-3xl font-bold border-4 border-[#0f0f1e] shadow-xl">
                  {getInitial()}
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-[#FFD700] rounded-full text-[#0f0f1e] hover:bg-[#FFA500] transition">
                  <Camera size={12} />
                </button>
              </div>
              
              <div className="flex-1 mb-2">
                <h1 className="text-2xl font-bold text-[#FFD700]">{getDisplayName()}</h1>
                <p className="text-gray-400 text-sm">{user.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-[#FFD700]/10 text-[#FFD700] rounded-full text-xs border border-[#FFD700]/20">
                  {getRole()}
                </span>
              </div>
              
              <button
                onClick={() => editing ? setEditing(false) : setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg text-[#FFD700] hover:bg-[#FFD700]/20 transition text-sm"
              >
                {editing ? <X size={16} /> : <Edit2 size={16} />}
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full bg-[#0a0a1a] border border-[#FFD700]/20 rounded-lg px-4 py-2.5 text-white focus:border-[#FFD700] focus:outline-none"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-[#0a0a1a] border border-[#FFD700]/20 rounded-lg px-4 py-2.5 text-white focus:border-[#FFD700] focus:outline-none"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-[#0a0a1a] border border-[#FFD700]/20 rounded-lg px-4 py-2.5 text-white focus:border-[#FFD700] focus:outline-none"
                    placeholder="Enter address"
                  />
                </div>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#FFD700] text-[#0a0a1a] rounded-lg font-semibold hover:bg-[#FFA500] transition"
                >
                  <Save size={16} /> Save Changes
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-[#0a0a1a] rounded-xl border border-[#FFD700]/10">
                  <div className="p-2 bg-[#FFD700]/10 rounded-lg">
                    <User size={18} className="text-[#FFD700]" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Full Name</p>
                    <p className="text-white font-medium">{getDisplayName()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-[#0a0a1a] rounded-xl border border-[#FFD700]/10">
                  <div className="p-2 bg-[#FFD700]/10 rounded-lg">
                    <Mail size={18} className="text-[#FFD700]" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Email</p>
                    <p className="text-white font-medium truncate">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-[#0a0a1a] rounded-xl border border-[#FFD700]/10">
                  <div className="p-2 bg-[#FFD700]/10 rounded-lg">
                    <Phone size={18} className="text-[#FFD700]" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Phone</p>
                    <p className="text-white font-medium">{profile?.phone || 'Not set'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-[#0a0a1a] rounded-xl border border-[#FFD700]/10">
                  <div className="p-2 bg-[#FFD700]/10 rounded-lg">
                    <MapPin size={18} className="text-[#FFD700]" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Address</p>
                    <p className="text-white font-medium">{profile?.address || 'Not set'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-[#0a0a1a] rounded-xl border border-[#FFD700]/10">
                  <div className="p-2 bg-[#FFD700]/10 rounded-lg">
                    <Calendar size={18} className="text-[#FFD700]" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Member Since</p>
                    <p className="text-white font-medium">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-[#0a0a1a] rounded-xl border border-[#FFD700]/10">
                  <div className="p-2 bg-[#FFD700]/10 rounded-lg">
                    <Award size={18} className="text-[#FFD700]" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Account Status</p>
                    <p className="text-green-400 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      Active
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#0f0f1e] border border-[#FFD700]/20 rounded-2xl p-6">
          <h3 className="text-[#FFD700] font-semibold mb-4 flex items-center gap-2">
            <Award size={20} /> Activity Overview
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-[#0a0a1a] rounded-xl border border-[#FFD700]/10">
              <p className="text-3xl font-bold text-[#FFD700]">0</p>
              <p className="text-gray-400 text-xs mt-1">Bookings</p>
            </div>
            <div className="text-center p-4 bg-[#0a0a1a] rounded-xl border border-[#FFD700]/10">
              <p className="text-3xl font-bold text-[#FFD700]">0</p>
              <p className="text-gray-400 text-xs mt-1">Orders</p>
            </div>
            <div className="text-center p-4 bg-[#0a0a1a] rounded-xl border border-[#FFD700]/10">
              <p className="text-3xl font-bold text-[#FFD700]">4.9</p>
              <p className="text-gray-400 text-xs mt-1">Rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
