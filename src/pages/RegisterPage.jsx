import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { APP_NAME } from '../config';

export default function RegisterPage({ onNavigate, onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidPhone = (phone) => /^[0-9]{10,15}$/.test(phone);

  // التحقق من الجلسة عند تحميل الصفحة (بعد العودة من Google)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .maybeSingle();
        onLogin(profile?.is_admin || false);
      }
    };
    checkSession();
  }, [onLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !email || !phone || !password) {
      setError('جميع الحقول مطلوبة');
      setLoading(false);
      return;
    }
    if (!isValidPhone(phone)) {
      setError('رقم الجوال غير صحيح');
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: name,
        phone: phone,
        is_admin: false,
      });
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
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
      onLogin(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setError(err.message || 'فشل الاتصال بـ Google');
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
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الجوال <span className="text-red-500">*</span></label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xxxxxxxx" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:outline-none" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50">
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب والدخول'}
          </button>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-400">أو</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <button type="button" onClick={handleGoogleRegister} className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            التسجيل عبر Google
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