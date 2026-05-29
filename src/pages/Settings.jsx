import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Settings() {
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    store_url: '',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          store_url: data.store_url || '',
          avatar_url: data.avatar_url || ''
        });
        else if (error && error.code !== 'PGRST116') console.error(error);
      }
    }
    getProfile();
  }, []);

  const uploadAvatar = async (event) => {
    setUploading(true);
    const file = event.target.files[0];
    if (!file) {
      setUploading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      setMessage('❌ فشل رفع الصورة');
    } else {
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const newAvatarUrl = publicUrl;
      setProfile({ ...profile, avatar_url: newAvatarUrl });
      await supabase.from('profiles').upsert({ id: user.id, avatar_url: newAvatarUrl });
      setMessage('✅ تم رفع الصورة بنجاح');
    }
    setUploading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage('❌ يجب تسجيل الدخول أولاً');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: profile.full_name,
      phone: profile.phone,
      store_url: profile.store_url,
      avatar_url: profile.avatar_url,
    });

    if (error) {
      setMessage('❌ حدث خطأ أثناء الحفظ: ' + error.message);
    } else {
      setMessage('✅ تم حفظ التغييرات بنجاح');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">الإعدادات</h1>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
        {/* صورة الملف الشخصي */}
        <div className="flex items-center gap-4">
          <img
            src={profile.avatar_url || '/images/default-avatar.png'}
            alt="Avatar"
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
          />
          <label className="bg-gray-100 px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-200 transition text-sm font-medium">
            {uploading ? 'جاري الرفع...' : 'تغيير الصورة'}
            <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
          </label>
        </div>

        {/* الاسم الكامل */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
          <input
            type="text"
            value={profile.full_name}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none"
            placeholder="اسمك الكامل"
          />
        </div>

        {/* رقم الجوال */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">رقم الجوال</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none"
            placeholder="05XXXXXXXX"
          />
        </div>

        {/* رابط المتجر */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">رابط متجرك</label>
          <input
            type="url"
            value={profile.store_url}
            onChange={(e) => setProfile({ ...profile, store_url: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none"
            placeholder="https://your-store.com"
          />
        </div>

        {/* رسالة نجاح أو خطأ */}
        {message && (
          <div className={`p-3 rounded-lg text-sm ${message.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {message}
          </div>
        )}

        {/* زر الحفظ */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>
    </div>
  );
}