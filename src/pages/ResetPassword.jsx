import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { APP_NAME } from '../config';

export default function ResetPassword({ onNavigate, onLogin }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

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

      setMessage('✅ تم تغيير كلمة المرور بنجاح. جاري توجيهك...');
      setTimeout(() => onLogin(false), 2000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'حدث خطأ');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-700 mb-2">🔐 {APP_NAME}</h1>
          <p className="text-gray-500">أدخل كلمة المرور الجديدة</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl space-y-5">
          <h2 className="text-xl font-bold text-center mb-2">تعيين كلمة مرور جديدة</h2>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-center">{error}</div>}
          {message && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-center">{message}</div>}
          <div>
            <label className="block text-sm font-medium mb-1">كلمة المرور الجديدة</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 border rounded-xl" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">تأكيد كلمة المرور</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 border rounded-xl" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold">
            {loading ? 'جاري...' : 'تغيير كلمة المرور'}
          </button>
          <div className="text-center">
            <button type="button" onClick={() => onNavigate('login')} className="text-purple-600 text-sm">⬅ العودة لتسجيل الدخول</button>
          </div>
        </form>
      </div>
    </div>
  );
}