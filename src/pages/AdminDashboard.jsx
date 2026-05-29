export default function AdminDashboard({ onNavigate }) {
  const sections = [
    { id: 'admin-products', title: 'المنتجات', icon: '📦', desc: 'إضافة، تعديل، حذف المنتجات' },
    { id: 'admin-categories', title: 'الأقسام', icon: '🗂️', desc: 'إدارة أقسام الكتالوج' },
    { id: 'admin-testimonials', title: 'قصص النجاح', icon: '💬', desc: 'شهادات العملاء' },
    { id: 'admin-stats', title: 'الإحصائيات', icon: '📊', desc: 'أرقام المنصة (تجار، منتجات...)' },
    { id: 'admin-plans', title: 'الباقات', icon: '💎', desc: 'أسعار ومواصفات الباقات' },
    { id: 'admin-faq', title: 'الأسئلة الشائعة', icon: '❓', desc: 'إدارة الأسئلة والأجوبة' },
    { id: 'admin-content', title: 'المحتوى العام', icon: '📝', desc: 'النصوص الرئيسية في الصفحة الرئيسية' },
    { id: 'admin-banners', title: 'البنرات', icon: '🖼️', desc: 'إدارة البنرات الترويجية' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة الإدارة</h1>
      <p className="text-gray-600 mb-8">تحكم كامل في محتوى المنصة</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onNavigate(section.id)}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all text-right"
          >
            <span className="text-4xl mb-4 block">{section.icon}</span>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{section.title}</h3>
            <p className="text-sm text-gray-500">{section.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}