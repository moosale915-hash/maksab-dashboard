import PublicFooter from '../components/PublicFooter';

const steps = [
  {
    step: '1',
    title: 'سجّل حسابك',
    desc: 'أنشئ حسابك مجاناً واختر الباقة المناسبة لمتجرك.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    step: '2',
    title: 'اربط متجرك',
    desc: 'اربط متجرك الإلكتروني بضغطة زر لتبدأ الاستيراد.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    step: '3',
    title: 'اختر منتجاتك',
    desc: 'تصفح آلاف المنتجات وأضفها إلى قائمة الاستيراد.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    step: '4',
    title: 'انشر وأربح',
    desc: 'انشر المنتجات في متجرك وابدأ تحقيق الأرباح.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
];

export default function HowItWorks({ onNavigate }) {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-purple-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">كيف نعمل</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            أربع خطوات بسيطة لتبدأ تجارتك الإلكترونية مع {''} 
            <span className="text-purple-600 font-bold">مكسب</span>
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {steps.map((item, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                  <span className="w-8 h-8">{item.icon}</span>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">{item.step}</span>
                    <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
                  </div>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-16">
            <button
              onClick={() => onNavigate('login')}
              className="bg-purple-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-purple-700 shadow-xl shadow-purple-200 transition"
            >
              ابدأ الآن
            </button>
          </div>
        </div>
      </section>

      <PublicFooter onNavigate={onNavigate} />
    </div>
  );
}