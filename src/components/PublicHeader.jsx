import { useState, useRef, useEffect } from 'react';
import { APP_NAME } from '../config';

export default function PublicHeader({ onNavigate, isLoggedIn }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  const handleNavigate = (page) => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    onNavigate(page);
  };

  return (
    <>
      {/* شريط ترويجي علوي - مع تحسين للموبايل */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-2 px-2 md:px-4 text-center text-xs md:text-sm font-medium">
        <button onClick={() => onNavigate('login')} className="inline-flex items-center gap-1 md:gap-2 flex-wrap justify-center hover:underline">
          <span>😎</span>
          لفترة محدودة للمشتركين الجدد – استخدم كود
          <span className="bg-green-400 text-purple-900 px-1.5 md:px-2 py-0.5 rounded font-bold mx-0.5 md:mx-1">منتجك30</span>
          واحصل على خصم 30%
          <span>⏰</span>
        </button>
      </div>

      {/* الهيدر الأساسي */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50 py-2 md:py-0">
        <div className="max-w-7xl mx-auto px-3 md:px-6 flex justify-between items-center min-h-16 md:min-h-20">
          {/* اللوجو - تكبير الحجم */}
          <div className="cursor-pointer flex items-center" onClick={() => onNavigate('home')}>
            <img src="/images/logo.png" alt={APP_NAME} className="h-14 md:h-32 w-auto object-contain" />
          </div>

          {/* زر القائمة للهاتف (هامبورغر) */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* القائمة للشاشات الكبيرة */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
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

        {/* القائمة الجانبية المنزلقة للموبايل - بدون تمرير داخلي (height auto) */}
        <div
          className={`fixed top-0 right-0 z-50 lg:hidden transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} w-72 bg-white shadow-xl h-auto max-h-screen`}
          style={{ overflowY: 'auto' }}
        >
          <div className="p-4 flex justify-between items-center border-b">
            <img src="/images/logo.png" alt={APP_NAME} className="h-10 w-auto" />
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col p-4 space-y-2 text-right">
            <button onClick={() => handleNavigate('catalog')} className="py-2 text-gray-700 hover:text-purple-600 text-base">تصفح المنتجات</button>
            <button onClick={() => handleNavigate('pricing')} className="py-2 text-gray-700 hover:text-purple-600 text-base">الباقات</button>
            <button onClick={() => handleNavigate('services')} className="py-2 text-gray-700 hover:text-purple-600 text-base">خدماتنا</button>
            <button onClick={() => handleNavigate('support')} className="py-2 text-gray-700 hover:text-purple-600 text-base">الدعم الفني</button>
            <button onClick={() => handleNavigate('how')} className="py-2 text-gray-700 hover:text-purple-600 text-base">كيف نعمل</button>
            <button onClick={() => handleNavigate('about')} className="py-2 text-gray-700 hover:text-purple-600 text-base">من نحن</button>
            <button onClick={() => handleNavigate('contact')} className="py-2 text-gray-700 hover:text-purple-600 text-base">اتصل بنا</button>
            <div className="pt-4 border-t">
              {isLoggedIn ? (
                <button onClick={() => handleNavigate('dashboard')} className="w-full bg-purple-600 text-white py-2 rounded-xl text-base">لوحة التحكم</button>
              ) : (
                <div className="space-y-2">
                  <button onClick={() => handleNavigate('register')} className="w-full bg-purple-600 text-white py-2 rounded-xl text-base">تسجيل جديد</button>
                  <button onClick={() => handleNavigate('login')} className="w-full border border-purple-200 text-purple-700 py-2 rounded-xl text-base">تسجيل الدخول</button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}