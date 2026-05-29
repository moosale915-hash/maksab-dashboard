import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function CustomerDashboard({ onNavigate }) {
  const [greeting, setGreeting] = useState('');
  const [stats, setStats] = useState({
    totalSales: 0,
    profitRate: '40% - 70%',
    totalOrders: 0,
    productsSold: 0,
    newStores: 11,
  });
  const [loading, setLoading] = useState(true);
  const [bestSelling, setBestSelling] = useState([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('صباح الخير');
    else if (hour < 18) setGreeting('مساء الخير');
    else setGreeting('مساء الخير');

    async function fetchData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // جلب الطلبات
      const { data: orders } = await supabase
        .from('orders')
        .select('total, items')
        .eq('user_id', user.id);

      let totalSales = 0;
      let productsSoldCount = 0;
      orders?.forEach(order => {
        totalSales += order.total || 0;
        try {
          const items = JSON.parse(order.items);
          productsSoldCount += items.length;
        } catch(e) {}
      });

      setStats({
        totalSales,
        profitRate: '40% - 70%',
        totalOrders: orders?.length || 0,
        productsSold: productsSoldCount,
        newStores: 11,
      });

      // جلب أفضل المنتجات مبيعاً (بناءً على التقييم أو الخصم)
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('is_visible', true)
        .order('reviews', { ascending: false })
        .limit(8);

      setBestSelling(products || []);
      setLoading(false);
    }

    fetchData();
  }, []);

  const formatCurrency = (amount) => amount.toLocaleString() + ' ر.س';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 p-4 md:p-6 space-y-6">
      {/* الترحيب */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">مرحباً،</h1>
        <p className="text-gray-500 mt-1">إليك ملخص ما يحدث في متجرك اليوم.</p>
      </div>

      {/* بنر ترويجي */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-xl font-bold mb-1">عروض خاصة للمشتركين الجدد!</h2>
        <p className="text-sm opacity-90">استخدم كود "مكسب30" للحصول على خصم 30%</p>
      </div>

      {/* أرقام اليوم */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">أرقام اليوم</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-gray-500">مبيعاتك</p>
                <p className="text-2xl font-extrabold text-gray-800 mt-1">{formatCurrency(stats.totalSales)}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-xl">💰</div>
            </div>
            <p className="text-xs text-gray-400">قيمة المبيعات التي حققتها</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-gray-500">نسبة الربح</p>
                <p className="text-2xl font-extrabold text-gray-800 mt-1">{stats.profitRate}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">📈</div>
            </div>
            <p className="text-xs text-gray-400">متوسط نسبة الربح</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-gray-500">إجمالي الطلبات</p>
                <p className="text-2xl font-extrabold text-gray-800 mt-1">{stats.totalOrders}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">📦</div>
            </div>
            <p className="text-xs text-gray-400">عدد الطلبات المنفذة</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-gray-500">المنتجات المباعة</p>
                <p className="text-2xl font-extrabold text-gray-800 mt-1">{stats.productsSold}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl">🏷️</div>
            </div>
            <p className="text-xs text-gray-400">منتجات تم بيعها</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-gray-500">متاجر جديدة</p>
                <p className="text-2xl font-extrabold text-gray-800 mt-1">{stats.newStores}</p>
              </div>
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center text-xl">🛒</div>
            </div>
            <p className="text-xs text-gray-400">كل يوم ينضم تجار جدد</p>
          </div>
        </div>
      </div>

      {/* أفضل المنتجات مبيعاً */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">أفضل المنتجات مبيعاً</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {bestSelling.map(product => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="h-40 bg-gray-50 flex items-center justify-center p-2 overflow-hidden">
                <img
                  src={product.image_url || `https://via.placeholder.com/200?text=${encodeURIComponent(product.name)}`}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <p className="font-semibold text-gray-800 text-sm line-clamp-2 min-h-[2.5rem]">{product.name}</p>
                <p className="text-purple-600 font-bold mt-1">{product.price} ر.س</p>
              </div>
            </div>
          ))}
          {bestSelling.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-400">لا توجد منتجات بعد</div>
          )}
        </div>
      </div>

      {/* قسم ترقية الباقة */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-2xl p-6 text-center shadow-lg">
        <h2 className="text-xl font-bold mb-2">ابدأ البيع الآن</h2>
        <p className="text-sm opacity-90 mb-4">قم بترقية باقتك وابدأ في تحقيق أرباحك مع مكسب</p>
        <button
          onClick={() => onNavigate('pricing')}
          className="inline-flex items-center gap-2 bg-white text-purple-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
        >
          ترقية الاشتراك
        </button>
      </div>
    </div>
  );
}