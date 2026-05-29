import { useState, useRef, useEffect } from 'react';
import { APP_NAME } from '../config';

export default function PublicHeader({ onNavigate, isLoggedIn }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (page) => {
    setDropdownOpen(false);
    onNavigate(page);
  };

  return (
    <>
      {/* شريط ترويجي علوي */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-2.5 px-4 text-center text-sm font-medium">
        <button onClick={() => onNavigate('login')} className="inline-flex items-center gap-2 flex-wrap justify-center hover:underline">
          <span>😎</span>
          لفترة محدودة للمشتركين الجدد – استخدم كود
          <span className="bg-green-400 text-purple-900 px-2 py-0.5 rounded font-bold mx-1">منتجك30</span>
          واحصل على خصم 30%
          <span>⏰</span>
        </button>
      </div>

      {/* الهيدر الأساسي – ارتفاع ثابت مع توسيط عمودي */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50 h-20 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
          {/* اللوجو */}
          <div className="cursor-pointer flex items-center" onClick={() => onNavigate('home')}>
            <img src="/images/logo.png" alt={APP_NAME} className="h-28 w-auto object-contain" />
          </div>

          {/* قائمة الروابط */}
          <nav className="flex items-center gap-6 text-sm font-medium">
            {/* قائمة "الحلول" المنسدلة */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors"
              >
                الحلول
                <svg className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute top-full right-0 mt-3 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  <button onClick={() => handleNavigate('integrations')} className="w-full text-right px-5 py-3 hover:bg-purple-50 transition-colors group">
                    <span className="block font-bold text-gray-800 group-hover:text-purple-700">الربط مع المنصات</span>
                    <span className="block text-xs text-gray-500 mt-0.5">اربط منتجاتك مع منصات التجارة الإلكترونية وابدأ بالبيع</span>
                  </button>
                  <button onClick={() => handleNavigate('shipping')} className="w-full text-right px-5 py-3 hover:bg-purple-50 transition-colors group">
                    <span className="block font-bold text-gray-800 group-hover:text-purple-700">الشحن والتغليف</span>
                    <span className="block text-xs text-gray-500 mt-0.5">نوفر لك الخيارات التي تناسبك</span>
                  </button>
                  <button onClick={() => handleNavigate('how')} className="w-full text-right px-5 py-3 hover:bg-purple-50 transition-colors group">
                    <span className="block font-bold text-gray-800 group-hover:text-purple-700">كيف نعمل</span>
                    <span className="block text-xs text-gray-500 mt-0.5">أربع خطوات بسيطة لتبدأ تجارتك الإلكترونية</span>
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => onNavigate('catalog')} className="text-gray-600 hover:text-purple-600 transition-colors">تصفح المنتجات</button>
            <button onClick={() => onNavigate('pricing')} className="text-gray-600 hover:text-purple-600 transition-colors">الباقات</button>
            <button onClick={() => onNavigate('services')} className="text-gray-600 hover:text-purple-600 transition-colors">خدماتنا</button>
            <button onClick={() => onNavigate('support')} className="text-gray-600 hover:text-purple-600 transition-colors">الدعم الفني</button>

            {/* زر لوحة التحكم إذا كان المستخدم مسجلاً */}
            {isLoggedIn ? (
              <button onClick={() => onNavigate('dashboard')} className="bg-purple-600 text-white px-5 py-2 rounded-xl hover:bg-purple-700 transition-colors shadow-md shadow-purple-200">
                لوحة التحكم
              </button>
            ) : (
              <>
                <button onClick={() => onNavigate('register')} className="bg-purple-600 text-white px-5 py-2 rounded-xl hover:bg-purple-700 transition-colors shadow-md shadow-purple-200">
                  تسجيل جديد
                </button>
                <button onClick={() => onNavigate('login')} className="border border-purple-200 text-purple-700 px-5 py-2 rounded-xl hover:bg-purple-50 transition-colors">
                  تسجيل الدخول
                </button>
              </>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}