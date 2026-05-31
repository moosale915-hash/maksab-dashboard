import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { APP_NAME } from '../config';

export default function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!email) {
      setError('يرجى إدخال البريد الإلكتروني');
      setLoading(false);
      return;
    }

    try {
      // رابط إعادة التعيين سيكون `https://maksabsa.com/reset-password`
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage('✅ تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد.');
      setEmail('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء إرسال رابط إعادة التعيين. تأكد من صحة البريد الإلكتروني.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-700 mb-2">🔐 {APP_NAME}</h1>
          <p className="text-gray-500">نسيت كلمة المرور؟ لا تقلق، سنساعدك على استعادتها</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-5">
          <h2 className="text-xl font-bold text-gray-800 text-center mb-2">استعادة كلمة المرور</h2>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-purple-600 hover:underline text-sm"
            >
              ⬅ تذكرت كلمة المرور؟ تسجيل الدخول
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <button onClick={() => onNavigate('home')} className="text-gray-500 hover:text-purple-600 text-sm">
            ⬅ العودة للرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}