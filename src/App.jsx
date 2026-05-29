import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PublicHeader from './components/PublicHeader';
import Dashboard from './pages/Dashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerCatalog from './pages/CustomerCatalog';
import Products from './pages/Products';
import ImportList from './pages/ImportList';
import Orders from './pages/Orders';
import LandingPage from './pages/LandingPage';
import PublicCatalog from './pages/PublicCatalog';
import Login from './pages/Login';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import HowItWorks from './pages/HowItWorks';
import PricingPage from './pages/PricingPage';
import ServicesPage from './pages/ServicesPage';
import SupportPage from './pages/SupportPage';
import ShippingPage from './pages/ShippingPage';
import IntegrationsPage from './pages/IntegrationsPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminCategories from './pages/AdminCategories';
import AdminTestimonials from './pages/AdminTestimonials';
import AdminStats from './pages/AdminStats';
import AdminPlans from './pages/AdminPlans';
import AdminFaq from './pages/AdminFaq';
import AdminContent from './pages/AdminContent';
import AdminBanners from './pages/AdminBanners';
import Settings from './pages/Settings';
import Shipments from './pages/Shipments';
import MyProducts from './pages/MyProducts';
import SubscriptionManagement from './pages/SubscriptionManagement';
import Wallet from './pages/Wallet';
import SupportTickets from './pages/SupportTickets';
import Payment from './pages/Payment';
import Integrations from './pages/Integrations';
import { supabase } from './lib/supabaseClient';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageData, setPageData] = useState(null);
  const [importList, setImportList] = useState([]);
  const [catalogCategory, setCatalogCategory] = useState('الكل');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userSubscription, setUserSubscription] = useState(null);
  const [userName, setUserName] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchUserSubscription = async (userId) => {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
    if (data && data.length > 0) {
      setUserSubscription(data[0]);
    } else {
      setUserSubscription({ plan_id: 'free', plan_name: 'مجاني' });
    }
  };

  const refreshUserSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await fetchUserSubscription(user.id);
  };

  const loadImportList = async (userId) => {
    const { data } = await supabase.from('import_lists').select('product_id').eq('user_id', userId);
    if (data) {
      const productIds = data.map(item => item.product_id);
      if (productIds.length > 0) {
        const { data: products } = await supabase.from('products').select('*').in('id', productIds);
        setImportList(products || []);
      } else setImportList([]);
    }
  };

  const handleLogin = async (admin = false) => {
    setIsLoggedIn(true);
    setIsAdmin(admin);
    setCurrentPage('dashboard');
    setPageData(null);
    localStorage.setItem('currentPage', 'dashboard');
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      loadImportList(user.id);
      fetchUserSubscription(user.id);
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      setUserName(profile?.full_name || user.email);
    }
  };

  const requireSubscription = (actionName) => {
    if (!isLoggedIn) {
      showToast('الرجاء تسجيل الدخول أولاً', 'error');
      return false;
    }
    if (userSubscription?.plan_id === 'free') {
      showToast(`❌ هذه الميزة (${actionName}) تتطلب الاشتراك في إحدى الباقات المدفوعة.`, 'error');
      return false;
    }
    return true;
  };

  const addToImportList = async (product) => {
    if (!requireSubscription('إضافة منتج إلى قائمة الاستيراد')) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('import_lists').insert({ user_id: user.id, product_id: product.id });
    if (!error || error.code === '23505') {
      setImportList(prev => prev.find(item => item.id === product.id) ? prev : [...prev, product]);
      showToast('تمت إضافة المنتج إلى قائمة الاستيراد', 'success');
    } else showToast('حدث خطأ أثناء الإضافة', 'error');
  };

  const removeFromImportList = async (productId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('import_lists').delete().eq('user_id', user.id).eq('product_id', productId);
    setImportList(prev => prev.filter(item => item.id !== productId));
    showToast('تم حذف المنتج من القائمة', 'success');
  };

  const navigate = (page, data = null) => {
    if (page === 'login' && data?.returnTo) localStorage.setItem('returnTo', data.returnTo);
    const dashboardPages = ['dashboard', 'products', 'importList', 'orders', 'settings', 'shipments', 'my-products', 'dashboard-stats', 'subscription', 'wallet', 'support-tickets', 'payment', 'integrations', 'admin-dashboard', 'admin-products', 'admin-categories', 'admin-testimonials', 'admin-stats', 'admin-plans', 'admin-faq', 'admin-content', 'admin-banners'];
    if (dashboardPages.includes(page) && !isLoggedIn && page !== 'payment') {
      setCurrentPage('login');
      setPageData(null);
      localStorage.setItem('currentPage', 'login');
      return;
    }
    const paidPages = ['importList', 'orders', 'my-products', 'shipments', 'integrations'];
    if (paidPages.includes(page) && userSubscription?.plan_id === 'free') {
      showToast('هذه الصفحة متاحة فقط للمشتركين في الباقات المدفوعة.', 'error');
      return;
    }
    const adminPages = ['admin-dashboard', 'admin-products', 'admin-categories', 'admin-testimonials', 'admin-stats', 'admin-plans', 'admin-faq', 'admin-content', 'admin-banners'];
    if (adminPages.includes(page) && !isAdmin) {
      setCurrentPage('dashboard');
      setPageData(null);
      localStorage.setItem('currentPage', 'dashboard');
      return;
    }
    setCurrentPage(page);
    setPageData(data);
    localStorage.setItem('currentPage', page);
    if (page === 'catalog') setCatalogCategory(data || 'الكل');
  };

  // استعادة الصفحة المحفوظة عند تحميل التطبيق
  useEffect(() => {
    const savedPage = localStorage.getItem('currentPage');
    const validPages = ['home', 'catalog', 'pricing', 'services', 'support', 'shipping', 'integrations', 'how', 'about', 'contact', 'register', 'login', 'dashboard', 'products', 'importList', 'orders', 'settings', 'shipments', 'my-products', 'dashboard-stats', 'subscription', 'wallet', 'support-tickets', 'payment', 'integrations', 'admin-dashboard', 'admin-products', 'admin-categories', 'admin-testimonials', 'admin-stats', 'admin-plans', 'admin-faq', 'admin-content', 'admin-banners'];
    if (savedPage && validPages.includes(savedPage)) {
      setCurrentPage(savedPage);
    }
    // التحقق من الجلسة
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleLogin(false);
      }
    });
  }, []);

  const isDashboard = [
    'dashboard', 'products', 'importList', 'orders', 'settings', 'shipments', 'my-products',
    'dashboard-stats', 'subscription', 'wallet', 'support-tickets', 'payment', 'integrations',
    'admin-dashboard', 'admin-products', 'admin-categories', 'admin-testimonials',
    'admin-stats', 'admin-plans', 'admin-faq', 'admin-content', 'admin-banners'
  ].includes(currentPage);

  const renderPage = () => {
    if (currentPage === 'login') return <Login onLogin={handleLogin} onNavigate={navigate} />;
    if (isDashboard && !isLoggedIn) return <Login onLogin={handleLogin} onNavigate={navigate} />;
    if (isDashboard) {
      const paidPages = ['importList', 'orders', 'my-products', 'shipments', 'integrations'];
      if (paidPages.includes(currentPage) && userSubscription?.plan_id === 'free') {
        return (
          <div className="flex flex-col items-center justify-center h-96 text-center p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">هذه الميزة غير متاحة في النسخة المجانية</h2>
            <p className="text-gray-600 mb-6">يرجى الاشتراك في إحدى الباقات المدفوعة للاستفادة من جميع الميزات.</p>
            <button onClick={() => navigate('subscription')} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700">عرض الباقات والاشتراك</button>
          </div>
        );
      }
      switch (currentPage) {
        case 'dashboard': return <CustomerCatalog addToImportList={addToImportList} removeFromImportList={removeFromImportList} importList={importList} onNavigate={navigate} />;
        case 'products': return <CustomerCatalog addToImportList={addToImportList} removeFromImportList={removeFromImportList} importList={importList} onNavigate={navigate} />;
        case 'dashboard-stats': return <CustomerDashboard onNavigate={navigate} />;
        case 'importList': return <ImportList importList={importList} removeFromImportList={removeFromImportList} showToast={showToast} />;
        case 'orders': return <Orders />;
        case 'shipments': return <Shipments />;
        case 'my-products': return <MyProducts />;
        case 'settings': return <Settings />;
        case 'subscription': return <SubscriptionManagement onNavigate={navigate} isLoggedIn={isLoggedIn} />;
        case 'wallet': return <Wallet />;
        case 'support-tickets': return <SupportTickets />;
        case 'payment': return <Payment onNavigate={navigate} planId={pageData?.planId} planName={pageData?.planName} amount={pageData?.amount} billingCycle={pageData?.billingCycle} onPaymentSuccess={refreshUserSubscription} />;
        case 'integrations': return <Integrations onNavigate={navigate} />;
        case 'admin-dashboard': return <AdminDashboard onNavigate={navigate} />;
        case 'admin-products': return <AdminProducts />;
        case 'admin-categories': return <AdminCategories />;
        case 'admin-testimonials': return <AdminTestimonials />;
        case 'admin-stats': return <AdminStats />;
        case 'admin-plans': return <AdminPlans />;
        case 'admin-faq': return <AdminFaq />;
        case 'admin-content': return <AdminContent />;
        case 'admin-banners': return <AdminBanners />;
        default: return <CustomerCatalog addToImportList={addToImportList} removeFromImportList={removeFromImportList} importList={importList} onNavigate={navigate} />;
      }
    } else {
      switch (currentPage) {
        case 'home': return <LandingPage onNavigate={navigate} />;
        case 'catalog': return <PublicCatalog selectedCategory={catalogCategory} onNavigate={navigate} />;
        case 'pricing': return <PricingPage onNavigate={navigate} isLoggedIn={isLoggedIn} />;
        case 'services': return <ServicesPage onNavigate={navigate} />;
        case 'support': return <SupportPage onNavigate={navigate} />;
        case 'shipping': return <ShippingPage onNavigate={navigate} />;
        case 'integrations': return <IntegrationsPage onNavigate={navigate} />;
        case 'how': return <HowItWorks onNavigate={navigate} />;
        case 'about': return <AboutUs onNavigate={navigate} />;
        case 'contact': return <ContactUs onNavigate={navigate} />;
        case 'register': return <RegisterPage onNavigate={navigate} onLogin={handleLogin} />;
        default: return <LandingPage onNavigate={navigate} />;
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50" dir="rtl">
      {isDashboard && isLoggedIn && (
        <Sidebar currentPage={currentPage} onNavigate={navigate} importCount={importList.length} isAdmin={isAdmin} onLogout={() => { setIsLoggedIn(false); setPageData(null); localStorage.removeItem('currentPage'); }} userSubscription={userSubscription} userName={userName} />
      )}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {!isDashboard || !isLoggedIn ? <PublicHeader onNavigate={navigate} isLoggedIn={isLoggedIn} /> : <Header userSubscription={userSubscription} userName={userName} onLogout={() => { setIsLoggedIn(false); setPageData(null); localStorage.removeItem('currentPage'); }} onNavigate={navigate} />}
        <main className={isDashboard ? 'p-6 flex-1 overflow-auto' : ''}>{renderPage()}</main>
      </div>
      {toast.show && <div className={`fixed top-8 right-8 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-medium animate-slide-up ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>{toast.message}</div>}
    </div>
  );
}