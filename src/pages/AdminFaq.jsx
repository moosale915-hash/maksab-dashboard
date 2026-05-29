import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AdminFaq() {
  const [faq, setFaq] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
  });

  useEffect(() => {
    fetchFaq();
  }, []);

  const fetchFaq = async () => {
    setLoading(true);
    const { data } = await supabase.from('faq').select('*').order('id');
    setFaq(data || []);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) {
      alert('السؤال والإجابة مطلوبان');
      return;
    }

    if (editing) {
      const { error } = await supabase
        .from('faq')
        .update({ question: formData.question, answer: formData.answer })
        .eq('id', editing.id);
      if (error) alert('فشل التحديث: ' + error.message);
      else alert('تم التحديث بنجاح');
    } else {
      const { error } = await supabase.from('faq').insert([formData]);
      if (error) alert('فشل الإضافة: ' + error.message);
      else alert('تمت الإضافة بنجاح');
    }
    setEditing(null);
    setFormData({ question: '', answer: '' });
    fetchFaq();
  };

  const handleEdit = (item) => {
    setEditing(item);
    setFormData({ question: item.question, answer: item.answer });
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
      const { error } = await supabase.from('faq').delete().eq('id', id);
      if (error) alert('فشل الحذف: ' + error.message);
      else {
        alert('تم الحذف بنجاح');
        fetchFaq();
      }
    }
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setFormData({ question: '', answer: '' });
  };

  if (loading && faq.length === 0) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">إدارة الأسئلة الشائعة</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h3 className="text-lg font-semibold mb-4">{editing ? 'تعديل سؤال' : 'إضافة سؤال جديد'}</h3>
        <div className="space-y-4">
          <input name="question" placeholder="السؤال" value={formData.question} onChange={handleInputChange} className="w-full border rounded-lg p-2" required />
          <textarea name="answer" placeholder="الإجابة" value={formData.answer} onChange={handleInputChange} rows="4" className="w-full border rounded-lg p-2" required />
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
        {faq.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-gray-800">{item.question}</h3>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(item)} className="text-blue-600 text-sm hover:underline">تعديل</button>
                <button onClick={() => handleDelete(item.id)} className="text-red-600 text-sm hover:underline">حذف</button>
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-2">{item.answer}</p>
          </div>
        ))}
        {faq.length === 0 && <div className="text-center text-gray-500 py-8">لا توجد أسئلة شائعة بعد</div>}
      </div>
    </div>
  );
}