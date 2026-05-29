import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShipments() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'شحن')
          .order('created_at', { ascending: false });
        setShipments(data || []);
      }
      setLoading(false);
    }
    fetchShipments();
  }, []);

  const getProgress = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const daysPassed = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    return Math.min(85, 20 + daysPassed * 15);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500">
        <div className="animate-spin text-4xl mb-4">⟳</div>
        جاري تحميل الشحنات...
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">الشحنات النشطة</h1>
      
      {shipments.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <span className="text-5xl block mb-4">📦</span>
          لا توجد شحنات نشطة حالياً.
        </div>
      ) : (
        <div className="space-y-6">
          {shipments.map(shipment => {
            const progress = getProgress(shipment.created_at);
            return (
              <div key={shipment.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <div>
                    <span className="font-bold text-purple-700">طلب #{shipment.id}</span>
                    <span className="text-gray-500 text-sm mr-4">
                      {new Date(shipment.created_at).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                    🚚 قيد الشحن
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>تم التجهيز</span>
                  <span>جاري التوصيل</span>
                  <span>تم التسليم</span>
                </div>
                
                {shipment.tracking_url && (
                  <div className="mt-4 text-center">
                    <a
                      href={shipment.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-purple-600 bg-purple-50 px-4 py-2 rounded-xl font-medium hover:bg-purple-100 transition-colors"
                    >
                      📦 تتبع الشحنة
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}