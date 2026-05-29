import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AdminContent() {
  const [content, setContent] = useState({
    heroTitle: '',
    heroSubtitle: '',
    ctaTitle: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    const { data } = await supabase.from('site_content').select('*');
    const map = { heroTitle: '', heroSubtitle: '', ctaTitle: '' };
    if (data) {
      data.forEach(item => { map[item.key] = item.value; });
    }
    setContent(map);
    setLoading(false);
  };

  const handleChange = (key, value) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      for (const [key, value] of Object.entries(content)) {
        await supabase.from('site_content').upsert({ key, value }, { onConflict: 'key' });
      }
      setMessage('✅ تم حفظ المحتوى بنجاح');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">المحتوى العام (الصفحة الرئيسية)</h2>

      {message && (
        <div className={`p-3 rounded-lg mb-4 ${message.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {message}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
        <div>
          <label className="block text-sm font-bold mb-1">العنوان الرئيسي (Hero Title)</label>
          <input
            value={content.heroTitle}
            onChange={(e) => handleChange('heroTitle', e.target.value)}
            className="w-full border rounded-lg p-2"
            placeholder="مثال: المنصة الموثوقة لتوفير منتجات متجرك"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">الوصف المختصر (Hero Subtitle)</label>
          <textarea
            value={content.heroSubtitle}
            onChange={(e) => handleChange('heroSubtitle', e.target.value)}
            rows="3"
            className="w-full border rounded-lg p-2"
            placeholder="مثال: نوفر لك آلاف المنتجات الجاهزة لمتجرك الإلكتروني..."
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">نص زر الحث (CTA Title)</label>
          <input
            value={content.ctaTitle}
            onChange={(e) => handleChange('ctaTitle', e.target.value)}
            className="w-full border rounded-lg p-2"
            placeholder="مثال: ابدأ الآن مجاناً"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>
    </div>
  );
}