import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    text: '',
    image_url: '',
    device: 'mobile',
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    const { data } = await supabase.from('testimonials').select('*').order('id', { ascending: false });
    setTestimonials(data || []);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.text) {
      alert('الاسم والنص مطلوبان');
      return;
    }

    if (editing) {
      const { error } = await supabase
        .from('testimonials')
        .update(formData)
        .eq('id', editing.id);
      if (error) alert('فشل التحديث: ' + error.message);
      else alert('تم التحديث بنجاح');
    } else {
      const { error } = await supabase.from('testimonials').insert([formData]);
      if (error) alert('فشل الإضافة: ' + error.message);
      else alert('تمت الإضافة بنجاح');
    }
    setEditing(null);
    setFormData({ name: '', role: '', text: '', image_url: '', device: 'mobile' });
    fetchTestimonials();
  };

  const handleEdit = (item) => {
    setEditing(item);
    setFormData({
      name: item.name,
      role: item.role || '',
      text: item.text,
      image_url: item.image_url || '',
      device: item.device || 'mobile',
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الشهادة؟')) {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) alert('فشل الحذف: ' + error.message);
      else {
        alert('تم الحذف بنجاح');
        fetchTestimonials();
      }
    }
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setFormData({ name: '', role: '', text: '', image_url: '', device: 'mobile' });
  };

  if (loading && testimonials.length === 0) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">إدارة قصص النجاح (الشهادات)</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h3 className="text-lg font-semibold mb-4">{editing ? 'تعديل الشهادة' : 'إضافة شهادة جديدة'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="name" placeholder="الاسم" value={formData.name} onChange={handleInputChange} className="border rounded-lg p-2" required />
          <input name="role" placeholder="الوظيفة / الدور" value={formData.role} onChange={handleInputChange} className="border rounded-lg p-2" />
          <textarea name="text" placeholder="النص" value={formData.text} onChange={handleInputChange} className="border rounded-lg p-2 col-span-2" rows="3" required />
          <input name="image_url" placeholder="رابط الصورة" value={formData.image_url} onChange={handleInputChange} className="border rounded-lg p-2" />
          <select name="device" value={formData.device} onChange={handleInputChange} className="border rounded-lg p-2">
            <option value="mobile">موبايل</option>
            <option value="laptop">لابتوب</option>
            <option value="tablet">تابلت</option>
          </select>
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

      <div className="space-y-4">
        {testimonials.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3">
                <img src={item.image_url || '/images/default-avatar.png'} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <strong className="text-gray-800">{item.name}</strong>
                  <span className="text-gray-500 text-sm mr-2">- {item.role}</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-2 max-w-lg">{item.text}</p>
              <p className="text-xs text-gray-400 mt-1">الجهاز: {item.device}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(item)} className="text-blue-600 text-sm hover:underline">تعديل</button>
              <button onClick={() => handleDelete(item.id)} className="text-red-600 text-sm hover:underline">حذف</button>
            </div>
          </div>
        ))}
        {testimonials.length === 0 && <div className="text-center text-gray-500 py-8">لا توجد شهادات بعد</div>}
      </div>
    </div>
  );
}