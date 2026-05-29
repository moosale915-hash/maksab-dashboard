import { useState, useEffect } from 'react';
import PublicFooter from '../components/PublicFooter';
import { supabase } from '../lib/supabaseClient';

// --- البيانات الثابتة (احتياطية) ---
const fallbackServices = [
  {
    id: 1,
    title: 'باقة الانطلاقة',
    image_url: '/images/services/service1.png',
    badge: 'وفّر 60%',
    price_current: 1999,
    price_old: 4999,
  },
  {
    id: 2,
    title: 'ابداها صح مع عرض الموسم',
    image_url: '/images/services/service2.png',
    badge: 'وفّر 51%',
    price_current: 5999,
    price_old: 12180,
  },
  {
    id: 3,
    title: 'باقة التطوير',
    image_url: '/images/services/service3.png',
    badge: 'وفّر 29%',
    price_current: 999,
    price_old: 1400,
  },
];

// --- مكون مودال طلب الخدمة (نفسه) ---
function OrderModal({ isOpen, onClose, serviceTitle, price }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !mobile) {
      alert('من فضلك أكمل الاسم ورقم الجوال على الأقل');
      return;
    }
    // محاكاة إرسال (يمكن إضافة Supabase لاحقًا)
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setName('');
      setEmail('');
      setMobile('');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-500 hover:text-white transition">✕</button>
        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl text-green-500 mx-auto mb-4">✓</div>
            <h3 className="text-xl font-bold text-purple-700 mb-2">تم استلام طلبك!</h3>
            <p className="text-gray-500">سيتواصل معك فريقنا خلال 24 ساعة.</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-purple-700 mb-1">طلب الخدمة</h2>
            <p className="text-sm text-gray-500 mb-4">سيتواصل معك فريقنا خلال 24 ساعة</p>
            <div className="bg-purple-50 border-r-4 border-purple-600 p-3 rounded mb-6 font-bold text-purple-700">{serviceTitle} – {price} ر.س</div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">الاسم <span className="text-red-500">*</span></label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none" placeholder="أدخل اسمك الكامل" required />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">البريد الإلكتروني <span className="text-gray-400">(اختياري)</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none" placeholder="example@mail.com (اختياري)" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">رقم الجوال <span className="text-red-500">*</span></label>
                <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none" placeholder="05XXXXXXXX" required />
              </div>
              <button type="submit" className="w-full py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition">إرسال الطلب</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// --- الصفحة الرئيسية للخدمات ---
export default function ServicesPage({ onNavigate }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState({ title: '', price: '' });
  const [services, setServices] = useState(fallbackServices);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('services').select('*');
        if (!error && data && data.length > 0) {
          setServices(data);
        } else {
          // استخدام البيانات الاحتياطية إذا كانت قاعدة البيانات فارغة أو حدث خطأ
          setServices(fallbackServices);
        }
      } catch (err) {
        console.error('خطأ في جلب الخدمات، استخدام البيانات الاحتياطية:', err);
        setServices(fallbackServices);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const openModal = (service) => {
    setSelectedService({ title: service.title, price: service.price_current });
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-purple-50 to-white py-20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">خدمات مكسب</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            عندك متجر إلكتروني وتبي تطوره، أو بتبدأ رحلتك في عالم التجارة الإلكترونية لأول مرة،
            نقدم لك حلول متكاملة تختصر وقتك وتلبي جميع احتياجات متجرك.
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="relative w-full h-[450px] bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={service.image_url}
                    alt={service.title}
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  {service.badge && (
                    <span className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-4 py-1.5 rounded-full">
                      {service.badge}
                    </span>
                  )}
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{service.title}</h3>
                  <div className="flex items-baseline gap-4 mb-6">
                    <span className="text-4xl font-extrabold text-purple-700">
                      {service.price_current?.toLocaleString()}
                      <span className="text-base font-bold text-purple-500 mr-1"> ر.س</span>
                    </span>
                    {service.price_old && (
                      <span className="text-xl text-gray-400 line-through">
                        {service.price_old?.toLocaleString()} ر.س
                      </span>
                    )}
                  </div>
                  <button onClick={() => openModal(service)} className="mt-auto w-full py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition text-lg">
                    طلب الخدمة
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-20 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h2 className="text-4xl font-extrabold mb-4">بسّط عملك وأنجز المزيد الآن.</h2>
          <p className="text-purple-100 text-lg max-w-2xl mx-auto mb-10">
            منصة عربية تدعم المتاجر الإلكترونية بخدمات لوجستية شاملة، مع التركيز على تطوير الأعمال والمنتجات.
          </p>
          <button onClick={() => onNavigate('login')} className="inline-flex items-center gap-2 bg-green-400 text-purple-900 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-green-300 transition-all shadow-xl">
            ابدأ التجربة المجانية
            <span>←</span>
          </button>
        </div>
      </section>

      <OrderModal isOpen={modalOpen} onClose={() => setModalOpen(false)} serviceTitle={selectedService.title} price={selectedService.price} />
      <PublicFooter onNavigate={onNavigate} />
    </div>
  );
}