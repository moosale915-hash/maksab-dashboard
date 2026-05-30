import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Header({ userSubscription, userName, onLogout, onNavigate, onMenuClick }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    async function fetchNotifications() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'قيد التجهيز');
        setNotificationCount(count || 0);
      }
    }
    fetchNotifications();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPlanLabel = () => {
    if (!userSubscription) return 'جاري التحميل...';
    if (userSubscription.plan_id === 'free') return 'مجاني / تجريبي';
    return userSubscription.plan_name;
  };

  const getInitials = () => {
    if (!userName) return 'أ';
    return userName.charAt(0);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-3 md:px-6 py-2 md:py-3 flex justify-between items-center">
      <div className="flex items-center gap-2 md:gap-3">
        {/* زر القائمة (يظهر فقط في الموبايل) */}
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 -mr-2">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-base md:text-lg font-bold text-gray-700 truncate max-w-[150px] md:max-w-none">
          مرحباً {userName || 'عميلنا'}
        </h2>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative">
          <span className="text-xl cursor-pointer">🔔</span>
          {notificationCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
              {notificationCount}
            </span>
          )}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold hover:bg-purple-600 transition-colors text-sm md:text-base"
          >
            {getInitials()}
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-bold text-gray-800 truncate">{userName || 'عميل'}</p>
                <p className="text-sm text-purple-600 mt-1">{getPlanLabel()}</p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  if (onNavigate) onNavigate('subscription');
                }}
                className="w-full text-right px-4 py-3 text-purple-700 hover:bg-purple-50 transition-colors flex items-center gap-2"
              >
                <span className="text-xl">🌟</span>
                <span>اشتراكي</span>
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout();
                }}
                className="w-full text-right px-4 py-3 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <span className="text-xl">🚪</span>
                <span>تسجيل خروج</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}