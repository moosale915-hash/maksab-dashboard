import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    price_monthly: '',
    price_yearly: '',
    period: 'شهرياً',
    description: '',
    features: [],
    popular: false,
  });
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    const { data } = await supabase.from('plans').select('*').order('price_monthly');
    setPlans(data || []);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id || !formData.name || !formData.price_monthly) {
      alert('المعرف (id)، الاسم، والسعر الشهري مطلوبة');
      return;
    }

    const planData = {
      id: formData.id,
      name: formData.name,
      price_monthly: parseFloat(formData.price_monthly),
      price_yearly: formData.price_yearly ? parseFloat(formData.price_yearly) : null,
      period: formData.period,
      description: formData.description,
      features: formData.features,
      popular: formData.popular,
    };

    if (editing) {
      const { error } = await supabase.from('plans').update(planData).eq('id', formData.id);
      if (error) alert('فشل التحديث: ' + error.message);
      else alert('تم التحديث بنجاح');
    } else {
      const { error } = await supabase.from('plans').insert([planData]);
      if (error) alert('فشل الإضافة: ' + error.message);
      else alert('تمت الإضافة بنجاح');
    }
    setEditing(null);
    setFormData({
      id: '',
      name: '',
      price_monthly: '',
      price_yearly: '',
      period: 'شهرياً',
      description: '',
      features: [],
      popular: false,
    });
    fetchPlans();
  };

  const handleEdit = (plan) => {
    setEditing(plan);
    setFormData({
      id: plan.id,
      name: plan.name,
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly || '',
      period: plan.period || 'شهرياً',
      description: plan.description || '',
      features: plan.features || [],
      popular: plan.popular || false,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الباقة؟')) {
      const { error } = await supabase.from('plans').delete().eq('id', id);
      if (error) alert('فشل الحذف: ' + error.message);
      else {
        alert('تم الحذف بنجاح');
        fetchPlans();
      }
    }
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setFormData({
      id: '',
      name: '',
      price_monthly: '',
      price_yearly: '',
      period: 'شهرياً',
      description: '',
      features: [],
      popular: false,
    });
  };

  if (loading && plans.length === 0) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">إدارة الباقات</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h3 className="text-lg font-semibold mb-4">{editing ? 'تعديل الباقة' : 'إضافة باقة جديدة'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="id" placeholder="المعرف (id) - إنجليزي" value={formData.id} onChange={handleInputChange} className="border rounded-lg p-2" required disabled={editing} />
          <input name="name" placeholder="اسم الباقة" value={formData.name} onChange={handleInputChange} className="border rounded-lg p-2" required />
          <input name="price_monthly" type="number" placeholder="السعر الشهري" value={formData.price_monthly} onChange={handleInputChange} className="border rounded-lg p-2" required />
          <input name="price_yearly" type="number" placeholder="السعر السنوي" value={formData.price_yearly} onChange={handleInputChange} className="border rounded-lg p-2" />
          <input name="period" placeholder="الفترة (مثال: شهرياً)" value={formData.period} onChange={handleInputChange} className="border rounded-lg p-2" />
          <textarea name="description" placeholder="وصف الباقة" value={formData.description} onChange={handleInputChange} className="border rounded-lg p-2 col-span-2" rows="2" />
          <label className="flex items-center gap-2"><input type="checkbox" name="popular" checked={formData.popular} onChange={handleInputChange} /> باقة مميزة (الأكثر شيوعاً)</label>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">الميزات</label>
          <div className="flex gap-2 mb-2">
            <input type="text" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} placeholder="أضف ميزة جديدة" className="flex-1 border rounded-lg p-2" />
            <button type="button" onClick={addFeature} className="bg-green-600 text-white px-4 py-2 rounded-lg">إضافة</button>
          </div>
          <div className="space-y-1">
            {formData.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                <span className="flex-1">{feat}</span>
                <button type="button" onClick={() => removeFeature(idx)} className="text-red-500 text-sm">✕ حذف</button>
              </div>
            ))}
          </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className={`bg-white p-5 rounded-xl shadow-sm border relative ${plan.popular ? 'border-purple-400 shadow-md' : ''}`}>
            {plan.popular && <div className="absolute -top-2 right-4 bg-purple-600 text-white text-xs px-2 py-1 rounded">مميزة</div>}
            <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
            <div className="mt-3">
              <span className="text-2xl font-bold">{plan.price_monthly}</span>
              <span className="text-gray-500"> ر.س / {plan.period}</span>
              {plan.price_yearly && <div className="text-sm text-gray-500">سنوياً: {plan.price_yearly} ر.س</div>}
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              {plan.features?.slice(0, 3).map((f, i) => <li key={i}>✓ {f}</li>)}
              {plan.features?.length > 3 && <li className="text-gray-400">+{plan.features.length - 3} ميزات أخرى</li>}
            </ul>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => handleEdit(plan)} className="text-blue-600 text-sm">تعديل</button>
              <button onClick={() => handleDelete(plan.id)} className="text-red-600 text-sm">حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}