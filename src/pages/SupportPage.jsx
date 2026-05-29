import { useState } from 'react';
import PublicFooter from '../components/PublicFooter';
import { APP_NAME } from '../config';

const faqData = [
  {
    q: 'ما هي خدماتنا؟',
    a: 'نوفر لك مجموعة متكاملة من الخدمات تشمل إنشاء المتاجر الإلكترونية، تطويرها، الربط مع منصات التجارة الإلكترونية، والتخزين والشحن.'
  },
  {
    q: 'كيف يمكنني التسجيل؟',
    a: 'يمكنك التسجيل من خلال الضغط على زر "تسجيل الدخول" ثم "اشترك الآن"، وتعبئة البيانات المطلوبة.'
  },
  {
    q: 'ما هي طرق الدفع المتاحة؟',
    a: 'ندعم الدفع عبر البطاقات الائتمانية (مدى، فيزا)، وخدمة تمارا للتقسيط.'
  },
  {
    q: 'هل يوجد دعم فني بعد الاشتراك؟',
    a: 'نعم، نوفر دعماً فنياً متميزاً عبر الواتساب والبريد الإلكتروني لضمان رضاك التام.'
  },
  {
    q: 'كم تستغرق عملية تجهيز الطلب وشحنه؟',
    a: 'عادةً ما تستغرق عملية التجهيز من 1-2 يوم عمل، والشحن يعتمد على منطقتك.'
  },
];

// --- مكون السؤال الشائع ---
function FaqItem({ q, a, isOpen, onClick }) {
  return (
    <div className={`bg-white rounded-xl mb-4 shadow-sm border transition-all ${isOpen ? 'border-purple-300 shadow-md' : 'border-gray-100'}`}>
      <button
        onClick={onClick}
        className="w-full px-6 py-5 flex justify-between items-center text-right font-bold text-gray-800 hover:text-purple-600 transition-colors"
      >
        <span>{q}</span>
        <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 mr-4 ${isOpen ? 'bg-purple-600 text-white rotate-180' : 'bg-gray-100 text-purple-600'}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-6 pb-6 text-gray-600 leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

export default function SupportPage({ onNavigate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // تحقق بسيط
    if (!name || !email || !message) {
      alert('يرجى تعبئة الاسم والبريد الإلكتروني والرسالة على الأقل');
      return;
    }
    // محاكاة إرسال
    alert('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    alert(`البحث عن: "${searchQuery}" - الميزة قيد التطوير`);
  };

  const handleFaqToggle = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Hero / Search Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-700 py-20 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-extrabold text-white mb-8">كيف يمكننا مساعدتك؟</h2>
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex bg-white rounded-full p-2 shadow-lg">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="اكتب سؤالك..."
              className="flex-1 px-6 py-3 rounded-full outline-none text-gray-700"
            />
            <button type="submit" className="bg-purple-700 text-white px-8 py-3 rounded-full font-bold hover:bg-purple-800 transition">
              ابحث
            </button>
          </form>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* معلومات التواصل */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="text-purple-600 font-bold mb-2">الدعم</div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-8">تواصل معنا</h2>

              <div className="flex items-start gap-5 mb-8">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-700">واتساب</div>
                  <div className="text-xl font-extrabold text-gray-900">920033015</div>
                  <small className="text-gray-500">الأحد – الأربعاء: 7:00 ص – 11:00 م</small>
                </div>
              </div>

              <div className="flex items-start gap-5 mb-8">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-700">بريد إلكتروني</div>
                  <div className="text-xl font-extrabold text-gray-900">support@{APP_NAME.toLowerCase()}.com</div>
                  <small className="text-gray-500">الاحد - الخميس (9:00ص - 5:00م)</small>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-700">العنوان</div>
                  <div className="text-gray-700">المملكة العربية السعودية، الرياض</div>
                </div>
              </div>
            </div>

            {/* نموذج التواصل */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">الاسم الكامل</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none"
                    placeholder="اسمك الكامل"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">عنوان البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none"
                    placeholder="بريدك الإلكتروني"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none"
                    placeholder="رقمك (اختياري)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">الرسالة</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none"
                    placeholder="اكتب رسالتك"
                    required
                  ></textarea>
                </div>
                <button type="submit" className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition">
                  إرسال الرسالة
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* الأسئلة الشائعة */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-14">الأسئلة الشائعة</h2>
          <div>
            {faqData.map((item, index) => (
              <FaqItem
                key={index}
                q={item.q}
                a={item.a}
                isOpen={openFaq === index}
                onClick={() => handleFaqToggle(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA نهائي */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-20 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h2 className="text-4xl font-extrabold mb-4">لم تجد ما تبحث عنه؟</h2>
          <p className="text-purple-100 text-lg max-w-2xl mx-auto mb-10">
            فريق الدعم الفني جاهز للإجابة على استفساراتك ومساعدتك في كل ما تحتاج.
          </p>
          <a
            href="https://wa.me/966538179815"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-400 text-purple-900 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-green-300 transition-all shadow-xl"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            تواصل عبر الواتساب
          </a>
        </div>
      </section>

      {/* تذييل */}
      <PublicFooter onNavigate={onNavigate} />
    </div>
  );
}