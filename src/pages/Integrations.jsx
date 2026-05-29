import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Integrations({ onNavigate }) {
  const [integrations, setIntegrations] = useState({
    salla: { connected: false, apiKey: '', storeName: '' },
    zid: { connected: false, apiKey: '', storeName: '' },
    shopify: { connected: false, apiKey: '', storeName: '' },
    wordpress: { connected: false, apiKey: '', storeName: '' }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchIntegrations() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('integrations')
        .select('platform, api_key, store_name, is_connected')
        .eq('user_id', user.id);
      if (error) {
        console.error('خطأ في جلب التكاملات:', error);
        return;
      }
      if (data) {
        const newIntegrations = { ...integrations };
        data.forEach(item => {
          if (item.platform === 'salla') newIntegrations.salla = { connected: item.is_connected, apiKey: item.api_key || '', storeName: item.store_name || '' };
          else if (item.platform === 'zid') newIntegrations.zid = { connected: item.is_connected, apiKey: item.api_key || '', storeName: item.store_name || '' };
          else if (item.platform === 'shopify') newIntegrations.shopify = { connected: item.is_connected, apiKey: item.api_key || '', storeName: item.store_name || '' };
          else if (item.platform === 'wordpress') newIntegrations.wordpress = { connected: item.is_connected, apiKey: item.api_key || '', storeName: item.store_name || '' };
        });
        setIntegrations(newIntegrations);
      }
    }
    fetchIntegrations();
  }, []);

  const handleIntegrationChange = (platform, field, value) => {
    setIntegrations(prev => ({ ...prev, [platform]: { ...prev[platform], [field]: value } }));
  };

  const handleConnect = async (platform) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        onNavigate('login');
        return;
      }
      const integration = integrations[platform];
      const apiKey = integration.apiKey?.trim();
      if (!apiKey) {
        setError(`يرجى إدخال مفتاح API لمنصة ${platform}`);
        setLoading(false);
        return;
      }
      const { error: upsertError } = await supabase
        .from('integrations')
        .upsert({
          user_id: user.id,
          platform: platform,
          api_key: apiKey,
          store_name: integration.storeName || null,
          is_connected: true,
          updated_at: new Date()
        }, { onConflict: 'user_id,platform' });
      if (upsertError) throw upsertError;
      setIntegrations(prev => ({ ...prev, [platform]: { ...prev[platform], connected: true } }));
      setSuccess(`تم الاتصال بـ ${platform} بنجاح!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('فشل الاتصال. يرجى التحقق من بيانات API');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (platform) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('integrations').delete().eq('user_id', user.id).eq('platform', platform);
      setIntegrations(prev => ({ ...prev, [platform]: { ...prev[platform], connected: false, apiKey: '', storeName: '' } }));
      setSuccess(`تم قطع الاتصال عن ${platform}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('فشل قطع الاتصال');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">التكاملات</h1>
          <p className="text-xl text-gray-600">ربط متجرك مع المنصات الأخرى</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">{success}</div>}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Salla */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div><h3 className="text-2xl font-bold text-gray-900">سلة</h3><p className="text-gray-600 text-sm mt-1">منصة تجارة إلكترونية</p></div>
              <div className="w-12 h-12"><img src="/images/salla-logo.png" alt="سلة" className="w-full h-full object-contain" /></div>
            </div>
            {integrations.salla.connected ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3"><p className="text-green-700 font-semibold">✅ متصل</p><p className="text-green-600 text-sm mt-1">المتجر: {integrations.salla.storeName}</p></div>
                <button onClick={() => handleDisconnect('salla')} className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">قطع الاتصال</button>
              </div>
            ) : (
              <div className="space-y-4">
                <input type="text" placeholder="اسم المتجر" value={integrations.salla.storeName} onChange={(e) => handleIntegrationChange('salla', 'storeName', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                <input type="password" placeholder="مفتاح API" value={integrations.salla.apiKey} onChange={(e) => handleIntegrationChange('salla', 'apiKey', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                <button onClick={() => handleConnect('salla')} disabled={loading || !integrations.salla.apiKey} className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400">ربط الآن</button>
              </div>
            )}
          </div>
          {/* Zid */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div><h3 className="text-2xl font-bold text-gray-900">زد</h3><p className="text-gray-600 text-sm mt-1">منصة تجارة إلكترونية</p></div>
              <div className="w-12 h-12"><img src="/images/zid-logo.png" alt="زد" className="w-full h-full object-contain" /></div>
            </div>
            {integrations.zid.connected ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3"><p className="text-green-700 font-semibold">✅ متصل</p><p className="text-green-600 text-sm mt-1">المتجر: {integrations.zid.storeName}</p></div>
                <button onClick={() => handleDisconnect('zid')} className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">قطع الاتصال</button>
              </div>
            ) : (
              <div className="space-y-4">
                <input type="text" placeholder="اسم المتجر" value={integrations.zid.storeName} onChange={(e) => handleIntegrationChange('zid', 'storeName', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                <input type="password" placeholder="مفتاح API" value={integrations.zid.apiKey} onChange={(e) => handleIntegrationChange('zid', 'apiKey', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                <button onClick={() => handleConnect('zid')} disabled={loading || !integrations.zid.apiKey} className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400">ربط الآن</button>
              </div>
            )}
          </div>
          {/* Shopify */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div><h3 className="text-2xl font-bold text-gray-900">Shopify</h3><p className="text-gray-600 text-sm mt-1">منصة تجارة إلكترونية عالمية</p></div>
              <div className="w-12 h-12"><img src="/images/shopify-logo.png" alt="Shopify" className="w-full h-full object-contain" /></div>
            </div>
            {integrations.shopify.connected ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3"><p className="text-green-700 font-semibold">✅ متصل</p><p className="text-green-600 text-sm mt-1">المتجر: {integrations.shopify.storeName}</p></div>
                <button onClick={() => handleDisconnect('shopify')} className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">قطع الاتصال</button>
              </div>
            ) : (
              <div className="space-y-4">
                <input type="text" placeholder="اسم المتجر" value={integrations.shopify.storeName} onChange={(e) => handleIntegrationChange('shopify', 'storeName', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                <input type="password" placeholder="مفتاح API" value={integrations.shopify.apiKey} onChange={(e) => handleIntegrationChange('shopify', 'apiKey', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                <button onClick={() => handleConnect('shopify')} disabled={loading || !integrations.shopify.apiKey} className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400">ربط الآن</button>
              </div>
            )}
          </div>
          {/* WordPress */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div><h3 className="text-2xl font-bold text-gray-900">ووردبريس</h3><p className="text-gray-600 text-sm mt-1">WooCommerce</p></div>
              <div className="w-12 h-12"><img src="/images/wordpress-logo.png" alt="ووردبريس" className="w-full h-full object-contain" /></div>
            </div>
            {integrations.wordpress.connected ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3"><p className="text-green-700 font-semibold">✅ متصل</p><p className="text-green-600 text-sm mt-1">الموقع: {integrations.wordpress.storeName}</p></div>
                <button onClick={() => handleDisconnect('wordpress')} className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">قطع الاتصال</button>
              </div>
            ) : (
              <div className="space-y-4">
                <input type="text" placeholder="رابط الموقع" value={integrations.wordpress.storeName} onChange={(e) => handleIntegrationChange('wordpress', 'storeName', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                <input type="password" placeholder="Consumer Key" value={integrations.wordpress.apiKey} onChange={(e) => handleIntegrationChange('wordpress', 'apiKey', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                <button onClick={() => handleConnect('wordpress')} disabled={loading || !integrations.wordpress.apiKey} className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400">ربط الآن</button>
              </div>
            )}
          </div>
        </div>
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h3 className="text-xl font-bold text-blue-900 mb-4">📚 كيفية الحصول على مفاتيح API</h3>
          <div className="space-y-4 text-blue-800">
            <div><p className="font-semibold">سلة (Salla):</p><p className="text-sm">لوحة تحكم سلة → الإعدادات → API</p></div>
            <div><p className="font-semibold">زد (Zid):</p><p className="text-sm">لوحة تحكم زد → الإعدادات → التطبيقات</p></div>
            <div><p className="font-semibold">Shopify:</p><p className="text-sm">إعدادات المتجر → التطبيقات وإدارة المفاتيح</p></div>
            <div><p className="font-semibold">ووردبريس (WooCommerce):</p><p className="text-sm">WooCommerce → الإعدادات → متقدم → REST API</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}