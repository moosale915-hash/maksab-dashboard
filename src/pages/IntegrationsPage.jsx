import PublicFooter from '../components/PublicFooter';

// --- أيقونات SVG للميزات ---
const features = [
  {
    icon: (
      <svg className="w-12 h-12 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21,15 16,10 5,21" />
      </svg>
    ),
    title: 'صور ووصف المنتجات',
  },
  {
    icon: (
      <svg className="w-12 h-12 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16,3 21,3 21,8" />
        <line x1="4" y1="20" x2="21" y2="3" />
        <polyline points="21,16 21,21 16,21" />
        <line x1="15" y1="15" x2="21" y2="21" />
        <line x1="4" y1="4" x2="9" y2="9" />
      </svg>
    ),
    title: 'ربط الطلبات',
  },
  {
    icon: (
      <svg className="w-12 h-12 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 18a2 2 0 100-4 2 2 0 000 4z" />
        <path d="M7 6a2 2 0 100-4 2 2 0 000 4z" />
        <path d="M17 8l-4 4-4-3" />
      </svg>
    ),
    title: 'تتبع الشحنات',
  },
  {
    icon: (
      <svg className="w-12 h-12 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      </svg>
    ),
    title: 'كمية المنتجات',
  },
  {
    icon: (
      <svg className="w-12 h-12 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    title: 'ربط السعر مع هامش الربح',
  },
  {
    icon: (
      <svg className="w-12 h-12 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    ),
    title: 'تتبع الشحنات',
  },
];

export default function IntegrationsPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* النص */}
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                اربط منتجاتك من مكسب إلى متجرك الإلكتروني مباشرة
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                بخطوات بسيطة تبدأ البيع وتدير تجارتك بسهولة تامة من مكان واحد.
              </p>
              <button
                onClick={() => onNavigate('login')}
                className="bg-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-all shadow-lg"
              >
                ابدأ الآن
              </button>
            </div>
            {/* صورة توضيحية */}
            <div className="flex justify-center">
              <img
                src="https://m5azn.com/themes/plus/frontend/images/section/int.png"
                alt="الربط التقني"
                className="max-w-full h-auto rounded-2xl shadow-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-purple-600 font-bold uppercase tracking-wider text-sm">مميزاتنا</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mt-4">
              مكسب تربط لك كل ما تحتاجه لإدارة منتجاتك مع منصات التجارة الإلكترونية
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-2 transition-all duration-300"
              >
                <div className="flex justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800">{feature.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA نهائي */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-8">
            التجارة حلم يتحقق مع مكسب
          </h2>
          <button
            onClick={() => onNavigate('login')}
            className="bg-purple-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-purple-700 transition-all shadow-lg"
          >
            ابدأ تجارتك معنا
          </button>
        </div>
      </section>

      {/* تذييل */}
      <PublicFooter onNavigate={onNavigate} />
    </div>
  );
}