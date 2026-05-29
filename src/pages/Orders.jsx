import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const statusOptions = ['الكل', 'قيد التجهيز', 'شحن', 'مكتمل', 'ملغي'];
const paymentOptions = ['الكل', 'الدفع عند الاستلام', 'مدفوع'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [paymentFilter, setPaymentFilter] = useState('الكل');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (!error) setOrders(data || []);
        else console.error('خطأ في جلب الطلبات:', error);
      }
      setLoading(false);
    }
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    let items = [];
    try { items = JSON.parse(order.items) || []; } catch(e) {}
    const matchSearch = searchTerm === '' || 
      String(order.id).includes(searchTerm) ||
      items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = statusFilter === 'الكل' || order.status === statusFilter;
    const matchPayment = paymentFilter === 'الكل' || true;
    return matchSearch && matchStatus && matchPayment;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'قيد التجهيز': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'شحن': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'مكتمل': return 'bg-green-50 text-green-700 border-green-200';
      case 'ملغي': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">الطلبات</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors shadow-sm">
            طلب جديد
          </button>
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            تصدير
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
          <div className="relative flex-1 w-full lg:w-auto">
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" /></svg>
            <input type="text" placeholder="ابحث عن طلب (رقم أو منتج)..." className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap w-full lg:w-auto">
            {statusOptions.map(opt => (
              <button key={opt} onClick={() => setStatusFilter(opt)} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${statusFilter === opt ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                {opt}
              </button>
            ))}
          </div>
          <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-600">
            {paymentOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-gray-500">لا توجد طلبات مطابقة للبحث.</div>
        ) : (
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-600 text-sm border-b">
              <tr><th className="py-4 px-4 font-medium">رقم الطلب</th><th className="py-4 px-4 font-medium">التاريخ</th><th className="py-4 px-4 font-medium">العميل</th><th className="py-4 px-4 font-medium">الحالة</th><th className="py-4 px-4 font-medium">الإجمالي</th><th className="py-4 px-4 font-medium">طريقة الدفع</th><th className="py-4 px-4 font-medium">الإجراءات</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => {
                const isExpanded = expandedOrder === order.id;
                let items = [];
                try { items = JSON.parse(order.items); } catch(e) {}
                return (
                  <React.Fragment key={order.id}>
                    <tr className="text-sm hover:bg-gray-50 transition-colors group">
                      <td className="py-4 px-4 font-medium text-purple-700">#{order.id}</td>
                      <td className="py-4 px-4 text-gray-500">{new Date(order.created_at).toLocaleDateString('ar-SA')}</td>
                      <td className="py-4 px-4">أحمد محمد</td>
                      <td className="py-4 px-4"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(order.status)}`}>{order.status}</span></td>
                      <td className="py-4 px-4 font-semibold">{order.total} ر.س</td>
                      <td className="py-4 px-4 text-gray-500">الدفع عند الاستلام</td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button onClick={() => setExpandedOrder(isExpanded ? null : order.id)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-purple-100 hover:text-purple-700 transition-colors" title="تفاصيل">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          {order.tracking_url && <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-gray-100 hover:bg-blue-100 hover:text-blue-700 transition-colors" title="تتبع الشحنة"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></a>}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-50">
                        <td colSpan="7" className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><h4 className="font-bold text-gray-700 mb-2">المنتجات</h4><div className="space-y-2 max-h-64 overflow-y-auto">{items.map((item, idx) => (<div key={idx} className="flex items-center justify-between bg-white p-2 rounded-lg"><div className="flex items-center gap-2"><img src={item.image_url || 'https://via.placeholder.com/40'} alt={item.name} className="w-10 h-10 rounded object-cover" /><span className="text-sm">{item.name}</span></div><span className="text-sm font-bold">{item.price} ر.س</span></div>))}</div></div>
                            <div><h4 className="font-bold text-gray-700 mb-2">معلومات الشحن</h4><p className="text-sm text-gray-500">العنوان: الرياض، المملكة العربية السعودية</p><p className="text-sm text-gray-500 mt-1">رقم التتبع: {order.tracking_url ? 'متوفر' : 'غير متوفر'}</p></div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination - الأزرار معكوسة لتناسب RTL */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <button className="px-3 py-1 rounded-lg bg-white border text-sm hover:bg-gray-50">التالي</button>
        <button className="px-3 py-1 rounded-lg bg-purple-600 text-white text-sm">1</button>
        <button className="px-3 py-1 rounded-lg bg-white border text-sm hover:bg-gray-50">2</button>
        <button className="px-3 py-1 rounded-lg bg-white border text-sm hover:bg-gray-50">3</button>
        <button className="px-3 py-1 rounded-lg bg-white border text-sm hover:bg-gray-50">السابق</button>
      </div>
    </div>
  );
}