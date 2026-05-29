import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'technical',
    description: '',
    priority: 'medium',
  });
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, open, in_progress, closed

  const categories = [
    { id: 'technical', name: 'مشكلة تقنية' },
    { id: 'billing', name: 'الفواتير والدفع' },
    { id: 'shipping', name: 'الشحن والتوصيل' },
    { id: 'product', name: 'المنتجات' },
    { id: 'integration', name: 'التكامل مع المتاجر' },
    { id: 'other', name: 'أخرى' },
  ];

  const priorities = [
    { id: 'low', name: 'منخفضة', color: 'blue' },
    { id: 'medium', name: 'متوسطة', color: 'yellow' },
    { id: 'high', name: 'عالية', color: 'orange' },
    { id: 'urgent', name: 'عاجلة', color: 'red' },
  ];

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setTickets(data || []);
    } catch (err) {
      console.error('خطأ في جلب التذاكر:', err);
      setError('فشل تحميل التذاكر');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (ticketId) => {
    try {
      const { data: ticket, error: ticketErr } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single();
      if (ticketErr) throw ticketErr;
      setSelectedTicket(ticket);

      // جلب الردود
      const { data: repliesData, error: repliesErr } = await supabase
        .from('ticket_replies')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      if (!repliesErr) setReplies(repliesData || []);
    } catch (err) {
      console.error('خطأ في جلب تفاصيل التذكرة:', err);
      setError('فشل تحميل التفاصيل');
    }
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('يجب تسجيل الدخول أولاً');
        return;
      }

      const { data, error: insertError } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject: formData.subject,
          category: formData.category,
          description: formData.description,
          priority: formData.priority,
          status: 'open',
        })
        .select();

      if (insertError) throw insertError;

      setSuccess('تم إنشاء التذكرة بنجاح');
      setFormData({ subject: '', category: 'technical', description: '', priority: 'medium' });
      setShowForm(false);
      fetchTickets();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('فشل في إنشاء التذكرة');
    }
  };

  const handleAddReply = async () => {
    if (!replyText.trim()) return;
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: replyError } = await supabase
        .from('ticket_replies')
        .insert({
          ticket_id: selectedTicket.id,
          user_id: user.id,
          message: replyText,
          is_admin: false,
        });

      if (replyError) throw replyError;

      setReplyText('');
      // إعادة تحميل التفاصيل
      await fetchTicketDetails(selectedTicket.id);
      // تحديث قائمة التذاكر (لأن آخر رد قد يغير حالة التذكرة)
      fetchTickets();
    } catch (err) {
      console.error(err);
      setError('فشل في إضافة الرد');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">مفتوحة</span>;
      case 'in_progress': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">قيد المعالجة</span>;
      case 'closed': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">مغلقة</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-semibold">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    const p = priorities.find(p => p.id === priority);
    const color = p?.color || 'gray';
    const bgColor = {
      blue: 'bg-blue-100 text-blue-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800',
    }[color];
    return <span className={`${bgColor} px-2 py-1 rounded text-xs font-semibold`}>{p?.name || priority}</span>;
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* رسائل النجاح والخطأ */}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{success}</div>}

      {/* رأس القسم */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">تذاكر الدعم الفني</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
        >
          {showForm ? 'إلغاء' : '➕ تذكرة جديدة'}
        </button>
      </div>

      {/* فلتر الحالة */}
      <div className="flex gap-2">
        <button onClick={() => setStatusFilter('all')} className={`px-3 py-1 rounded-full text-sm ${statusFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}>الكل</button>
        <button onClick={() => setStatusFilter('open')} className={`px-3 py-1 rounded-full text-sm ${statusFilter === 'open' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}>مفتوحة</button>
        <button onClick={() => setStatusFilter('in_progress')} className={`px-3 py-1 rounded-full text-sm ${statusFilter === 'in_progress' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}>قيد المعالجة</button>
        <button onClick={() => setStatusFilter('closed')} className={`px-3 py-1 rounded-full text-sm ${statusFilter === 'closed' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}>مغلقة</button>
      </div>

      {/* نموذج إنشاء تذكرة جديدة */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">إنشاء تذكرة دعم جديدة</h2>
          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الموضوع</label>
              <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-purple-500" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الفئة</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الأولوية</label>
                <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                  {priorities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="5" className="w-full px-4 py-2 border rounded-lg" required />
            </div>
            <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700">إرسال التذكرة</button>
          </form>
        </div>
      )}

      {/* قائمة التذاكر والتفاصيل */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* قائمة التذاكر */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b bg-gray-50"><h2 className="font-bold">التذاكر ({tickets.length})</h2></div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {tickets.length > 0 ? (
              tickets.map(ticket => (
                <button key={ticket.id} onClick={() => fetchTicketDetails(ticket.id)} className={`w-full text-right p-4 hover:bg-gray-50 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-purple-50 border-r-4 border-purple-600' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1"><p className="font-semibold truncate">{ticket.subject}</p><p className="text-xs text-gray-500 mt-1">#{ticket.id.slice(0,8)}</p></div>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-400">
                    <span>{categories.find(c => c.id === ticket.category)?.name}</span>
                    <span>{new Date(ticket.created_at).toLocaleDateString('ar-SA')}</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">لا توجد تذاكر</div>
            )}
          </div>
        </div>

        {/* تفاصيل التذكرة */}
        {selectedTicket && (
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="mb-4 pb-4 border-b">
              <h2 className="text-xl font-bold mb-2">{selectedTicket.subject}</h2>
              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                <span>#{selectedTicket.id.slice(0,8)}</span>
                <span>الفئة: {categories.find(c => c.id === selectedTicket.category)?.name}</span>
                {getPriorityBadge(selectedTicket.priority)}
                {getStatusBadge(selectedTicket.status)}
              </div>
            </div>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="whitespace-pre-wrap">{selectedTicket.description}</p>
              <p className="text-xs text-gray-500 mt-4">{new Date(selectedTicket.created_at).toLocaleString('ar-SA')}</p>
            </div>

            {/* الردود */}
            {replies.length > 0 && (
              <div className="mb-6 space-y-3">
                <h3 className="font-bold text-gray-700">الردود</h3>
                {replies.map(reply => (
                  <div key={reply.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{reply.is_admin ? 'الدعم الفني' : 'أنت'}</span>
                      <span>{new Date(reply.created_at).toLocaleString('ar-SA')}</span>
                    </div>
                    <p className="text-sm">{reply.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* نموذج الرد */}
            {selectedTicket.status !== 'closed' && (
              <div className="space-y-4">
                <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="اكتب ردك هنا..." rows="3" className="w-full px-4 py-2 border rounded-lg focus:ring-purple-500" />
                <button onClick={handleAddReply} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700">إرسال الرد</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}