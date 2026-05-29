import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AdminStats() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    icon: '',
    value: 0,
    label: '',
    is_image: false,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const { data } = await supabase.from('stats').select('*').order('id');
    setStats(data || []);
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
    if (!formData.label || !formData.value) {
      alert('الاسم والقيمة مطلوبان');
      return;
    }

    if (editing) {
      const { error } = await supabase
        .from('stats')
        .update({
          icon: formData.icon,
          value: parseInt(formData.value),
          label: formData.label,
          is_image: formData.is_image,
        })
        .eq('id', editing.id);
      if (error) alert('فشل التحديث: ' + error.message);
      else alert('تم التحديث بنجاح');
    } else {
      const { error } = await supabase.from('stats').insert([{
        icon: formData.icon,
        value: parseInt(formData.value),
        label: formData.label,
        is_image: formData.is_image,
      }]);
      if (error) alert('فشل الإضافة: ' + error.message);
      else alert('تمت الإضافة بنجاح');
    }
    setEditing(null);
    setFormData({ icon: '', value: 0, label: '', is_image: false });
    fetchStats();
  };

  const handleEdit = (stat) => {
    setEditing(stat);
    setFormData({
      icon: stat.icon || '',
      value: stat.value,
      label: stat.label,
      is_image: stat.is_image || false,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الإحصائية؟')) {
      const { error } = await supabase.from('stats').delete().eq('id', id);
      if (error) alert('فشل الحذف: ' + error.message);
      else {
        alert('تم الحذف بنجاح');
        fetchStats();
      }
    }
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setFormData({ icon: '', value: 0, label: '', is_image: false });
  };

  if (loading && stats.length === 0) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">إدارة الإحصائيات (أرقام المنصة)</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h3 className="text-lg font-semibold mb-4">{editing ? 'تعديل إحصائية' : 'إضافة إحصائية جديدة'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="label" placeholder="الاسم (مثال: تاجر نشط)" value={formData.label} onChange={handleInputChange} className="border rounded-lg p-2" required />
          <input name="value" type="number" placeholder="القيمة" value={formData.value} onChange={handleInputChange} className="border rounded-lg p-2" required />
          <input name="icon" placeholder="مسار الأيقونة (مثال: /images/stats/traders.png)" value={formData.icon} onChange={handleInputChange} className="border rounded-lg p-2" />
          <label className="flex items-center gap-2">
            <input type="checkbox" name="is_image" checked={formData.is_image} onChange={handleInputChange} />
            هل الأيقونة صورة؟
          </label>
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
        {stats.map(stat => (
          <div key={stat.id} className="bg-white p-4 rounded-xl shadow-sm border flex items-center justify-between">
            <div className="flex items-center gap-3">
              {stat.is_image ? (
                <img src={stat.icon} alt={stat.label} className="w-10 h-10 object-contain" />
              ) : (
                <span className="text-2xl">{stat.icon || '📊'}</span>
              )}
              <div>
                <h3 className="font-bold text-gray-800">{stat.label}</h3>
                <p className="text-lg font-semibold text-purple-600">{stat.value.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(stat)} className="text-blue-600 text-sm hover:underline">تعديل</button>
              <button onClick={() => handleDelete(stat.id)} className="text-red-600 text-sm hover:underline">حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}