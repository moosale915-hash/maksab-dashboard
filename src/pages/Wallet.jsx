import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Wallet() {
  const [walletData, setWalletData] = useState({
    balance: 0,
    totalEarnings: 0,
    totalWithdrawals: 0,
    pendingBalance: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // شحن الرصيد (إيداع)
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('card'); // 'card', 'tabby', 'tamara', 'bank'
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardholderName: '',
  });
  const [bankAccountDetails, setBankAccountDetails] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  });
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [depositError, setDepositError] = useState('');
  const [depositSuccess, setDepositSuccess] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!walletError && wallet) {
        setWalletData({
          balance: wallet.balance || 0,
          totalEarnings: wallet.total_earnings || 0,
          totalWithdrawals: wallet.total_withdrawals || 0,
          pendingBalance: wallet.pending_balance || 0,
        });
      }

      const { data: txns } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (txns) setTransactions(txns);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setDepositError('');
    setDepositSuccess('');
    
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setDepositError('المبلغ غير صحيح');
      return;
    }
    if (amount < 10) {
      setDepositError('الحد الأدنى للإيداع 10 ر.س');
      return;
    }

    // محاكاة معالجة الدفع (بدون بوابة حقيقية)
    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setDepositError('يجب تسجيل الدخول');
        setProcessing(false);
        return;
      }

      // تحديث الرصيد في جدول wallets
      const { data: existingWallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existingWallet) {
        await supabase
          .from('wallets')
          .update({
            balance: existingWallet.balance + amount,
            total_earnings: existingWallet.total_earnings + amount,
          })
          .eq('user_id', user.id);
      } else {
        await supabase.from('wallets').insert({
          user_id: user.id,
          balance: amount,
          total_earnings: amount,
        });
      }

      // إضافة معاملة إيداع
      let methodName = '';
      if (depositMethod === 'card') methodName = 'بطاقة ائتمان';
      else if (depositMethod === 'tabby') methodName = 'تابي (تقسيط)';
      else if (depositMethod === 'tamara') methodName = 'تمارا (قسطها على أربع دفعات)';
      else methodName = 'تحويل بنكي';

      await supabase.from('wallet_transactions').insert({
        user_id: user.id,
        type: 'deposit',
        amount: amount,
        status: 'completed',
        description: `شحن رصيد عبر ${methodName}`,
      });

      setDepositSuccess(`تم شحن ${amount} ر.س بنجاح`);
      setDepositAmount('');
      setCardDetails({ cardNumber: '', expiry: '', cvv: '', cardholderName: '' });
      setBankAccountDetails({ bankName: '', accountNumber: '', accountHolder: '' });
      setShowDepositForm(false);
      fetchWalletData();
      setTimeout(() => setDepositSuccess(''), 3000);
    } catch (err) {
      setDepositError('فشلت عملية الدفع');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6"><div className="flex justify-between"><div><p className="text-gray-600 text-sm">الرصيد المتاح</p><p className="text-3xl font-bold text-green-600">{walletData.balance.toFixed(2)}</p><p className="text-gray-500 text-xs">ر.س</p></div><div className="text-4xl">💰</div></div></div>
        <div className="bg-white rounded-lg shadow p-6"><div className="flex justify-between"><div><p className="text-gray-600 text-sm">إجمالي الأرباح</p><p className="text-3xl font-bold text-blue-600">{walletData.totalEarnings.toFixed(2)}</p><p className="text-gray-500 text-xs">ر.س</p></div><div className="text-4xl">📈</div></div></div>
        <div className="bg-white rounded-lg shadow p-6"><div className="flex justify-between"><div><p className="text-gray-600 text-sm">إجمالي السحب</p><p className="text-3xl font-bold text-orange-600">{walletData.totalWithdrawals.toFixed(2)}</p><p className="text-gray-500 text-xs">ر.س</p></div><div className="text-4xl">🏦</div></div></div>
        <div className="bg-white rounded-lg shadow p-6"><div className="flex justify-between"><div><p className="text-gray-600 text-sm">الرصيد المعلق</p><p className="text-3xl font-bold text-yellow-600">{walletData.pendingBalance.toFixed(2)}</p><p className="text-gray-500 text-xs">ر.س</p></div><div className="text-4xl">⏳</div></div></div>
      </div>

      {/* قسم شحن الرصيد (إيداع) فقط - بدون سحب */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">شحن الرصيد</h2>
        {depositError && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">{depositError}</div>}
        {depositSuccess && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4">{depositSuccess}</div>}
        
        {!showDepositForm ? (
          <button onClick={() => setShowDepositForm(true)} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700">إيداع أموال</button>
        ) : (
          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المبلغ (ر.س)</label>
              <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="أدخل المبلغ" className="w-full px-4 py-2 border rounded-lg" required min="10" step="1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">طريقة الدفع</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2"><input type="radio" value="card" checked={depositMethod === 'card'} onChange={() => setDepositMethod('card')} /> بطاقة ائتمان</label>
                <label className="flex items-center gap-2"><input type="radio" value="tabby" checked={depositMethod === 'tabby'} onChange={() => setDepositMethod('tabby')} /> تابي (تقسيط)</label>
                <label className="flex items-center gap-2"><input type="radio" value="tamara" checked={depositMethod === 'tamara'} onChange={() => setDepositMethod('tamara')} /> تمارا (قسطها على أربع دفعات)</label>
                <label className="flex items-center gap-2"><input type="radio" value="bank" checked={depositMethod === 'bank'} onChange={() => setDepositMethod('bank')} /> حساب بنكي (تحويل)</label>
              </div>
            </div>
            
            {depositMethod === 'card' && (
              <div className="space-y-3 border-t pt-4">
                <input type="text" placeholder="رقم البطاقة" value={cardDetails.cardNumber} onChange={(e) => setCardDetails({...cardDetails, cardNumber: e.target.value})} className="w-full p-2 border rounded-lg" />
                <div className="flex gap-2">
                  <input type="text" placeholder="MM/YY" value={cardDetails.expiry} onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})} className="flex-1 p-2 border rounded-lg" />
                  <input type="text" placeholder="CVV" value={cardDetails.cvv} onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})} className="flex-1 p-2 border rounded-lg" />
                </div>
                <input type="text" placeholder="اسم صاحب البطاقة" value={cardDetails.cardholderName} onChange={(e) => setCardDetails({...cardDetails, cardholderName: e.target.value})} className="w-full p-2 border rounded-lg" />
              </div>
            )}
            
            {depositMethod === 'bank' && (
              <div className="space-y-3 border-t pt-4">
                <input type="text" placeholder="اسم البنك" value={bankAccountDetails.bankName} onChange={(e) => setBankAccountDetails({...bankAccountDetails, bankName: e.target.value})} className="w-full p-2 border rounded-lg" />
                <input type="text" placeholder="رقم الحساب" value={bankAccountDetails.accountNumber} onChange={(e) => setBankAccountDetails({...bankAccountDetails, accountNumber: e.target.value})} className="w-full p-2 border rounded-lg" />
                <input type="text" placeholder="اسم صاحب الحساب" value={bankAccountDetails.accountHolder} onChange={(e) => setBankAccountDetails({...bankAccountDetails, accountHolder: e.target.value})} className="w-full p-2 border rounded-lg" />
              </div>
            )}

            {(depositMethod === 'tabby' || depositMethod === 'tamara') && (
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700">
                سيتم توجيهك إلى بوابة {depositMethod === 'tabby' ? 'تابي' : 'تمارا'} لإتمام الدفع (محاكاة).
              </div>
            )}

            <div className="flex gap-3">
              <button type="submit" disabled={processing} className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
                {processing ? 'جاري المعالجة...' : 'تأكيد الدفع'}
              </button>
              <button type="button" onClick={() => setShowDepositForm(false)} className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg">إلغاء</button>
            </div>
          </form>
        )}
      </div>

      {/* سجل المعاملات */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b"><h2 className="text-xl font-bold">سجل المعاملات</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-right">النوع</th><th className="px-6 py-3 text-right">المبلغ</th><th className="px-6 py-3 text-right">الحالة</th><th className="px-6 py-3 text-right">التاريخ</th></tr></thead>
            <tbody>
              {transactions.map(txn => (
                <tr key={txn.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{txn.type === 'deposit' ? '💳 إيداع' : txn.type === 'withdrawal' ? '🏦 سحب' : '💰 ربح'}</td>
                  <td className="px-6 py-4 font-medium">{txn.amount.toFixed(2)} ر.س</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs ${txn.status === 'completed' ? 'bg-green-100 text-green-800' : txn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{txn.status === 'completed' ? 'مكتمل' : txn.status === 'pending' ? 'معلق' : 'ملغي'}</span></td>
                  <td className="px-6 py-4 text-gray-600">{new Date(txn.created_at).toLocaleDateString('ar-SA')}</td>
                </tr>
              ))}
              {transactions.length === 0 && <tr><td colSpan="4" className="text-center py-8 text-gray-500">لا توجد معاملات</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}