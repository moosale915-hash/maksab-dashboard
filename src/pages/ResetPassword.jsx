import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { APP_NAME } from '../config';

export default function ResetPassword({ onNavigate, onLogin }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // الاستماع لأحداث المصادقة
    const { data: subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (session && session.user)) {
        setIsValid(true);
        setChecking(false);
      } else {
        // انتظر قليلاً ثم إذا لم توجد جلسة أظهر خطأ
        setTimeout(() => {
          if (!isValid) {
            setError('رابط إعادة التعيين غير صالح أو منتهي. يرجى طلب رابط جديد.');
            setChecking(false);
          }
        }, 1000);
      }
    });

    // تحقق أولي
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValid(true);
        setChecking(false);
      } else {
        // ربما الرابط لم يُعالج بعد
      }
    });

    return () => subscription?.unsubscribe();
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
      setTimeout(() => {
        onLogin(false); // نفترض أن المستخدم ليس أدمن
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء تغيير كلمة المرور');
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">رابط غير صالح</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={() => onNavigate('forgot-password')} className="bg-purple-600 text-white px-6 py-2 rounded-xl">طلب رابط جديد</button>
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

          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center">{error}</div>}
          {message && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg text-center">{message}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الجديدة</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 border border-gray-200 rounded-xl" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور الجديدة</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 border border-gray-200 rounded-xl" required />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700">
            {loading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
          </button>

          <div className="text-center">
            <button type="button" onClick={() => onNavigate('login')} className="text-purple-600 hover:underline text-sm">⬅ العودة إلى تسجيل الدخول</button>
          </div>
        </form>
      </div>
    </div>
  );
}