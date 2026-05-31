import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { APP_NAME } from '../config';

export default function ResetPassword({ onNavigate, onLogin }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);

  // التحقق من وجود جلسة (token) صالحة من الرابط
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // يوجد جلسة نشطة (بعد النقر على الرابط)
        setIsValidToken(true);
      } else {
        // لا توجد جلسة، ربما وصل المستخدم إلى هذه الصفحة بطريقة خاطئة
        setIsValidToken(false);
        setError('رابط إعادة التعيين غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.');
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!newPassword || !confirmPassword) {
      setError('يرجى إدخال كلمة المرور الجديدة وتأكيدها');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمة المرور الجديدة وتأكيدها غير متطابقين');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setMessage('✅ تم تغيير كلمة المرور بنجاح. جاري توجيهك إلى لوحة التحكم...');
      
      // بعد تغيير كلمة المرور، نجلب معلومات المستخدم ونسجل دخوله تلقائياً
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .maybeSingle();
        onLogin(profile?.is_admin || false);
      } else {
        // إذا لم يتم التعرف على المستخدم، نوجه إلى صفحة تسجيل الدخول
        setTimeout(() => onNavigate('login'), 2000);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء تغيير كلمة المرور. يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  if (!isValidToken && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white px-4">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-700 mb-2">🔐 {APP_NAME}</h1>
          <p className="text-gray-500">أدخل كلمة المرور الجديدة</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-5">
          <h2 className="text-xl font-bold text-gray-800 text-center mb-2">تعيين كلمة مرور جديدة</h2>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg text-center">
              {message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الجديدة</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور الجديدة</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-purple-600 hover:underline text-sm"
            >
              ⬅ العودة إلى تسجيل الدخول
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}