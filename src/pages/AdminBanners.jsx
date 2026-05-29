import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    bg_gradient: 'from-purple-500 to-indigo-600',
    sort_order: 0,
    is_visible: true,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    const { data } = await supabase.from('banners').select('*').order('sort_order');
    setBanners(data || []);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      alert('العنوان مطلوب');
      return;
    }

    if (editing) {
      const { error } = await supabase
        .from('banners')
        .update(formData)
        .eq('id', editing.id);
      if (error) alert('فشل التحديث: ' + error.message);
      else alert('تم التحديث بنجاح');
    } else {
      const { error } = await supabase.from('banners').insert([formData]);
      if (error) alert('فشل الإضافة: ' + error.message);
      else alert('تمت الإضافة بنجاح');
    }
    setEditing(null);
    setFormData({
      title: '',
      subtitle: '',
      image_url: '',
      bg_gradient: 'from-purple-500 to-indigo-600',
      sort_order: 0,
      is_visible: true,
    });
    fetchBanners();
  };

  const handleEdit = (banner) => {
    setEditing(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image_url: banner.image_url || '',
      bg_gradient: banner.bg_gradient || 'from-purple-500 to-indigo-600',
      sort_order: banner.sort_order || 0,
      is_visible: banner.is_visible !== false,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا البانر؟')) {
      const { error } = await supabase.from('banners').delete().eq('id', id);
      if (error) alert('فشل الحذف: ' + error.message);
      else {
        alert('تم الحذف بنجاح');
        fetchBanners();
      }
    }
  };

  const toggleVisibility = async (id, current) => {
    await supabase.from('banners').update({ is_visible: !current }).eq('id', id);
    setBanners(banners.map(b => b.id === id ? { ...b, is_visible: !current } : b));
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setFormData({
      title: '',
      subtitle: '',
      image_url: '',
      bg_gradient: 'from-purple-500 to-indigo-600',
      sort_order: 0,
      is_visible: true,
    });
  };

  if (loading && banners.length === 0) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">إدارة البانرات</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h3 className="text-lg font-semibold mb-4">{editing ? 'تعديل بانر' : 'إضافة بانر جديد'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="title" placeholder="العنوان" value={formData.title} onChange={handleInputChange} className="border rounded-lg p-2" required />
          <input name="subtitle" placeholder="العنوان الفرعي" value={formData.subtitle} onChange={handleInputChange} className="border rounded-lg p-2" />
          <input name="image_url" placeholder="رابط الصورة (اختياري)" value={formData.image_url} onChange={handleInputChange} className="border rounded-lg p-2" />
          <input name="bg_gradient" placeholder="تدرج لوني (مثال: from-purple-500 to-indigo-600)" value={formData.bg_gradient} onChange={handleInputChange} className="border rounded-lg p-2" />
          <input name="sort_order" type="number" placeholder="ترتيب العرض" value={formData.sort_order} onChange={handleInputChange} className="border rounded-lg p-2" />
          <label className="flex items-center gap-2"><input type="checkbox" name="is_visible" checked={formData.is_visible} onChange={handleInputChange} /> مرئي</label>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
            {editing ? 'تحديث' : 'إضافة'}
          </button>
          {editing && (
            <button type="button" onClick={handleCancelEdit} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400">
              إلغاء
            </button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map(banner => (
          <div key={banner.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${!banner.is_visible ? 'opacity-60' : ''}`}>
            <div className={`h-32 bg-gradient-to-r ${banner.bg_gradient} flex items-center justify-center text-white text-center p-4`}>
              <div>
                <h3 className="font-bold text-lg">{banner.title}</h3>
                {banner.subtitle && <p className="text-sm opacity-90">{banner.subtitle}</p>}
              </div>
            </div>
            <div className="p-4 flex justify-between items-center">
              <button onClick={() => toggleVisibility(banner.id, banner.is_visible)} className="text-sm text-purple-600 hover:underline">
                {banner.is_visible ? 'إخفاء' : 'إظهار'}
              </button>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(banner)} className="text-blue-600 text-sm hover:underline">تعديل</button>
                <button onClick={() => handleDelete(banner.id)} className="text-red-600 text-sm hover:underline">حذف</button>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && <div className="text-center text-gray-500 py-8 col-span-full">لا توجد بانرات بعد</div>}
      </div>
    </div>
  );
}