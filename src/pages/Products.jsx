import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const categories = ['الكل', 'إلكترونيات', 'أزياء', 'منزل', 'تجميل', 'أطفال', 'رياضة', 'مكتب', 'سيارات'];

export default function Products({ addToImportList, removeFromImportList, importList }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [sortBy, setSortBy] = useState('popularity');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data } = await supabase.from('products').select('*').eq('is_visible', true);
      setProducts(data || []);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'الكل' ? true : p.category_id === selectedCategory;
    return matchSearch && matchCategory;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.reviews - a.reviews;
  });

  const isInImportList = (productId) => importList.some(item => item.id === productId);

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500">
        <div className="animate-spin text-4xl mb-4">⟳</div>
        جاري تحميل المنتجات...
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">🔍</span>
          <input
            type="text" placeholder="ابحث عن منتج..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="py-2.5 px-4 border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300">
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="py-2.5 px-4 border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300">
          <option value="popularity">الأكثر مبيعاً</option>
          <option value="rating">الأعلى تقييماً</option>
          <option value="price-low">الأقل سعراً</option>
          <option value="price-high">الأعلى سعراً</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sorted.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-500">لا توجد منتجات مطابقة لبحثك.</div>
        ) : (
          sorted.map((product) => {
            const added = isInImportList(product.id);
            return (
              <div key={product.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                <div className="h-52 bg-gray-50 flex items-center justify-center p-4 relative">
                  <img
                    src={product.image_url || `https://via.placeholder.com/300?text=${encodeURIComponent(product.name)}`}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                  {product.discount > 0 && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">-{product.discount}%</span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-xs text-purple-600 font-medium bg-purple-50 self-start px-2 py-0.5 rounded-full mb-2">{product.category_id}</span>
                  <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 leading-snug">{product.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-yellow-500 mb-2">
                    {'★'.repeat(Math.floor(product.rating || 0))}{'☆'.repeat(5 - Math.floor(product.rating || 0))}
                    <span className="text-gray-400 text-xs">({product.reviews || 0})</span>
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-gray-900">{product.price} ر.س</span>
                      {product.original_price > product.price && (
                        <span className="text-sm text-gray-400 line-through">{product.original_price} ر.س</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{product.source}</span>
                  </div>
                  <button
                    onClick={() => added ? removeFromImportList(product.id) : addToImportList(product)}
                    className={`mt-4 w-full py-2.5 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
                      added ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {added ? '🗑️ إلغاء الإضافة' : '📦 أضف لمتجرك'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}