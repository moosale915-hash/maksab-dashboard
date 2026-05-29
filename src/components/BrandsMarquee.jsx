const brands = [
  { name: 'أمازون', image: '/images/amazon.png' },
  { name: 'سلة', image: '/images/Salla.png' },
  { name: 'شوبيفاي', image: '/images/shopify.png' },
  { name: 'زد ', image: '/images/Zid.png' },
  { name: 'على بابا', image: '/images/Alibaba.png' },
  { name: 'ووكومرس', image: '/images/wordpress.png' },
];

export default function BrandsMarquee() {
  // تكرار المصفوفة 4 مرات بيضمن إن الشاشة دايماً مليانة لوجوهات 
  // وبيعطي مساحة مريحة جداً للـ Animation يتحرك بانسيابية بدون أي فجوة مفاجئة
  const repeatedBrands = [...brands, ...brands, ...brands, ...brands];

  return (
    <div className="py-10 bg-white border-y border-gray-100 overflow-hidden direction-ltr">
      <p className="text-center text-sm font-medium text-gray-800 mb-6">
        يثق بنا آلاف التجار على أشهر المنصات
      </p>

      <div className="w-full overflow-hidden">
        {/* تم ضبط السرعة هنا على 15 ثانية كما طلبت */}
        <div className="flex w-max animate-marquee" style={{ animationDuration: '15s' }}>
          {repeatedBrands.map((brand, index) => (
            <div
              key={index}
              className="flex-shrink-0 flex items-center h-25 px-10"
            >
              <img
                src={brand.image}
                alt={brand.name}
                className="h-full w-auto object-contain"
                title={brand.name}
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { 
            transform: translateX(0); 
          }
          100% { 
            /* بنحركه بمقدار ربع العرض الإجمالي (اللي هو طول مصفوفة واحدة بالظبط) */
            transform: translateX(-25%); 
          }
        }
        
        .animate-marquee {
          animation: marquee 15s linear infinite;
          /* الخصائص القادمة هي السر السحري لمنع التقطيع والظهور المفاجئ */
          will-change: transform; 
          backface-visibility: hidden;
          transform: translate3d(0, 0, 0);
        }

        .direction-ltr {
          direction: ltr;
        }
      `}</style>
    </div>
  );
}