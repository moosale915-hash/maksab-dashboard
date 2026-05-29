import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { APP_NAME } from '../config';

export default function RegisterPage({ onNavigate, onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !email || !password) {
      setError('الاسم، البريد الإلكتروني، وكلمة المرور مطلوبة');
      setLoading(false);
      return;
    }

    // 1. إنشاء الحساب
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // 2. إنشاء الملف الشخصي
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: name,
        phone,
        is_admin: false,
      });

      // 3. إنشاء اشتراك مجاني (تلقائي)
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1); // صلاحية شهر واحد للنسخة التجريبية (يمكن تغييرها)
      await supabase.from('user_subscriptions').insert({
        user_id: data.user.id,
        plan_id: 'free',
        plan_name: 'مجاني',
        price: 0,
        billing_cycle: 'monthly',
        status: 'active',
        started_at: new Date(),
        expires_at: expiresAt,
      });

      // 4. تسجيل الدخول مباشرة (بما أن Confirm Email معطل)
      // نمرر false لأن المستخدم الجديد ليس مسؤولاً
      onLogin(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-700 mb-2">🚀 {APP_NAME}</h1>
          <p className="text-gray-500">أنشئ حسابك وابدأ تجارتك الإلكترونية</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-5">
          <h2 className="text-xl font-bold text-gray-800 text-center mb-2">تسجيل جديد</h2>
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك الكامل" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@mail.com" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الجوال (اختياري)</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xxxxxxxx" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:outline-none" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50">
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب والدخول'}
          </button>
          <p className="text-center text-sm text-gray-500">
            لديك حساب بالفعل؟{' '}
            <button type="button" onClick={() => onNavigate('login')} className="text-purple-600 hover:underline font-medium">تسجيل الدخول</button>
          </p>
        </form>
        <div className="text-center mt-6">
          <button onClick={() => onNavigate('home')} className="text-gray-500 hover:text-purple-600 text-sm">⬅ العودة للرئيسية</button>
        </div>
      </div>
    </div>
  );
}