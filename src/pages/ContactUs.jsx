import { useState } from 'react';
import PublicFooter from '../components/PublicFooter';

export default function ContactUs({ onNavigate }) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('شكراً لتواصلك معنا! سنرد عليك قريباً.');
    setName('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-purple-50 to-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">اتصل بنا</h1>
          <p className="text-xl text-gray-600">نحن هنا لخدمتك. تواصل معنا وسنرد في أسرع وقت.</p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-xl mx-auto px-6">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300" placeholder="اسمك الكريم" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الرسالة</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows="4" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300" placeholder="اكتب رسالتك هنا..." required ></textarea>
            </div>
            <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700">أرسل</button>
          </form>
        </div>
      </section>

      <PublicFooter onNavigate={onNavigate} />
    </div>
  );
}