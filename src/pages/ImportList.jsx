import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ImportList({ importList: externalImportList, removeFromImportList: externalRemove, showToast }) {
  const [importList, setImportList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // جلب قائمة الاستيراد من Supabase عند تحميل الصفحة
  useEffect(() => {
    async function fetchImportList() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // جلب العلاقات من import_lists
      const { data: importItems, error } = await supabase
        .from('import_lists')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('خطأ في جلب قائمة الاستيراد:', error);
        setLoading(false);
        return;
      }

      if (importItems.length === 0) {
        setImportList([]);
        setLoading(false);
        return;
      }

      const productIds = importItems.map(item => item.product_id);
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (productsError) {
        console.error('خطأ في جلب تفاصيل المنتجات:', productsError);
        setImportList([]);
      } else {
        setImportList(products || []);
      }
      setLoading(false);
    }

    fetchImportList();
  }, []);

  // إذا تم تمرير importList من الخارج (من App.jsx) نستخدمه كمصدر بديل
  // لكننا نفضل استخدام البيانات المباشرة من Supabase
  useEffect(() => {
    if (externalImportList && externalImportList.length > 0 && importList.length === 0) {
      setImportList(externalImportList);
    }
  }, [externalImportList]);

  const totalPrice = importList.reduce((sum, item) => sum + (item.price || 0), 0);

  const removeFromList = async (productId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showToast('يجب تسجيل الدخول أولاً', 'error');
      return;
    }

    const { error } = await supabase
      .from('import_lists')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) {
      showToast('فشل حذف المنتج', 'error');
    } else {
      setImportList(prev => prev.filter(p => p.id !== productId));
      showToast('تم حذف المنتج من القائمة', 'success');
      // إذا كانت الدالة الخارجية موجودة، نناديها لتحديث الحالة العامة
      if (externalRemove) externalRemove(productId);
    }
  };

  const clearAll = async () => {
    if (!window.confirm('هل أنت متأكد من حذف جميع المنتجات من القائمة؟')) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('import_lists')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      showToast('فشل حذف القائمة', 'error');
    } else {
      setImportList([]);
      showToast('تم حذف جميع المنتجات', 'success');
    }
  };

  const publishOrder = async () => {
    setPublishing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showToast('يجب تسجيل الدخول أولاً', 'error');
      setPublishing(false);
      return;
    }

    // إنشاء الطلب في جدول orders
    const orderItems = importList.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      category_id: item.category_id,
    }));

    const { error: orderError } = await supabase.from('orders').insert({
      user_id: user.id,
      total: totalPrice,
      items: JSON.stringify(orderItems),
      status: 'قيد التجهيز',
      created_at: new Date(),
    });

    if (orderError) {
      showToast('حدث خطأ أثناء النشر: ' + orderError.message, 'error');
      setPublishing(false);
      return;
    }

    // بعد نجاح الطلب، نحذف جميع المنتجات من قائمة الاستيراد
    const { error: deleteError } = await supabase
      .from('import_lists')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('خطأ في حذف قائمة الاستيراد بعد النشر:', deleteError);
    }

    setImportList([]);
    setShowModal(false);
    setPublishing(false);
    showToast('✅ تم النشر بنجاح! يمكنك متابعة طلبك في صفحة الطلبات.', 'success');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">قائمة الاستيراد</h1>
          <p className="text-sm text-gray-500 mt-1">
            {importList.length} منتج | الإجمالي: {totalPrice.toLocaleString()} ر.س
          </p>
        </div>

        <div className="flex gap-3">
          {importList.length > 0 && (
            <>
              <button
                onClick={clearAll}
                className="border border-red-200 text-red-600 px-5 py-2.5 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                🗑️ حذف الكل
              </button>
              <button
                onClick={() => setShowModal(true)}
                disabled={publishing}
                className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-purple-700 active:scale-95 transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                🚀 نشر للمتجر
              </button>
            </>
          )}
        </div>
      </div>

      {importList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
          <span className="text-5xl">📭</span>
          <p className="mt-4 text-lg">لا توجد منتجات في قائمة الاستيراد.</p>
          <p className="text-sm mt-1">اذهب إلى صفحة المنتجات لإضافة بعضها.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {importList.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="relative w-full h-56 bg-gray-50 overflow-hidden">
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
              <div className="p-4 flex flex-col flex-1">
                <span className="text-xs text-purple-600 font-medium bg-purple-50 self-start px-2 py-0.5 rounded-full mb-2">
                  {product.category_id}
                </span>
                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
                <div className="mt-auto">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-gray-900">{product.price} ر.س</span>
                    {product.original_price > product.price && (
                      <span className="text-xs text-gray-400 line-through">{product.original_price} ر.س</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{product.source}</span>
                </div>
                <button
                  onClick={() => removeFromList(product.id)}
                  className="mt-4 w-full py-2 px-4 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 active:scale-95 transition-all text-sm font-medium flex items-center justify-center gap-2"
                >
                  <span>🗑️</span> حذف من القائمة
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* مودال تأكيد النشر */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 text-center">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">تأكيد النشر</h3>
            <p className="text-gray-600 mb-6">
              سيتم نشر {importList.length} منتج إلى متجرك. هل تريد المتابعة؟
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowModal(false)}
                disabled={publishing}
                className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={publishOrder}
                disabled={publishing}
                className="px-5 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {publishing ? (
                  <>
                    <span className="animate-spin">⟳</span>
                    جاري النشر...
                  </>
                ) : (
                  'نعم، انشر الآن'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}