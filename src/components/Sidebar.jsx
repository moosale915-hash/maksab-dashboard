import { useState } from 'react';
import { APP_NAME } from '../config';

const regularMenuItems = [
  { id: 'dashboard', label: 'المنتجات', icon: '📦' },
  { id: 'subscription', label: 'خطة الاشتراك', icon: '🌟' },
  { id: 'importList', label: 'قائمة الاستيراد', icon: '📥' },
  { id: 'orders', label: 'الطلبات', icon: '📋' },
  { id: 'shipments', label: 'الشحنات', icon: '🚚' },
  { id: 'my-products', label: 'منتجاتي', icon: '🎷' },
  { id: 'dashboard-stats', label: 'لوحة التحكم', icon: '📊' },
  { id: 'wallet', label: 'المحفظة', icon: '💳' },
  { id: 'support-tickets', label: 'الدعم الفني', icon: '🎆' },
  { id: 'integrations', label: 'التكاملات', icon: '🔗' },
  { id: 'settings', label: 'الإعدادات', icon: '⚙️' },
];

const adminMenuItems = [
  { id: 'admin-dashboard', label: 'لوحة الإدارة', icon: '🛡️' },
  { id: 'admin-products', label: 'إدارة المنتجات', icon: '⚙️' },
  { id: 'admin-categories', label: 'إدارة الأقسام', icon: '🗂️' },
  { id: 'admin-testimonials', label: 'إدارة الشهادات', icon: '💬' },
  { id: 'admin-stats', label: 'إدارة الإحصائيات', icon: '📊' },
  { id: 'admin-plans', label: 'إدارة الباقات', icon: '💎' },
  { id: 'admin-faq', label: 'إدارة الأسئلة', icon: '❓' },
  { id: 'admin-content', label: 'المحتوى العام', icon: '📝' },
  { id: 'admin-banners', label: 'إدارة البانرات', icon: '🖼️' },
];

export default function Sidebar({ currentPage, onNavigate, importCount, isAdmin, onLogout, userSubscription, userName }) {
  const [openSubMenus, setOpenSubMenus] = useState({});
  
  const toggleSubMenu = (id) => {
    setOpenSubMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className="w-72 bg-white border-l border-gray-200 min-h-screen p-4 flex flex-col shadow-sm" dir="rtl">
      {/* اللوجو */}
      <div className="flex justify-center mb-8 px-2">
        <img src="/images/logo.png" alt={APP_NAME} className="h-24 w-auto object-contain" />
      </div>

      <nav className="flex-1">
        <div className="mb-4 pb-4 border-b border-gray-200">
          <p className="text-xs text-gray-400 mb-3 px-4">القائمة الرئيسية</p>
        </div>
        <ul className="space-y-1">
          {regularMenuItems.map((item) => {
            const isActive = currentPage === item.id;
            // معالجة العناصر التي تحتوي على قوائم فرعية (الطلبات فقط كمثال، لكن يمكن إضافة المنتجات لاحقاً)
            if (item.id === 'orders') {
              const isOpen = openSubMenus[item.id] || false;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => toggleSubMenu(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-right ${
                      isActive ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="mt-2 mr-6 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                      <button
                        onClick={() => onNavigate(item.id)}
                        className="w-full text-right px-4 py-2.5 text-sm text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors border-b border-gray-100 last:border-0"
                      >
                        كل الطلبات
                      </button>
                      <button
                        onClick={() => onNavigate(item.id)}
                        className="w-full text-right px-4 py-2.5 text-sm text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                      >
                        الطلبات الجديدة
                      </button>
                    </div>
                  )}
                </li>
              );
            }
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-right ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 font-semibold shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                  {isActive && <span className="mr-auto w-1.5 h-6 bg-purple-600 rounded-full"></span>}
                </button>
              </li>
            );
          })}
        </ul>

        {isAdmin && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400 mb-3 px-4">الإدارة</p>
            <ul className="space-y-1">
              {adminMenuItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-right ${
                        isActive
                          ? 'bg-purple-50 text-purple-700 font-semibold shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>
    </aside>
  );
}