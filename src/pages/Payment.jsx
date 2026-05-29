import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Payment({ onNavigate, planId, planName, amount, billingCycle = 'monthly', onPaymentSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardholderName: '',
  });
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (paymentMethod === 'card') {
      setCardDetails(prev => ({ ...prev, [name]: value }));
    } else if (paymentMethod === 'bank') {
      setBankDetails(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (paymentMethod === 'card') {
      if (!cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvv) {
        setError('يرجى إكمال بيانات البطاقة');
        setLoading(false);
        return;
      }
    } else if (paymentMethod === 'bank') {
      if (!bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.accountHolder) {
        setError('يرجى إكمال بيانات الحساب البنكي');
        setLoading(false);
        return;
      }
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        onNavigate('login');
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      await supabase.from('wallet_transactions').insert({
        user_id: user.id,
        type: 'payment',
        amount: amount,
        status: 'completed',
        description: `دفع لـ ${planName} (${billingCycle === 'yearly' ? 'سنوي' : 'شهري'})`,
      });

      const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', user.id).single();
      if (wallet) {
        await supabase.from('wallets').update({
          balance: (wallet.balance || 0) + amount,
          total_earnings: (wallet.total_earnings || 0) + amount,
        }).eq('user_id', user.id);
      } else {
        await supabase.from('wallets').insert({ user_id: user.id, balance: amount, total_earnings: amount });
      }

      const expiresAt = new Date();
      if (billingCycle === 'yearly') expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      else expiresAt.setMonth(expiresAt.getMonth() + 1);

      await supabase.from('user_subscriptions').insert({
        user_id: user.id,
        plan_id: planId,
        plan_name: planName,
        price: amount,
        billing_cycle: billingCycle,
        status: 'active',
        started_at: new Date(),
        expires_at: expiresAt,
      });

      if (onPaymentSuccess) await onPaymentSuccess();

      alert('تم الدفع بنجاح! تم تفعيل اشتراكك.');
      onNavigate('subscription');
    } catch (err) {
      console.error(err);
      setError('حدث خطأ في معالجة الدفع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      {/* خلفية شفافة مع لوجو المنصة (صورة حقيقية) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
        <div className="relative w-full h-full">
          <div 
            className="absolute inset-0 bg-repeat bg-center"
            style={{
              backgroundImage: `url('/images/logo.png')`,
              backgroundSize: '120px',
              backgroundRepeat: 'repeat',
              opacity: 0.9,
              transform: 'rotate(-10deg) scale(2)',
            }}
          ></div>
          {/* لوجو كبير في المنتصف */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <img 
              src="/images/logo.png" 
              alt="مكسب" 
              className="w-64 h-auto opacity-70 blur-sm"
            />
          </div>
        </div>
      </div>

      {/* دوائر ضبابية للزخرفة */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <div className="relative z-10 max-w-md mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-purple-100">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-purple-600 to-indigo-600">الدفع الآمن</h1>
            <p className="text-gray-600 mt-1">أكمل عملية الدفع لـ {planName}</p>
          </div>

          {error && <div className="bg-red-50 border-r-4 border-red-500 text-red-700 p-3 rounded-lg mb-6">{error}</div>}

          <form onSubmit={handlePayment} className="space-y-5">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 text-center border border-purple-100">
              <span className="text-gray-600">المبلغ المطلوب:</span>
              <span className="text-3xl font-bold text-purple-700 mr-2">{amount} ر.س</span>
              <span className="text-sm text-gray-500 block">({billingCycle === 'yearly' ? 'اشتراك سنوي' : 'اشتراك شهري'})</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">طريقة الدفع</label>
              <div className="flex flex-wrap gap-3">
                {/* بطاقة ائتمان */}
                <label className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${paymentMethod === 'card' ? 'bg-purple-100 text-purple-700 border-purple-300 shadow-sm' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}`}>
                  <input type="radio" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="hidden" />
                  <span>💳 بطاقة ائتمان</span>
                </label>

                {/* تابي - شعار حقيقي */}
                <label className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${paymentMethod === 'tabby' ? 'bg-purple-100 text-purple-700 border-purple-300 shadow-sm' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}`}>
                  <input type="radio" value="tabby" checked={paymentMethod === 'tabby'} onChange={() => setPaymentMethod('tabby')} className="hidden" />
                  <img src="/images/tabby-logo.png" alt="تابي" className="h-5 w-auto" />
                  <span>تابي (تقسيط)</span>
                </label>

                {/* تمارا - شعار حقيقي */}
                <label className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${paymentMethod === 'tamara' ? 'bg-purple-100 text-purple-700 border-purple-300 shadow-sm' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}`}>
                  <input type="radio" value="tamara" checked={paymentMethod === 'tamara'} onChange={() => setPaymentMethod('tamara')} className="hidden" />
                  <img src="/images/tamara-logo.jpg" alt="تمارا" className="h-5 w-auto" />
                  <span>تمارا (4 دفعات)</span>
                </label>

                {/* تحويل بنكي - أيقونة */}
                <label className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${paymentMethod === 'bank' ? 'bg-purple-100 text-purple-700 border-purple-300 shadow-sm' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}`}>
                  <input type="radio" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} className="hidden" />
                  <img src="/images/bank-transfer-icon.png" alt="تحويل بنكي" className="h-5 w-auto" />
                  <span>تحويل بنكي</span>
                </label>
              </div>
            </div>

            {paymentMethod === 'card' && (
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <input type="text" name="cardholderName" placeholder="اسم صاحب البطاقة" value={cardDetails.cardholderName} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" required />
                <input type="text" name="cardNumber" placeholder="رقم البطاقة" value={cardDetails.cardNumber} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl" required />
                <div className="flex gap-3">
                  <input type="text" name="expiry" placeholder="MM/YY" value={cardDetails.expiry} onChange={handleInputChange} className="flex-1 p-3 border border-gray-200 rounded-xl" required />
                  <input type="text" name="cvv" placeholder="CVV" value={cardDetails.cvv} onChange={handleInputChange} className="flex-1 p-3 border border-gray-200 rounded-xl" required />
                </div>
              </div>
            )}

            {paymentMethod === 'bank' && (
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <input type="text" name="bankName" placeholder="اسم البنك" value={bankDetails.bankName} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl" required />
                <input type="text" name="accountNumber" placeholder="رقم الحساب" value={bankDetails.accountNumber} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl" required />
                <input type="text" name="accountHolder" placeholder="اسم صاحب الحساب" value={bankDetails.accountHolder} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl" required />
              </div>
            )}

            {(paymentMethod === 'tabby' || paymentMethod === 'tamara') && (
              <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-xl text-sm text-blue-800 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                سيتم توجيهك إلى بوابة {paymentMethod === 'tabby' ? 'تابي' : 'تمارا'} لإتمام الدفع (محاكاة).
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? 'جاري المعالجة...' : `ادفع ${amount} ر.س`}
            </button>
            <button type="button" onClick={() => onNavigate('subscription')} className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all">إلغاء</button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <span>بياناتك مشفرة بـ SSL 256-bit</span>
          </div>
        </div>
      </div>
    </div>
  );
}