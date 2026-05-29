import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    original_price: '',
    discount: '',
    category_id: '',
    source: '',
    image_url: '',
    rating: 4.5,
    reviews: 0,
    is_visible: true,
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name');
    setCategories(data || []);
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
    if (editingProduct) {
      // تحديث
      const { error } = await supabase
        .from('products')
        .update(formData)
        .eq('id', editingProduct.id);
      if (error) alert('فشل التحديث: ' + error.message);
      else alert('تم التحديث بنجاح');
    } else {
      // إضافة جديدة
      const { error } = await supabase.from('products').insert([formData]);
      if (error) alert('فشل الإضافة: ' + error.message);
      else alert('تمت الإضافة بنجاح');
    }
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      original_price: '',
      discount: '',
      category_id: '',
      source: '',
      image_url: '',
      rating: 4.5,
      reviews: 0,
      is_visible: true,
    });
    fetchProducts();
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      price: product.price || '',
      original_price: product.original_price || '',
      discount: product.discount || '',
      category_id: product.category_id || '',
      source: product.source || '',
      image_url: product.image_url || '',
      rating: product.rating || 4.5,
      reviews: product.reviews || 0,
      is_visible: product.is_visible !== false,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) alert('فشل الحذف: ' + error.message);
      else {
        alert('تم الحذف بنجاح');
        fetchProducts();
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      original_price: '',
      discount: '',
      category_id: '',
      source: '',
      image_url: '',
      rating: 4.5,
      reviews: 0,
      is_visible: true,
    });
  };

  if (loading && products.length === 0) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">إدارة المنتجات</h2>
      
      {/* نموذج الإضافة/التعديل */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h3 className="text-lg font-semibold mb-4">{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input name="name" placeholder="اسم المنتج" value={formData.name} onChange={handleInputChange} className="border rounded-lg p-2" required />
          <input name="price" type="number" placeholder="السعر" value={formData.price} onChange={handleInputChange} className="border rounded-lg p-2" required />
          <input name="original_price" type="number" placeholder="السعر الأصلي" value={formData.original_price} onChange={handleInputChange} className="border rounded-lg p-2" />
          <input name="discount" type="number" placeholder="الخصم %" value={formData.discount} onChange={handleInputChange} className="border rounded-lg p-2" />
          <select name="category_id" value={formData.category_id} onChange={handleInputChange} className="border rounded-lg p-2">
            <option value="">اختر القسم</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <input name="source" placeholder="المصدر" value={formData.source} onChange={handleInputChange} className="border rounded-lg p-2" />
          <input name="image_url" placeholder="رابط الصورة" value={formData.image_url} onChange={handleInputChange} className="border rounded-lg p-2" />
          <input name="rating" type="number" step="0.1" placeholder="التقييم" value={formData.rating} onChange={handleInputChange} className="border rounded-lg p-2" />
          <input name="reviews" type="number" placeholder="عدد المراجعات" value={formData.reviews} onChange={handleInputChange} className="border rounded-lg p-2" />
          <label className="flex items-center gap-2"><input type="checkbox" name="is_visible" checked={formData.is_visible} onChange={handleInputChange} /> مرئي للجميع</label>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">{editingProduct ? 'تحديث' : 'إضافة'}</button>
          {editingProduct && <button type="button" onClick={handleCancelEdit} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400">إلغاء</button>}
        </div>
      </form>

      {/* جدول المنتجات */}
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-gray-50">
            <tr><th className="p-3">الصورة</th><th className="p-3">الاسم</th><th className="p-3">السعر</th><th className="p-3">القسم</th><th className="p-3">مرئي</th><th className="p-3">إجراءات</th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-3"><img src={p.image_url || 'https://via.placeholder.com/40'} alt={p.name} className="w-10 h-10 object-cover rounded" /></td>
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.price} ر.س</td>
                <td className="p-3">{p.category_id}</td>
                <td className="p-3">{p.is_visible ? '✅' : '❌'}</td>
                <td className="p-3"><button onClick={() => handleEdit(p)} className="text-blue-600 hover:underline ml-2">تعديل</button><button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">حذف</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}