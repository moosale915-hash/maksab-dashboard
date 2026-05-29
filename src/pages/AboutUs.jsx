import PublicFooter from '../components/PublicFooter';

export default function AboutUs({ onNavigate }) {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-purple-50 to-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">من نحن</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            مكسب هي منصة عربية رائدة في مجال الدروبشيبينق، نهدف إلى تمكين التجار العرب من الوصول إلى آلاف المنتجات المربحة بسهولة، وربطها بمتاجرهم الإلكترونية بنقرة واحدة.
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">رؤيتنا</h2>
            <p className="text-gray-600">أن نكون المنصة الأولى للتجارة الإلكترونية في الوطن العربي، نمكن كل تاجر من بناء مشروعه بسهولة.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">قيمنا</h2>
            <ul className="space-y-2 text-gray-600">
              <li>✅ الشفافية والمصداقية</li>
              <li>✅ الابتكار المستمر</li>
              <li>✅ دعم العميل أولاً</li>
            </ul>
          </div>
        </div>
      </section>

      <PublicFooter onNavigate={onNavigate} />
    </div>
  );
}