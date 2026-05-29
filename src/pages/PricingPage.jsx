import { useState, useEffect } from 'react';
import PublicFooter from '../components/PublicFooter';
import { supabase } from '../lib/supabaseClient';

const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
  </svg>
);

const CheckIconWhite = () => (
  <svg className="w-5 h-5 text-white flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

function FaqItem({ q, a, hasImage, note, isOpen, onClick }) {
  return (
    <div className={`bg-white rounded-xl mb-4 shadow-sm border transition-all ${isOpen ? 'border-purple-300 shadow-md' : 'border-gray-100'}`}>
      <button onClick={onClick} className="w-full px-6 py-5 flex justify-between items-center text-right font-bold text-gray-800 hover:text-purple-600 transition-colors">
        <span>{q}</span>
        <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 mr-4 ${isOpen ? 'bg-purple-600 text-white rotate-180' : 'bg-gray-100 text-purple-600'}`}>▼</span>
      </button>
      {isOpen && (
        <div className="px-6 pb-6 text-gray-600 leading-relaxed">
          <p className="mb-3">{a}</p>
          {hasImage && <div className="w-full max-w-lg h-48 bg-gradient-to-br from-purple-50 to-gray-100 rounded-xl flex items-center justify-center text-5xl text-purple-300 my-4">🏪</div>}
          {note && <div className="bg-purple-50 border-r-4 border-purple-500 p-4 rounded-lg mt-4"><strong className="text-purple-700">ملاحظة:</strong> {note}</div>}
        </div>
      )}
    </div>
  );
}

export default function PricingPage({ onNavigate, isLoggedIn = false }) {
  const [period, setPeriod] = useState('monthly');
  const [openFaq, setOpenFaq] = useState(null);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    async function fetchPlans() {
      const { data } = await supabase.from('plans').select('*').neq('id', 'free').order('price_monthly');
      setPlans(data || []);
    }
    fetchPlans();
  }, []);

  const handleFaqToggle = (index) => setOpenFaq(openFaq === index ? null : index);

  const handleSubscribe = (plan) => {
    if (isLoggedIn) {
      // إذا كان مسجلاً، يذهب إلى صفحة الاشتراك داخل لوحة التحكم
      onNavigate('subscription');
    } else {
      // إذا لم يكن مسجلاً، يذهب إلى تسجيل الدخول مع حفظ صفحة العودة
      onNavigate('login', { returnTo: 'pricing' });
    }
  };

  const faqData = [
    { q: 'ايش هي منصة مكسب؟', a: 'مكسب هي منصة عربية رائدة في مجال الدروبشيبينق...' },
    { q: 'ايش آلية عمل المنصة؟', a: 'بعد تسجيلك واختيار الباقة المناسبة...', hasImage: true },
    { q: 'أقدر أجرب المنصة مجاناً؟', a: 'تقدر تسجل وتشترك بالباقة المجانية...' },
    { q: 'كيف أسجل في المنصة؟', a: 'كل اللي عليك تضغط على أيقونة "تسجيل الدخول"...' },
    { q: 'ماهي طريقة تحديد الربح؟', a: 'المنصة تعطيك الحرية في تحديد نسبة ربحك من المنتجات...', note: 'تقدر تغير نسبة الربح مرة واحدة فقط كل 7 أيام...' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-50 via-white to-blue-50 py-20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">تدور على باقة تناسبك؟</h1>
          <p className="text-xl text-gray-600 max-w-xl mx-auto">لا تحتار في باقاتنا لأننا صممناها بحلول تناسب الجميع</p>
        </div>
      </section>

      {/* قسم الباقات */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10"><h2 className="text-4xl font-extrabold text-gray-900">اختر <span className="text-purple-600">باقتك</span></h2></div>

          <div className="flex justify-center mb-16">
            <div className="bg-white rounded-full p-1.5 shadow-md inline-flex">
              <button onClick={() => setPeriod('monthly')} className={`px-8 py-3 rounded-full font-bold text-sm transition-all ${period === 'monthly' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>الباقات الشهرية</button>
              <button onClick={() => setPeriod('yearly')} className={`px-8 py-3 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${period === 'yearly' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>الباقات السنوية <span className="bg-green-400 text-purple-900 px-2 py-0.5 rounded-full text-xs font-extrabold">-17%</span></button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto">
            {plans.map((plan) => {
              // حساب السعر السنوي الأصلي (السعر الشهري × 12)
              const originalYearlyPrice = plan.price_monthly * 12;
              const discountedYearlyPrice = plan.price_yearly;
              const hasYearlyDiscount = discountedYearlyPrice < originalYearlyPrice;

              return (
                <div key={plan.id} className={`relative bg-white rounded-3xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-2 border-2 ${plan.popular ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-purple-500 shadow-2xl scale-105 lg:scale-110' : 'border-gray-100 shadow-sm hover:shadow-xl'}`}>
                  {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-400 text-purple-900 px-5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1 shadow-lg"><StarIcon /> الأكثر شعبية</div>}
                  <h3 className={`text-2xl font-extrabold mb-1 ${plan.popular ? 'text-white' : 'text-purple-700'}`}>{plan.name}</h3>
                  <p className={`text-sm mb-6 ${plan.popular ? 'text-purple-100' : 'text-gray-500'}`}>{plan.description}</p>
                  
                  {period === 'monthly' ? (
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className={`text-6xl font-extrabold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>{plan.price_monthly}</span>
                      <span className={`text-lg font-bold ${plan.popular ? 'text-purple-200' : 'text-gray-400'}`}>ر.س</span>
                      <span className={`text-sm mr-2 ${plan.popular ? 'text-purple-200' : 'text-gray-500'}`}>/ شهرياً</span>
                    </div>
                  ) : (
                    <div className="mb-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className={`text-6xl font-extrabold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>{discountedYearlyPrice}</span>
                        <span className={`text-lg font-bold ${plan.popular ? 'text-purple-200' : 'text-gray-400'}`}>ر.س</span>
                        <span className={`text-sm mr-2 ${plan.popular ? 'text-purple-200' : 'text-gray-500'}`}>/ سنوياً</span>
                      </div>
                      {hasYearlyDiscount && (
                        <div className="mt-1">
                          <span className={`text-sm line-through ${plan.popular ? 'text-purple-300' : 'text-gray-400'}`}>
                            {originalYearlyPrice} ر.س
                          </span>
                          <span className={`text-xs mr-2 ${plan.popular ? 'text-purple-200' : 'text-green-600'}`}>
                            (وفر {Math.round(((originalYearlyPrice - discountedYearlyPrice) / originalYearlyPrice) * 100)}%)
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => handleSubscribe(plan)}
                    className={`mt-6 w-full py-3.5 rounded-xl font-bold text-base transition-all ${plan.popular ? 'bg-green-400 text-purple-900 hover:bg-green-300' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                  >
                    {isLoggedIn ? 'ترقية' : 'اشترك الآن'}
                  </button>

                  <ul className={`mt-8 space-y-3.5 flex-1 ${plan.popular ? 'text-white' : 'text-gray-700'}`}>
                    {(plan.features || []).map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm leading-relaxed">{plan.popular ? <CheckIconWhite /> : <CheckIcon />}{feature}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <h5 className="text-lg font-bold text-gray-800 mb-4 max-w-lg mx-auto">تود معرفة المزيد عن الباقات أو تحتاج توضيح قبل الاشتراك؟ فريقنا جاهز للإجابة على جميع استفساراتك ومساعدتك في اختيار الأنسب لعملك</h5>
            <a href="https://wa.me/966538179815" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-green-500 text-white px-8 py-3.5 rounded-full font-bold hover:bg-green-600 transition-all hover:shadow-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              اضغط هنا للتواصل معنا
            </a>
          </div>
        </div>
      </section>

      {/* الأسئلة الشائعة */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14"><h2 className="text-4xl font-extrabold text-gray-900">الأسئلة <span className="text-purple-600">الشائعة</span></h2></div>
          {faqData.map((item, index) => (
            <FaqItem key={index} q={item.q} a={item.a} hasImage={item.hasImage} note={item.note} isOpen={openFaq === index} onClick={() => handleFaqToggle(index)} />
          ))}
        </div>
      </section>

      {/* CTA نهائي */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-20 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h2 className="text-4xl font-extrabold mb-4">بسّط عملك وأنجز المزيد الآن.</h2>
          <p className="text-purple-100 text-lg max-w-2xl mx-auto mb-10">منصة عربية تدعم المتاجر الإلكترونية بخدمات لوجستية شاملة، مع التركيز على تطوير الأعمال والمنتجات.</p>
          <button onClick={() => onNavigate(isLoggedIn ? 'subscription' : 'login', { returnTo: 'pricing' })} className="inline-flex items-center gap-2 bg-green-400 text-purple-900 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-green-300 transition-all shadow-xl">ابدأ التجربة المجانية <span>←</span></button>
        </div>
      </section>

      <PublicFooter onNavigate={onNavigate} />
    </div>
  );
}