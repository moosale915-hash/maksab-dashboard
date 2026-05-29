import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function SubscriptionManagement({ onNavigate, isLoggedIn = false }) {
  const [plans, setPlans] = useState([]);
  const [userSubscription, setUserSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        // جلب الخطط (بدون الخطة المجانية)
        const { data: plansData, error: plansErr } = await supabase
          .from('plans')
          .select('*')
          .neq('id', 'free')
          .order('price_monthly', { ascending: true });
        if (plansErr) throw plansErr;
        setPlans(plansData || []);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: subData, error: subErr } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);
          if (!subErr && subData && subData.length > 0) {
            setUserSubscription(subData[0]);
          } else {
            setUserSubscription({ plan_id: 'free', plan_name: 'مجاني' });
          }
        }
      } catch (err) {
        console.error(err);
        setError('حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleChoosePlan = (plan, billingCycle) => {
    const amount = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
    onNavigate('payment', {
      planId: plan.id,
      planName: plan.name,
      amount: amount,
      billingCycle: billingCycle,
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">يرجى تسجيل الدخول أولاً</h2>
        <button onClick={() => onNavigate('login')} className="bg-purple-600 text-white px-6 py-2 rounded-lg">تسجيل الدخول</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">خطط الاشتراك</h1>
          <p className="text-xl text-gray-600">اختر الخطة المناسبة لمتجرك</p>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-8 text-center">{error}</div>}

        {userSubscription && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-12 text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">اشتراكك الحالي</h3>
            <p className="text-blue-700">
              أنت مشترك في خطة <span className="font-bold">{userSubscription.plan_name}</span>
              {userSubscription.expires_at && <span> - ينتهي في {new Date(userSubscription.expires_at).toLocaleDateString('ar-SA')}</span>}
            </p>
            {userSubscription.plan_id === 'free' && (
              <div className="mt-4 text-sm text-blue-700">اختر إحدى الخطط المدفوعة أدناه للترقية.</div>
            )}
          </div>
        )}

        {plans.length === 0 && !error && (
          <div className="text-center text-gray-500">لا توجد خطط متاحة حالياً.</div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.id} className={`relative bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${plan.popular ? 'md:scale-105 ring-2 ring-purple-500' : ''}`}>
              {plan.popular && <div className="absolute top-0 right-0 bg-purple-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">الأكثر شهرة</div>}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-500 text-sm mb-6">{plan.description}</p>
                <div className="mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {plan.price_monthly}
                    <span className="text-lg text-gray-600 font-normal"> ر.س</span>
                  </div>
                  <p className="text-gray-600 text-sm">شهري</p>
                  <p className="text-gray-500 text-xs mt-2">أو {plan.price_yearly} ر.س سنوياً</p>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => handleChoosePlan(plan, 'monthly')}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${plan.popular ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                  >
                    اشتراك شهري
                  </button>
                  <button
                    onClick={() => handleChoosePlan(plan, 'yearly')}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-50 text-gray-900 hover:bg-gray-100'}`}
                  >
                    اشتراك سنوي
                  </button>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <ul className="space-y-3">
                    {(plan.features || []).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}