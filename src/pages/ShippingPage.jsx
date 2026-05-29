import { useEffect, useRef, useState } from 'react';
import PublicFooter from '../components/PublicFooter';

// --- مكون التأثيرات الحركية البسيطة (بديل AOS) ---
function useFadeIn() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

// --- مكون حركي بسيط ---
function FadeInSection({ children, className = '' }) {
  const [ref, visible] = useFadeIn();
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function ShippingPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-700 py-20 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            حتى خدمة الشحن ضبطناها لك!
          </h1>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            نوفر لك خدمة الشحن والتغليف لمنتجاتك ونضمن لك وصول المنتجات المحلية باسم متجرك
          </p>
        </div>
      </section>

      {/* الميزة 1: تغليف اقتصادي */}
      <FadeInSection>
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* صورة توضيحية */}
              <div className="order-2 md:order-1 flex justify-center">
                <img
                  src="https://m5azn.com/themes/plus/frontend/images/pakge.png"
                  alt="تغليف اقتصادي"
                  className="max-w-full h-auto rounded-2xl shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              {/* النص */}
              <div className="order-1 md:order-2">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
                  تحتاج تغليف عملي واقتصادي؟
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  مكسب توفر لك تغليف موّحد يخدم احتياجاتك الأساسية بسعر اقتصادي، مما يساعدك على تقليل التكاليف وضمان وصول المنتج بشكل آمن.
                </p>
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* الميزة 2: تغليف خاص بهويتك */}
      <FadeInSection>
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* صورة توضيحية */}
              <div className="flex justify-center">
                <img
                  src="https://m5azn.com/themes/plus/frontend/images/pakgee.png"
                  alt="تغليف خاص"
                  className="max-w-full h-auto rounded-2xl shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              {/* النص */}
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
                  ودك تشحن منتجاتك بتغليف خاص بهوية متجرك؟
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  نوفر لك خدمة تخزين تغليفك الخاص بالمستودع وتوصيل المنتجات بهويتك من مستودعاتنا إلى باب عميلك مباشرة، لتعزيز علامتك التجارية في ذهن العميل.
                </p>
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
            شحن سهل وسريع لمنتجاتك، وش تنتظر، كل شي تسهل لك
          </h2>
          <button
            onClick={() => onNavigate('login')}
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-purple-700 transition-all shadow-lg"
          >
            ابدأ تجارتك معنا الآن
          </button>
        </div>
      </section>

      {/* تذييل */}
      <PublicFooter onNavigate={onNavigate} />
    </div>
  );
}