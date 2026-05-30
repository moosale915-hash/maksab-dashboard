import { useState, useEffect, useRef } from 'react';
import { APP_NAME } from '../config';
import BrandsMarquee from '../components/BrandsMarquee';
import PublicFooter from '../components/PublicFooter';
import { supabase } from '../lib/supabaseClient';

// --- أيقونات الأقسام (ثابتة) ---
function CategoryIcon({ id, className }) {
  const icons = {
    إلكترونيات: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>,
    أزياء: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l3 6h6l-4.5 3.5L18 18l-6-3.5L6 18l1.5-6.5L3 8h6z" /></svg>,
    منزل: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9,22 9,12 15,12 15,22" /></svg>,
    تجميل: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="6" r="3" /><path d="M12 9v2m0 2v2m0 2v2" /><rect x="9" y="2" width="6" height="4" rx="1" /></svg>,
    أطفال: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>,
    رياضة: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>,
    مكتب: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
    سيارات: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 17m-2 0a2 2 0 104 0 2 2 0 10-4 0z" /><path d="M17 17m-2 0a2 2 0 104 0 2 2 0 10-4 0z" /><path d="M5 9l2-4h10l2 4M5 9h14v7a1 1 0 01-1 1H6a1 1 0 01-1-1V9z" /></svg>,
  };
  return <span className={`w-10 h-10 inline-block ${className || ''}`}>{icons[id] || icons.إلكترونيات}</span>;
}

// --- عداد متحرك ---
function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            setCount(target);
            clearInterval(timer);
          } else setCount(Math.floor(current));
        }, duration / steps);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>+{count.toLocaleString()}{suffix}</span>;
}

// --- إطار الجهاز (لشهادات العملاء) ---
function DeviceFrame({ device, children }) {
  const frames = {
    mobile: (
      <div className="relative mx-auto w-32 md:w-36 h-56 md:h-64">
        <div className="w-full h-full bg-[#9C948C] rounded-[2.5rem] shadow-lg p-1.5 relative">
          <div className="absolute left-0 top-24 w-0.5 h-7 bg-[#7A7268] rounded-l-sm"></div>
          <div className="absolute left-0 top-34 w-0.5 h-7 bg-[#7A7268] rounded-l-sm"></div>
          <div className="absolute left-0 top-16 w-0.5 h-4 bg-[#7A7268] rounded-l-sm"></div>
          <div className="absolute right-0 top-28 w-0.5 h-9 bg-[#7A7268] rounded-r-sm"></div>
          <div className="w-full h-full bg-black rounded-[2.2rem] overflow-hidden flex items-center justify-center">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-5 bg-black rounded-full z-10"></div>
            {children}
          </div>
        </div>
      </div>
    ),
    tablet: (
      <div className="relative mx-auto w-56 md:w-64 h-56 md:h-64">
        <div className="w-full h-full bg-[#C0C4C8] rounded-[2rem] shadow-lg p-2 relative">
          <div className="absolute top-0 right-12 w-8 h-1 bg-[#A0A4A8] rounded-b-sm"></div>
          <div className="absolute right-0 top-20 w-0.5 h-7 bg-[#A0A4A8] rounded-r-sm"></div>
          <div className="absolute right-0 top-30 w-0.5 h-7 bg-[#A0A4A8] rounded-r-sm"></div>
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#2C2C2E] rounded-full z-10"></div>
          <div className="w-full h-full bg-white rounded-[1.5rem] overflow-hidden flex items-center justify-center">{children}</div>
        </div>
      </div>
    ),
    laptop: (
      <div className="relative mx-auto w-64 md:w-72 flex flex-col items-center">
        <div className="w-full h-40 md:h-44 bg-[#5A5B5F] rounded-t-xl shadow-lg p-1 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#3A3A3C] rounded-b-sm z-10"></div>
          <div className="w-full h-full bg-black rounded-t-lg overflow-hidden flex items-center justify-center">{children}</div>
        </div>
        <div className="w-72 md:w-80 h-2.5 bg-[#C0C4C8] rounded-b-lg shadow-md relative">
          <div className="absolute inset-x-0 bottom-0.5 mx-auto w-16 h-0.5 bg-[#A0A4A8] rounded-full"></div>
        </div>
      </div>
    ),
  };
  return frames[device] || frames.mobile;
}

// ---------- الصفحة الرئيسية ----------
export default function LandingPage({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [plans, setPlans] = useState([]);
  const [faq, setFaq] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [siteContent, setSiteContent] = useState({});
  const [categories, setCategories] = useState([]);
  const [productsByCat, setProductsByCat] = useState({});
  const [activeCategory, setActiveCategory] = useState('إلكترونيات');

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const { data: statsData } = await supabase.from('stats').select('*');
        setStats(statsData || []);

        const { data: plansData } = await supabase.from('plans').select('*').neq('id', 'free');
        setPlans(plansData || []);

        const { data: faqData } = await supabase.from('faq').select('*');
        setFaq(faqData || []);

        const { data: testimonialsData } = await supabase.from('testimonials').select('*');
        setTestimonials(testimonialsData || []);

        const { data: siteData } = await supabase.from('site_content').select('*');
        if (siteData) {
          const map = {};
          siteData.forEach(item => { map[item.key] = item.value; });
          setSiteContent(map);
        }

        const { data: catsData } = await supabase.from('categories').select('*').order('count', { ascending: false });
        if (catsData && catsData.length) {
          setCategories(catsData);
        } else {
          setCategories([
            { id: 'إلكترونيات', name: 'إلكترونيات', count: 32000 },
            { id: 'أزياء', name: 'أزياء', count: 11250 },
            { id: 'منزل', name: 'منزل ومطبخ', count: 14500 },
            { id: 'تجميل', name: 'تجميل وعناية', count: 11400 },
            { id: 'أطفال', name: 'أطفال ومواليد', count: 10055 },
            { id: 'رياضة', name: 'رياضة ولياقة', count: 11110 },
            { id: 'مكتب', name: 'مكتب وقرطاسية', count: 11750 },
            { id: 'سيارات', name: 'إكسسوارات سيارات', count: 15660 },
          ]);
        }

        const { data: productsData } = await supabase.from('products').select('*').eq('is_visible', true);
        if (productsData && productsData.length) {
          const grouped = {};
          productsData.forEach(p => {
            const cat = p.category_id;
            if (!grouped[cat]) grouped[cat] = [];
            if (grouped[cat].length < 3) grouped[cat].push(p);
          });
          setProductsByCat(grouped);
        } else {
          setProductsByCat({});
        }
      } catch (err) {
        console.error('خطأ في جلب البيانات:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const activeCat = categories.find(c => c.id === activeCategory);
  const currentProducts = productsByCat[activeCategory] || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - تحسين للموبايل */}
      <section className="relative bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 md:py-32 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium mb-6 md:mb-8">
            أول منصة سعودية تقدم خدمات الدروبشيبينق
          </div>
          <h1 className="text-3xl md:text-7xl font-extrabold text-gray-900 mb-4 md:mb-6 leading-tight">
            {siteContent.heroTitle || 'المنصة الموثوقة لتوفير منتجات متجرك'}
          </h1>
          <p className="text-base md:text-xl text-gray-600 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
            {siteContent.heroSubtitle || 'نوفر لك آلاف المنتجات الجاهزة لمتجرك الإلكتروني مع خدمات شحن وتوصيل وربط تقني سلس'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
            <button onClick={() => onNavigate('catalog')} className="bg-purple-600 text-white px-6 md:px-10 py-3 md:py-4 rounded-2xl font-bold text-base md:text-lg hover:bg-purple-700 shadow-xl shadow-purple-200 transition-all transform hover:-translate-y-1">
              تصفح المنتجات
            </button>
            <button onClick={() => onNavigate('dashboard')} className="bg-white text-purple-600 border-2 border-purple-200 px-6 md:px-10 py-3 md:py-4 rounded-2xl font-bold text-base md:text-lg hover:bg-purple-50 shadow-lg transition-all transform hover:-translate-y-1">
              {siteContent.ctaTitle || 'ابدأ الآن مجاناً'}
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section - تحسين الشبكة للموبايل */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {stats.length === 0 ? (
            <div className="text-center text-purple-200">جاري تحميل الإحصائيات...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 text-center">
              {stats.map((stat, i) => (
                <div key={i} className="p-2 md:p-4 flex flex-col items-center">
                  <div className="mb-2 md:mb-4">
                    {stat.is_image ? (
                      <img src={stat.icon} alt={stat.label} className="w-10 h-10 md:w-12 md:h-12 object-contain" />
                    ) : (
                      <span className="text-2xl md:text-3xl">{stat.icon}</span>
                    )}
                  </div>
                  <div className="text-xl md:text-3xl font-extrabold mb-1">
                    <AnimatedCounter target={stat.value} suffix={stat.label?.startsWith('%') ? '%' : ''} />
                  </div>
                  <div className="text-purple-200 text-xs md:text-base">{stat.label?.replace('% ', '')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works (static) - تحسين للأجهزة الصغيرة */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-8 md:mb-16">ابدأ تجارتك بثلاث خطوات بسيطة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { step: '1', title: 'اختر الباقة المناسبة', desc: 'مجموعة باقات متنوعة، اختر منها اللي يناسب احتياجاتك.' },
              { step: '2', title: 'اربط متجرك الإلكتروني', desc: 'ربط تقني سريع ومباشر يسهل عليك إدارة المنتجات.' },
              { step: '3', title: 'أضف المنتجات بضغطة زر', desc: 'تحميل سلس يعرض منتجاتك في متجرك الإلكتروني.' },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-100 rounded-3xl flex items-center justify-center text-2xl md:text-3xl font-bold text-purple-600 mx-auto mb-4 md:mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-lg shadow-purple-100">
                  {item.step}
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 md:mb-3">{item.title}</h3>
                <p className="text-sm md:text-base text-gray-600 px-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products section - معاينة المنتجات 2 في الصف على الموبايل */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">منتجاتنا</h2>
          <p className="text-gray-500 text-center mb-8 md:mb-12">تشكيلة واسعة من المنتجات المربحة في انتظارك</p>

          <div className="flex overflow-x-auto gap-2 pb-4 mb-6 md:mb-10 scrollbar-hide items-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-4 md:px-5 py-2 rounded-full font-medium text-xs md:text-sm transition-all ${
                  activeCategory === cat.id ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
            <button onClick={() => onNavigate('login')} className="flex-shrink-0 px-4 md:px-5 py-2 rounded-full font-medium text-xs md:text-sm bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200 transition">
              المزيد ←
            </button>
          </div>

          {activeCat && (
            <div className="mb-8 md:mb-10">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">{activeCat.name}</h3>
                <span className="text-base md:text-xl font-extrabold text-purple-600">+{activeCat.count?.toLocaleString() || 0}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {currentProducts.length > 0 ? (
                  currentProducts.slice(0, 4).map((product) => (
                    <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                      <div className="h-40 md:h-52 bg-gray-50 flex items-center justify-center p-2 md:p-4">
                        <img src={product.image_url || `https://picsum.photos/400/400?random=${product.id}`} alt={product.name} className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="p-3 md:p-4">
                        <h4 className="font-semibold text-gray-800 mb-1 text-sm md:text-base">{product.name}</h4>
                        <div className="flex items-center gap-1 text-yellow-500 text-xs md:text-sm mb-2">
                          {'★'.repeat(Math.floor(product.rating || 0))}{'☆'.repeat(5 - Math.floor(product.rating || 0))}
                          <span className="text-gray-400 text-xs">({product.reviews || 0})</span>
                        </div>
                        <button onClick={() => onNavigate('login')} className="mt-2 md:mt-3 w-full py-2 md:py-2.5 rounded-xl font-medium text-sm bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors">
                          تعرف على المواصفات
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 text-center text-gray-500 py-10">لا توجد منتجات في هذا القسم حالياً</div>
                )}
              </div>
            </div>
          )}

          <div className="text-center">
            <button onClick={() => onNavigate('catalog', activeCategory)} className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 md:px-8 py-2 md:py-3 rounded-2xl font-bold text-base md:text-lg shadow-lg hover:bg-purple-700 transition-all transform hover:-translate-y-1">
              اكتشف المزيد من {activeCat?.name} 🚀
            </button>
          </div>
        </div>
      </section>

      {/* CTA - تحسين للموبايل */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-purple-600 to-indigo-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-4">جاهز لتبدأ رحلتك في التجارة الإلكترونية؟</h2>
          <p className="text-base md:text-xl text-purple-100 mb-6 md:mb-10 max-w-2xl mx-auto">
            اكتشف آلاف المنتجات المربحة واربطها بمتجرك بنقرة واحدة. سجّل دخولك الآن وابدأ فوراً.
          </p>
          <button onClick={() => onNavigate('login')} className="inline-flex items-center gap-2 bg-white text-purple-700 font-bold px-8 md:px-12 py-3 md:py-5 rounded-2xl text-base md:text-xl shadow-2xl hover:bg-gray-100 transition-all transform hover:-translate-y-1 hover:scale-105">
            اكتشف منتجاتنا 🚀
          </button>
        </div>
      </section>

      <BrandsMarquee />

      {/* Plans section - تحسين للموبايل (باقة واحدة في الصف) */}
      {plans.length > 0 && (
        <section className="py-12 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">تسعير مرن يلبي احتياجاتك</h2>
            <p className="text-gray-500 text-center mb-8 md:mb-16">ابحث عن الباقة المثالية التي تعزز نمو متجرك</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {plans.map((plan) => (
                <div key={plan.id} className={`relative bg-white rounded-3xl p-6 md:p-8 border-2 transition-all hover:shadow-xl ${plan.popular ? 'border-purple-600 shadow-xl shadow-purple-100' : 'border-gray-100 shadow-sm'}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-0 right-0 text-center">
                      <span className="bg-purple-600 text-white px-4 md:px-6 py-1 rounded-full text-xs md:text-sm font-bold">الأكثر شيوعاً</span>
                    </div>
                  )}
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                  <p className="text-gray-500 text-sm md:text-base mb-4 md:mb-6">{plan.description}</p>
                  <div className="mb-4 md:mb-6">
                    <span className="text-4xl md:text-5xl font-extrabold text-gray-900">{plan.price_monthly}</span>
                    <span className="text-gray-500 text-base md:text-lg"> ر.س / {plan.period || 'شهرياً'}</span>
                  </div>
                  <ul className="space-y-2 md:space-y-4 mb-6 md:mb-8">
                    {(plan.features || []).map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 md:gap-3 text-gray-600 text-sm md:text-base">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => onNavigate('login')} className={`w-full py-2 md:py-3 rounded-xl font-bold text-base md:text-lg transition-all ${plan.popular ? 'bg-purple-600 text-white hover:bg-purple-700' : 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50'}`}>
                    ابدأ الآن
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials marquee - تحسين عرض الإطارات */}
      {testimonials.length > 0 && (
        <section className="py-12 md:py-20 bg-gray-50 overflow-hidden direction-ltr">
          <div className="max-w-7xl mx-auto px-4 md:px-6 mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">قصص نجاح</h2>
            <p className="text-gray-500 text-center">آراء العملاء اللي يعرف {APP_NAME} عمره مايندم</p>
          </div>
          <div className="w-full overflow-hidden">
            <div className="flex w-max animate-testimonial-marquee pause-on-hover" style={{ animationDuration: '60s' }}>
              {[...testimonials, ...testimonials, ...testimonials, ...testimonials].map((t, i) => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center px-2 w-64 md:w-80">
                  <DeviceFrame device={t.device}>
                    <img src={t.image_url} alt={t.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                    <div className="hidden w-full h-full bg-purple-100 text-purple-600 flex items-center justify-center text-4xl">👤</div>
                  </DeviceFrame>
                  <div className="mt-4 md:mt-8 text-center px-2">
                    <div className="text-2xl md:text-3xl mb-2 text-purple-300">❝</div>
                    <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-3 line-clamp-4 leading-relaxed">{t.text}</p>
                    <div>
                      <div className="font-bold text-gray-800 text-sm md:text-base">{t.name}</div>
                      <div className="text-xs md:text-sm text-gray-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <style>{`
            @keyframes testimonial-marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-25%); }
            }
            .animate-testimonial-marquee {
              animation: testimonial-marquee 20s linear infinite;
              will-change: transform;
              backface-visibility: hidden;
              transform: translate3d(0, 0, 0);
            }
            .pause-on-hover:hover {
              animation-play-state: paused !important;
            }
            .direction-ltr { direction: ltr; }
          `}</style>
        </section>
      )}

      {/* FAQ - تحسين للموبايل */}
      {faq.length > 0 && (
        <section className="py-12 md:py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-8 md:mb-16">الأسئلة الشائعة</h2>
            <div className="space-y-3 md:space-y-4">
              {faq.map((item, i) => (
                <details key={i} className="bg-gray-50 rounded-2xl p-4 md:p-6 group cursor-pointer">
                  <summary className="font-bold text-gray-800 text-base md:text-lg list-none flex justify-between items-center">
                    {item.question}
                    <span className="text-purple-600 group-open:rotate-180 transition-transform text-xl md:text-2xl">▼</span>
                  </summary>
                  <p className="text-gray-600 mt-3 md:mt-4 pr-4 md:pr-8 text-sm md:text-base">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <PublicFooter onNavigate={onNavigate} />
    </div>
  );
}