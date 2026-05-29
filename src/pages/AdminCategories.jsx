import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCat, setEditingCat] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    icon: '📦',
    count: 0,
    color: 'bg-blue-50 text-blue-600',
    image_url: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('count', { ascending: false });
    setCategories(data || []);
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
    if (!formData.id || !formData.name) {
      alert('المعرف (id) والاسم مطلوبان');
      return;
    }

    if (editingCat) {
      // تحديث
      const { error } = await supabase
        .from('categories')
        .update({
          name: formData.name,
          icon: formData.icon,
          count: formData.count,
          color: formData.color,
          image_url: formData.image_url,
        })
        .eq('id', formData.id);
      if (error) alert('فشل التحديث: ' + error.message);
      else alert('تم التحديث بنجاح');
    } else {
      // إضافة جديدة
      const { error } = await supabase.from('categories').insert([formData]);
      if (error) alert('فشل الإضافة: ' + error.message);
      else alert('تمت الإضافة بنجاح');
    }
    setEditingCat(null);
    setFormData({
      id: '',
      name: '',
      icon: '📦',
      count: 0,
      color: 'bg-blue-50 text-blue-600',
      image_url: '',
    });
    fetchCategories();
  };

  const handleEdit = (cat) => {
    setEditingCat(cat);
    setFormData({
      id: cat.id,
      name: cat.name,
      icon: cat.icon || '📦',
      count: cat.count || 0,
      color: cat.color || 'bg-blue-50 text-blue-600',
      image_url: cat.image_url || '',
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا القسم؟')) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) alert('فشل الحذف: ' + error.message);
      else {
        alert('تم الحذف بنجاح');
        fetchCategories();
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingCat(null);
    setFormData({
      id: '',
      name: '',
      icon: '📦',
      count: 0,
      color: 'bg-blue-50 text-blue-600',
      image_url: '',
    });
  };

  if (loading && categories.length === 0) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">إدارة الأقسام</h2>

      {/* نموذج الإضافة/التعديل */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h3 className="text-lg font-semibold mb-4">{editingCat ? 'تعديل القسم' : 'إضافة قسم جديد'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input name="id" placeholder="المعرف (id) - إنجليزي" value={formData.id} onChange={handleInputChange} className="border rounded-lg p-2" required disabled={editingCat} />
          <input name="name" placeholder="اسم القسم" value={formData.name} onChange={handleInputChange} className="border rounded-lg p-2" required />
          <input name="icon" placeholder="أيقونة (إيموجي)" value={formData.icon} onChange={handleInputChange} className="border rounded-lg p-2" />
          <input name="count" type="number" placeholder="عدد المنتجات" value={formData.count} onChange={handleInputChange} className="border rounded-lg p-2" />
          <input name="color" placeholder="لون الخلفية (Tailwind class)" value={formData.color} onChange={handleInputChange} className="border rounded-lg p-2" />
          <input name="image_url" placeholder="رابط الصورة (اختياري)" value={formData.image_url} onChange={handleInputChange} className="border rounded-lg p-2" />
        </div>
        <div className="flex gap-2 mt-4">
          <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
            {editingCat ? 'تحديث' : 'إضافة'}
          </button>
          {editingCat && (
            <button type="button" onClick={handleCancelEdit} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400">
              إلغاء
            </button>
          )}
        </div>
      </form>

      {/* عرض الأقسام */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white p-4 rounded-xl shadow-sm border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">{cat.icon || '📦'}</span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{cat.name}</h3>
                <p className="text-xs text-gray-500">المعرف: {cat.id}</p>
                <p className="text-xs text-gray-500">المنتجات: {cat.count}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(cat)} className="text-blue-600 text-sm hover:underline">تعديل</button>
              <button onClick={() => handleDelete(cat.id)} className="text-red-600 text-sm hover:underline">حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}