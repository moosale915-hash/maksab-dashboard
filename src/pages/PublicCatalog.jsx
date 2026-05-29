import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// --- أيقونات SVG احتياطية (في حال عدم وجود صور) ---
const productIcons = {
  default: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12">
      <rect x="2" y="2" width="20" height="20" rx="4" />
      <path d="M7 12h10M12 7v10" />
    </svg>
  ),
  electronics: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  fashion: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12">
      <path d="M12 2l3 6h6l-4.5 3.5L18 18l-6-3.5L6 18l1.5-6.5L3 8h6z" />
    </svg>
  ),
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  ),
};

// --- البيانات الثابتة الاحتياطية ---
const fallbackCategories = [
  { id: 'الكل', name: 'جميع المنتجات', icon: '🛒', count: 0, color: 'bg-purple-50 text-purple-600' },
  { id: 'إلكترونيات', name: 'إلكترونيات', icon: '📱', count: 32000, color: 'bg-blue-50 text-blue-600' },
  { id: 'أزياء', name: 'أزياء', icon: '👗', count: 11250, color: 'bg-pink-50 text-pink-600' },
  { id: 'منزل', name: 'منزل ومطبخ', icon: '🏠', count: 14500, color: 'bg-orange-50 text-orange-600' },
  { id: 'تجميل', name: 'تجميل وعناية', icon: '💄', count: 11400, color: 'bg-purple-50 text-purple-600' },
  { id: 'أطفال', name: 'أطفال ومواليد', icon: '👶', count: 10055, color: 'bg-green-50 text-green-600' },
  { id: 'رياضة', name: 'رياضة ولياقة', icon: '⚽', count: 11110, color: 'bg-red-50 text-red-600' },
  { id: 'مكتب', name: 'مكتب وقرطاسية', icon: '📚', count: 11750, color: 'bg-yellow-50 text-yellow-600' },
  { id: 'سيارات', name: 'إكسسوارات سيارات', icon: '🚗', count: 15660, color: 'bg-indigo-50 text-indigo-600' },
];

const fallbackProducts = [
  { id: 1, name: 'ساعة ذكية حديثة', category: 'إلكترونيات', rating: 4.5, reviews: 128, icon: 'electronics', badge: 'جديد', image_url: null },
  { id: 2, name: 'سماعة بلوتوث لاسلكية', category: 'إلكترونيات', rating: 4.2, reviews: 54, icon: 'electronics', badge: null, image_url: null },
  { id: 3, name: 'حقيبة ظهر جلدية', category: 'أزياء', rating: 4.7, reviews: 89, icon: 'fashion', badge: 'الأكثر مبيعاً', image_url: null },
  { id: 4, name: 'نظارة شمسية كلاسيكية', category: 'أزياء', rating: 4.4, reviews: 36, icon: 'fashion', badge: null, image_url: null },
  { id: 5, name: 'مج قهوة حراري', category: 'منزل', rating: 4.1, reviews: 47, icon: 'home', badge: null, image_url: null },
  { id: 6, name: 'مصباح LED مكتبي', category: 'منزل', rating: 4.3, reviews: 63, icon: 'home', badge: 'خصم 20%', image_url: null },
  { id: 7, name: 'قلم ترجمة ذكي', category: 'إلكترونيات', rating: 4.8, reviews: 210, icon: 'electronics', badge: null, image_url: null },
  { id: 8, name: 'سجادة صلاة فاخرة', category: 'منزل', rating: 4.9, reviews: 210, icon: 'home', badge: null, image_url: null },
];

const categoriesList = ['الكل', 'إلكترونيات', 'أزياء', 'منزل', 'تجميل', 'أطفال', 'رياضة', 'مكتب', 'سيارات'];
const ITEMS_PER_PAGE = 8;

export default function PublicCatalog({ selectedCategory, onNavigate }) {
  const [activeCategory, setActiveCategory] = useState(selectedCategory || 'الكل');
  const [search, setSearch] = useState('');
  const [allProducts, setAllProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(fallbackCategories);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data: catsData, error: catsErr } = await supabase
          .from('categories')
          .select('*')
          .order('count', { ascending: false });
        
        if (!catsErr && catsData && catsData.length) {
          setCategories([{ id: 'الكل', name: 'جميع المنتجات', count: 0 }, ...catsData]);
        } else {
          setCategories(fallbackCategories);
        }

        const { data: prodsData, error: prodsErr } = await supabase
          .from('products')
          .select('*')
          .eq('is_visible', true);
        
        if (!prodsErr && prodsData && prodsData.length) {
          const formatted = prodsData.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category_id,
            rating: p.rating || 4.5,
            reviews: p.reviews || 0,
            icon: p.icon || 'default',
            badge: p.discount ? `خصم ${p.discount}%` : null,
            image_url: p.image_url,
          }));
          setAllProducts(formatted);
        } else {
          setAllProducts(fallbackProducts);
        }
      } catch (err) {
        console.error('خطأ في جلب بيانات الكتالوج، استخدام البيانات الاحتياطية:', err);
        setCategories(fallbackCategories);
        setAllProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategory) setActiveCategory(selectedCategory);
  }, [selectedCategory]);

  const filtered = allProducts.filter((p) => {
    const matchCat = activeCategory === 'الكل' ? true : p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const displayedProducts = filtered.slice(0, ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-purple-50 to-white py-16 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">منتجاتنا</h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            ابحث عن المنتجات المثالية لتعزيز نمو متجرك الإلكتروني وتحقيق أهداف عملك.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* شريط الفئات */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-8 scrollbar-hide items-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full font-medium text-sm transition-all ${
                activeCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
          <button
            onClick={() => onNavigate('login')}
            className="flex-shrink-0 px-5 py-2.5 rounded-full font-medium text-sm bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200 transition"
          >
            المزيد ←
          </button>
        </div>

        {/* شريط البحث */}
        <div className="relative mb-10 max-w-md">
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="ابحث في الكتالوج..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:outline-none"
          />
        </div>

        {/* شبكة المنتجات - تم تحسين الصور */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {displayedProducts.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-500">
              <span className="text-5xl block mb-4">📭</span>
              لا توجد منتجات مطابقة لبحثك
            </div>
          ) : (
            displayedProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* حاوية الصورة - ارتفاع أكبر وتغطية كاملة بدون فراغات */}
                <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {productIcons[product.icon] || productIcons.default}
                    </div>
                  )}
                  {product.badge && (
                    <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow z-10">
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-full self-start">
                    {product.category}
                  </span>
                  <h3 className="mt-2 font-semibold text-gray-800 line-clamp-2 min-h-[3rem]">{product.name}</h3>
                  <div className="flex items-center gap-1 text-yellow-500 text-sm my-2">
                    {'★'.repeat(Math.floor(product.rating))}
                    {'☆'.repeat(5 - Math.floor(product.rating))}
                    <span className="text-gray-400 text-xs">({product.reviews})</span>
                  </div>
                  <button
                    onClick={() => onNavigate('login')}
                    className="mt-auto w-full py-2.5 px-4 rounded-xl font-medium bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
                  >
                    تعرف على المواصفات
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* زر عرض المزيد */}
        <div className="text-center mb-16">
          <button
            onClick={() => onNavigate('login')}
            className="inline-flex items-center gap-2 px-10 py-4 border-2 border-purple-600 text-purple-700 rounded-full font-bold text-lg hover:bg-purple-600 hover:text-white transition-all"
          >
            <span>↻</span>
            اكتشف المزيد من المنتجات
          </button>
        </div>

        {/* CTA */}
        <section className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white text-center py-16 rounded-3xl shadow-xl">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-4xl font-extrabold mb-4">اكتشف المزيد من المنتجات الرابحة</h2>
            <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
              سجّل دخولك الآن واحصل على وصول كامل لآلاف المنتجات الجاهزة للاستيراد إلى متجرك.
            </p>
            <button
              onClick={() => onNavigate('login')}
              className="inline-flex items-center gap-2 bg-white text-purple-700 font-bold px-12 py-5 rounded-2xl text-xl shadow-2xl hover:bg-gray-100 transition-all transform hover:-translate-y-1 hover:scale-105"
            >
              ابدأ تجارتك الآن
              <span className="text-2xl">🚀</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}