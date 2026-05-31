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
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // الاستماع لأحداث التغيير في الجلسة (مثل استلام التوكن من الرابط)
    const { data: subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, session);
      if (event === 'PASSWORD_RECOVERY') {
        // حدث خاص بإعادة تعيين كلمة المرور
        setIsValidToken(true);
        setIsChecking(false);
      } else if (session) {
        // إذا كان هناك جلسة عادية (مستخدم مسجل)
        setIsValidToken(true);
        setIsChecking(false);
      } else {
        setIsValidToken(false);
        setIsChecking(false);
        setError('رابط إعادة التعيين غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.');
      }
    });

    // أيضاً تحقق من الجلسة الحالية فوراً
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValidToken(true);
        setIsChecking(false);
      } else if (!session && !isValidToken) {
        // إذا لم نستقبل حدث PASSWORD_RECOVERY بعد، ننتظر قليلاً
        setTimeout(() => {
          if (!isValidToken) {
            setError('لم يتم العثور على جلسة صالحة. تأكد من استخدام الرابط الصحيح.');
            setIsChecking(false);
          }
        }, 1000);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
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

      setMessage('✅ تم تغيير كلمة المرور بنجاح. سيتم توجيهك إلى لوحة التحكم...');
      
      // الانتظار قليلاً ثم توجيه المستخدم إلى لوحة التحكم
      setTimeout(() => {
        // نستخدم onLogin لتحديث حالة التطبيق ومن ثم التوجيه تلقائياً
        onLogin(false); // المستخدم ليس أدمن بشكل افتراضي
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء تغيير كلمة المرور. يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white px-4">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-red-600 mb-4">رابط غير صالح</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => onNavigate('forgot-password')}
              className="bg-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-purple-700"
            >
              طلب رابط جديد
            </button>
          </div>
        </div>
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