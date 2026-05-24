import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Mail, Phone, Calendar, Award, MapPin, Edit2, Camera, Save, X, Sparkles, Crown, Star, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', phone: '', address: '' });

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    setUser(authUser);
    if (authUser) {
      const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single();
      if (data) {
        setProfile(data);
        setFormData({ full_name: data.name || '', phone: data.phone || '', address: data.address || '' });
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    await supabase.from('users').update({ name: formData.full_name, phone: formData.phone, address: formData.address }).eq('id', user.id);
    await loadProfile();
    setEditing(false);
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center text-[#FFD700]"><Sparkles className="animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#050508] pt-24 pb-12 px-4 text-gray-200">
      <div className="max-w-4xl mx-auto">
        
        {/* Profile Header Card */}
        <motion.div 
          layout
          className="relative rounded-3xl overflow-hidden border border-[#FFD700]/10 bg-[#0f0f1e]/40 backdrop-blur-2xl shadow-2xl"
        >
          <div className="h-40 bg-gradient-to-r from-[#1a1a2e] to-[#0f0f1e] opacity-80" />
          
          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-start gap-6 -mt-12">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#FFD700] to-[#FFA500] p-1 shadow-lg shadow-[#FFD700]/20">
                  <div className="w-full h-full rounded-full bg-[#0a0a1a] flex items-center justify-center text-2xl font-bold text-[#FFD700]">
                    {profile?.name?.charAt(0).toUpperCase() || 'M'}
                  </div>
                </div>
              </div>
              
              <div className="pt-12 flex-1">
                <h1 className="text-3xl font-light tracking-wider text-white">{profile?.name || 'Guest'}</h1>
                <p className="text-[#FFD700]/60 text-sm">{user?.email}</p>
              </div>

              <button 
                onClick={() => setEditing(!editing)}
                className="mt-12 flex items-center gap-2 px-6 py-2 rounded-full border border-[#FFD700]/20 hover:bg-[#FFD700]/10 transition-all text-sm"
              >
                {editing ? <X size={14}/> : <Edit2 size={14}/>} {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {/* Profile Data or Edit Form */}
            <div className="mt-8">
              <AnimatePresence mode="wait">
                {editing ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input className="bg-[#1a1a2e] border border-[#FFD700]/20 rounded-xl p-3" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="Full Name" />
                    <input className="bg-[#1a1a2e] border border-[#FFD700]/20 rounded-xl p-3" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Phone" />
                    <button onClick={handleSave} className="md:col-span-2 bg-[#FFD700] text-[#0a0a1a] font-bold py-3 rounded-xl hover:opacity-90">Save Changes</button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { icon: MapPin, label: 'Address', val: profile?.address || 'Not set' },
                      { icon: Calendar, label: 'Member Since', val: new Date(user?.created_at).toLocaleDateString() }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[#0f0f1e]/50 border border-white/5">
                        <item.icon className="text-[#FFD700]" size={20} />
                        <div>
                          <p className="text-[10px] uppercase text-gray-500 tracking-widest">{item.label}</p>
                          <p className="text-sm font-medium">{item.val}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Activity Section */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { label: 'Bookings', val: profile?.total_bookings || 0 },
            { label: 'Orders', val: profile?.total_orders || 0 },
            { label: 'Rating', val: '4.9' }
          ].map((stat, i) => (
            <motion.div key={i} whileHover={{ y: -5 }} className="bg-[#0f0f1e]/60 border border-white/5 p-6 rounded-3xl text-center">
              <p className="text-3xl font-light text-[#FFD700]">{stat.val}</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
