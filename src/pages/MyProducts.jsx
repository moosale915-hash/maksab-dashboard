import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyProducts() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // جلب جميع الطلبات الخاصة بالمستخدم
      const { data: orders, error } = await supabase
        .from('orders')
        .select('items')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('خطأ في جلب الطلبات:', error);
        setLoading(false);
        return;
      }

      // استخراج المنتجات الفريدة من جميع الطلبات
      const allProducts = [];
      orders?.forEach(order => {
        try {
          const items = JSON.parse(order.items);
          items.forEach(item => {
            // تجنب التكرار بناءً على id المنتج
            if (!allProducts.find(p => p.id === item.id)) {
              allProducts.push(item);
            }
          });
        } catch (e) {}
      });
      setProducts(allProducts);
      setLoading(false);
    }
    fetchMyProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">منتجاتي</h1>
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
          <span className="text-5xl block mb-4">📦</span>
          <p className="text-lg">لم تقم بنشر أي منتج بعد.</p>
          <p className="text-sm mt-1">يمكنك إضافة منتجات من صفحة المنتجات ونشرها عبر قائمة الاستيراد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="relative w-full h-52 bg-gray-50 overflow-hidden">
                <img
                  src={product.image_url || `https://via.placeholder.com/300?text=${encodeURIComponent(product.name)}`}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {product.discount > 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                    -{product.discount}%
                  </span>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <span className="text-xs text-purple-600 font-medium bg-purple-50 self-start px-2 py-0.5 rounded-full mb-2">
                  {product.category_id}
                </span>
                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
                <div className="mt-auto">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-purple-700">{product.price} ر.س</span>
                    {product.original_price > product.price && (
                      <span className="text-xs text-gray-400 line-through">{product.original_price} ر.س</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{product.source || 'مورد'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}