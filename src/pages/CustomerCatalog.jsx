import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

// --- أيقونات SVG احتياطية ---
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

// --- البيانات الثابتة الاحتياطية (في حال فشل Supabase) ---
const fallbackCategories = [
  { id: 'إلكترونيات', name: 'إلكترونيات', count: 32000 },
  { id: 'أزياء', name: 'أزياء', count: 11250 },
  { id: 'منزل', name: 'منزل ومطبخ', count: 14500 },
  { id: 'تجميل', name: 'تجميل وعناية', count: 11400 },
  { id: 'أطفال', name: 'أطفال ومواليد', count: 10055 },
  { id: 'رياضة', name: 'رياضة ولياقة', count: 11110 },
  { id: 'مكتب', name: 'مكتب وقرطاسية', count: 11750 },
  { id: 'سيارات', name: 'إكسسوارات سيارات', count: 15660 },
];

const fallbackProducts = [
  { id: 1, name: 'ساعة ذكية حديثة', price: 199, category_id: 'إلكترونيات', rating: 4.5, reviews: 128, image_url: 'https://picsum.photos/400/400?random=1', original_price: 299, discount: 30, stock: 120, source: 'مورد محلي' },
  { id: 2, name: 'سماعة بلوتوث لاسلكية', price: 89, category_id: 'إلكترونيات', rating: 4.2, reviews: 54, image_url: 'https://picsum.photos/400/400?random=2', original_price: 149, discount: 40, stock: 250, source: 'مورد صيني' },
  { id: 3, name: 'حقيبة ظهر جلدية', price: 249, category_id: 'أزياء', rating: 4.7, reviews: 89, image_url: 'https://picsum.photos/400/400?random=4', original_price: 399, discount: 37, stock: 45, source: 'مورد محلي' },
  // ... باقي المنتجات
];

// --- شريط الفئات العلوي مع تمرير أفقي ---
function CategoryBar({ categories, activeCategory, onSelect }) {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) ref.addEventListener('scroll', checkScroll);
    return () => { if (ref) ref.removeEventListener('scroll', checkScroll); };
  }, [categories]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  if (!categories.length) return null;

  return (
    <div className="relative flex items-center mb-8">
      {showLeftArrow && (
        <button onClick={() => scroll('left')} className="absolute right-0 z-10 bg-white p-3 rounded-full shadow-xl border border-gray-200 hover:shadow-2xl transition-all">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
      )}
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide py-3 px-1 w-full scroll-smooth">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`flex flex-col items-center justify-center min-w-[100px] p-3 rounded-2xl transition-all duration-300 border-2 ${
              activeCategory === cat.id ? 'bg-purple-50 border-purple-400 shadow-xl scale-105 -translate-y-1' : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-lg'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden mb-2 flex items-center justify-center">
              {cat.image_url ? (
                <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">{cat.icon || '📦'}</span>
              )}
            </div>
            <span className={`text-sm font-bold ${activeCategory === cat.id ? 'text-purple-700' : 'text-gray-600'}`}>{cat.name}</span>
          </button>
        ))}
      </div>
      {showRightArrow && (
        <button onClick={() => scroll('right')} className="absolute left-0 z-10 bg-white p-3 rounded-full shadow-xl border border-gray-200 hover:shadow-2xl transition-all">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      )}
    </div>
  );
}

// --- بطاقة المنتج المحسنة (مع صور أفضل) ---
function ProductCard({ product, onAddToImport, onRemoveFromImport, isInImport, onNavigate }) {
  const discountPercent = product.original_price > 0 && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col">
      {/* حاوية الصورة - ارتفاع أكبر وتغطية كاملة */}
      <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
        <img
          src={product.image_url || `https://via.placeholder.com/400?text=${encodeURIComponent(product.name)}`}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=No+Image'; }}
        />
        {discountPercent > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-10">
            -{discountPercent}%
          </span>
        )}
        <button className="absolute top-2 left-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50 transition-colors z-10">
          <svg className="w-4 h-4 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        </button>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-lg text-gray-800">{product.price} <span className="text-xs font-normal text-gray-500">ر.س</span></span>
          {product.original_price > product.price && (
            <span className="text-xs text-gray-400 line-through">{product.original_price} ر.س</span>
          )}
        </div>
        <h3 className="text-sm text-gray-700 line-clamp-2 mb-2 font-medium leading-tight min-h-[2.5rem]">{product.name}</h3>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1"><span className="text-purple-500">📦</span> {product.stock || 0}</span>
          <span className="flex items-center gap-1"><span className="text-purple-500">🚚</span> 3-8 أيام</span>
        </div>
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => onNavigate('importList')}
            className="flex-1 bg-purple-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors shadow-sm"
          >
            أضف للسلة
          </button>
          <button
            onClick={() => isInImport ? onRemoveFromImport(product.id) : onAddToImport(product)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
              isInImport
                ? 'bg-red-50 text-red-500 border border-red-200 cursor-pointer'
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200'
            }`}
          >
            {isInImport ? '✓ تمت' : '➕ إضافة'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- المكون الرئيسي ---
export default function CustomerCatalog({ addToImportList, removeFromImportList, importList, onNavigate }) {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [searchTerm, setSearchTerm] = useState('');

  // جلب البيانات من Supabase
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // جلب الأقسام
        const { data: catsData, error: catsErr } = await supabase
          .from('categories')
          .select('*')
          .order('count', { ascending: false });
        
        if (!catsErr && catsData && catsData.length) {
          setCategories([{ id: 'الكل', name: 'جميع المنتجات' }, ...catsData]);
        } else {
          setCategories([{ id: 'الكل', name: 'جميع المنتجات' }, ...fallbackCategories]);
        }

        // جلب المنتجات المرئية
        const { data: prodsData, error: prodsErr } = await supabase
          .from('products')
          .select('*')
          .eq('is_visible', true);
        
        if (!prodsErr && prodsData && prodsData.length) {
          setAllProducts(prodsData);
        } else {
          setAllProducts(fallbackProducts);
        }
      } catch (err) {
        console.error('خطأ في جلب البيانات:', err);
        setCategories([{ id: 'الكل', name: 'جميع المنتجات' }, ...fallbackCategories]);
        setAllProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // تصفية المنتجات حسب القسم والبحث
  const filteredProducts = allProducts.filter(p => {
    const matchCategory = activeCategory === 'الكل' ? true : p.category_id === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  // المنتجات المميزة (أفضل مبيعاً، ربحية عالية، مخزون عالي)
  const bestSelling = [...allProducts].sort((a, b) => (b.discount || 0) - (a.discount || 0)).slice(0, 12);
  const highProfit = [...allProducts].filter(p => p.original_price > p.price * 1.5).slice(0, 12);
  const highStock = [...allProducts].filter(p => (p.stock || 0) > 50).slice(0, 12);

  if (loading) {
    return (
      <div className="h-full bg-gray-50 p-6 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 p-4 md:p-6 space-y-6">
      {/* شريط البحث العلوي */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border flex items-center gap-3">
        <div className="relative flex-1">
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" /></svg>
          <input
            type="text"
            placeholder="ابحث عن منتج أو رقم الصنف..."
            className="w-full pl-4 pr-10 py-3 border-0 bg-gray-50 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-sm">
          بحث
        </button>
      </div>

      {/* شريط البانرات */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { bg: 'from-purple-500 to-indigo-600', text: 'عروض رمضان', sub: 'خصم حتى 50%' },
          { bg: 'from-green-400 to-teal-500', text: 'منتجات جديدة', sub: 'اكتشف الجديد' },
          { bg: 'from-orange-400 to-pink-500', text: 'الشحن مجاني', sub: 'للطلبات فوق 200 ر.س' },
        ].map((banner, idx) => (
          <div key={idx} className={`min-w-[300px] h-36 rounded-2xl bg-gradient-to-r ${banner.bg} p-6 flex flex-col justify-center text-white shadow-md`}>
            <h3 className="text-xl font-bold mb-1">{banner.text}</h3>
            <p className="text-sm opacity-90">{banner.sub}</p>
          </div>
        ))}
      </div>

      {/* شريط الفئات */}
      <CategoryBar categories={categories} activeCategory={activeCategory} onSelect={setActiveCategory} />

      {/* المحتوى الرئيسي */}
      {activeCategory === 'الكل' ? (
        <>
          <ProductSlider title="🏆 أفضل المنتجات مبيعاً" products={bestSelling} onAddToImport={addToImportList} onRemoveFromImport={removeFromImportList} importList={importList} onNavigate={onNavigate} />
          <ProductSlider title="💰 منتجات ذات ربحية عالية" products={highProfit} onAddToImport={addToImportList} onRemoveFromImport={removeFromImportList} importList={importList} onNavigate={onNavigate} />
          <ProductSlider title="📦 منتجات مخزون عالي" products={highStock} onAddToImport={addToImportList} onRemoveFromImport={removeFromImportList} importList={importList} onNavigate={onNavigate} />
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">منتجات {activeCategory}</h2>
            <span className="text-sm text-gray-500">{filteredProducts.length} منتج</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToImport={addToImportList}
                onRemoveFromImport={removeFromImportList}
                isInImport={importList?.some(item => item.id === product.id)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </>
      )}

      {/* تذييل بسيط */}
      <div className="text-center text-xs text-gray-400 py-4 border-t mt-8">
        © 2026 مكسب. جميع الحقوق محفوظة.
      </div>
    </div>
  );
}

// --- مكون شريط المنتجات الأفقي (مع تحسين الصور) ---
function ProductSlider({ title, products, onAddToImport, onRemoveFromImport, importList, onNavigate }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) ref.addEventListener('scroll', checkScroll);
    return () => { if (ref) ref.removeEventListener('scroll', checkScroll); };
  }, [products]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  if (!products.length) return null;

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <div className="flex gap-2">
          {canScrollLeft && (
            <button onClick={() => scroll('left')} className="p-2 rounded-full bg-white border shadow-sm hover:bg-gray-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}
          {canScrollRight && (
            <button onClick={() => scroll('right')} className="p-2 rounded-full bg-white border shadow-sm hover:bg-gray-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
          <button className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">عرض الكل</button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth">
        {products.map(product => (
          <div key={product.id} className="flex-shrink-0 w-64">
            <ProductCard
              product={product}
              onAddToImport={onAddToImport}
              onRemoveFromImport={onRemoveFromImport}
              isInImport={importList?.some(item => item.id === product.id)}
              onNavigate={onNavigate}
            />
          </div>
        ))}
      </div>
    </div>
  );
}