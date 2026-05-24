import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Mail, Phone, Calendar, Award, MapPin, Edit2, Camera, Save, X, Sparkles, Crown, Star } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', phone: '', address: '' });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

  const handleMouseMove = (e: React.MouseEvent<<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x: x * 8, y: y * -8 });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
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
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#FFD700]/20 border-t-[#FFD700] rounded-full animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#FFD700] w-6 h-6 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="bg-[#0f0f1e]/60 backdrop-blur-xl border border-[#FFD700]/15 rounded-2xl p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <Crown className="w-12 h-12 text-[#FFD700] mx-auto mb-4 opacity-50" />
          <p className="text-gray-400 mb-4">Please login to view your profile</p>
          <button className="px-6 py-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0a0a1a] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#FFD700]/25 transition">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-24 pb-12 px-4 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#FFD700]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FFA500]/5 rounded-full blur-3xl" />
      
      <div className="max-w-3xl mx-auto relative z-10">
        
        <div 
          className="bg-[#0f0f1e]/60 backdrop-blur-xl border border-[#FFD700]/15 rounded-2xl overflow-hidden mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `perspective(1000px) rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg)`,
            transition: 'transform 0.2s ease-out'
          }}
        >
          <div className="h-48 relative overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200&h=400&fit=crop&q=80"
              alt="Cover" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0f0f1e]" />
            <div className="absolute inset-0 bg-[#0a0a1a]/30" />
            <div className="absolute top-4 right-4 flex gap-2">
              <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-[#FFA500] rounded-full animate-pulse delay-75" />
              <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse delay-150" />
            </div>
          </div>
          
          <div className="px-8 pb-8 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 mb-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF8C00] flex items-center justify-center text-[#0f0f1e] text-4xl font-bold border-4 border-[#0f0f1e] shadow-[0_0_30px_rgba(255,215,0,0.3)] group-hover:shadow-[0_0_50px_rgba(255,215,0,0.5)] transition-shadow duration-500">
                  {getInitial()}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[#FFD700] rounded-full p-1.5 border-2 border-[#0f0f1e]">
                  <Star size={12} className="text-[#0f0f1e] fill-current" />
                </div>
                <button className="absolute bottom-2 right-2 p-2 bg-[#0f0f1e]/80 backdrop-blur-sm rounded-full text-[#FFD700] hover:bg-[#FFD700] hover:text-[#0f0f1e] transition opacity-0 group-hover:opacity-100">
                  <Camera size={14} />
                </button>
              </div>
              
              <div className="flex-1 mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold text-[#FFD700]">{getDisplayName()}</h1>
                  <Crown size={20} className="text-[#FFD700] opacity-60" />
                </div>
                <p className="text-gray-400 text-sm">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/10 text-[#FFD700] rounded-full text-xs border border-[#FFD700]/30 font-medium">
                    {getRole()}
                  </span>
                  <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded-full text-xs border border-green-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Active
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => editing ? setEditing(false) : setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg text-[#FFD700] hover:bg-[#FFD700]/20 hover:border-[#FFD700]/50 transition text-sm backdrop-blur-sm"
              >
                {editing ? <X size={16} /> : <Edit2 size={16} />}
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {editing ? (
              <div className="space-y-4 bg-[#0a0a1a]/50 backdrop-blur-sm rounded-xl p-6 border border-[#FFD700]/10">
                <div>
                  <label className="block text-[#FFD700] text-sm mb-2 font-medium">Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full bg-[#0f0f1e]/80 border border-[#FFD700]/20 rounded-lg px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none focus:ring-1 focus:ring-[#FFD700]/50 transition"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-[#FFD700] text-sm mb-2 font-medium">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-[#0f0f1e]/80 border border-[#FFD700]/20 rounded-lg px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none focus:ring-1 focus:ring-[#FFD700]/50 transition"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-[#FFD700] text-sm mb-2 font-medium">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-[#0f0f1e]/80 border border-[#FFD700]/20 rounded-lg px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none focus:ring-1 focus:ring-[#FFD700]/50 transition"
                    placeholder="Enter address"
                  />
                </div>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0a0a1a] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#FFD700]/25 transition"
                >
                  <Save size={16} /> Save Changes
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: User, label: 'Full Name', value: getDisplayName() },
                  { icon: Mail, label: 'Email', value: user.email },
                  { icon: Phone, label: 'Phone', value: profile?.phone || 'Not set' },
                  { icon: MapPin, label: 'Address', value: profile?.address || 'Not set' },
                  { icon: Calendar, label: 'Member Since', value: new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                  { icon: Award, label: 'Account Status', value: 'Active', isStatus: true }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-4 bg-[#0a0a1a]/40 backdrop-blur-sm rounded-xl border border-[#FFD700]/10 hover:border-[#FFD700]/30 hover:bg-[#0a0a1a]/60 transition-all duration-300 group"
                  >
                    <div className="p-2.5 bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/10 rounded-lg group-hover:from-[#FFD700]/30 group-hover:to-[#FFA500]/20 transition">
                      <item.icon size={18} className="text-[#FFD700]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-500 text-xs uppercase tracking-wider">{item.label}</p>
                      {item.isStatus ? (
                        <p className="text-green-400 font-medium flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          {item.value}
                        </p>
                      ) : (
                        <p className="text-white font-medium truncate">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#0f0f1e]/60 backdrop-blur-xl border border-[#FFD700]/15 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <h3 className="text-[#FFD700] font-semibold mb-6 flex items-center gap-2 text-lg">
            <Award size={22} className="text-[#FFA500]" /> 
            <span className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">Activity Overview</span>
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Bookings', value: profile?.total_bookings || 0, icon: Calendar },
              { label: 'Orders', value: profile?.total_orders || 0, icon: Star },
              { label: 'Rating', value: '4.9', icon: Award, isDecimal: true }
            ].map((stat, index) => (
              <div 
                key={index}
                className="text-center p-5 bg-[#0a0a1a]/40 backdrop-blur-sm rounded-xl border border-[#FFD700]/10 hover:border-[#FFD700]/25 hover:bg-[#0a0a1a]/60 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-[#FFD700]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <stat.icon size={20} className="text-[#FFD700]/60 mx-auto mb-2 group-hover:text-[#FFD700] transition" />
                <p className={`font-bold text-[#FFD700] group-hover:scale-110 transition-transform ${stat.isDecimal ? 'text-3xl' : 'text-3xl'}`}>
                  {stat.value}
                </p>
                <p className="text-gray-500 text-xs mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
