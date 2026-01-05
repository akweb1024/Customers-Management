'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function HolidayCalendarPage() {
    const [holidays, setHolidays] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', date: '', type: 'PUBLIC', description: '' });

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) setUserRole(JSON.parse(user).role);
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/hr/holidays', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setHolidays(await res.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/hr/holidays', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                fetchHolidays();
                setShowModal(false);
                setForm({ name: '', date: '', type: 'PUBLIC', description: '' });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(userRole);

    return (
        <DashboardLayout userRole={userRole}>
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-secondary-900 tracking-tighter">Corporate Holiday Almanac</h1>
                        <p className="text-secondary-500 font-medium italic">Official schedule of non-operational periods and company observances.</p>
                    </div>
                    {isAdmin && (
                        <button onClick={() => setShowModal(true)} className="btn btn-primary px-8 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-200">
                            + Proclaim Holiday
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-20 text-center">Consulting the calendar...</div>
                    ) : holidays.length === 0 ? (
                        <div className="col-span-full py-20 card-premium text-center border-dashed">
                            <div className="text-4xl mb-4">📅</div>
                            <p className="font-bold text-secondary-400">No upcoming holidays scheduled.</p>
                        </div>
                    ) : (
                        holidays.map((h, i) => (
                            <div key={h.id} className="card-premium group hover:border-primary-500 transition-all border-l-4" style={{ borderColor: h.type === 'PUBLIC' ? '#2563eb' : h.type === 'OPTIONAL' ? '#7c3aed' : '#db2777' }}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-secondary-50 rounded-2xl flex flex-col items-center min-w-[60px] group-hover:bg-primary-50 transition-colors">
                                        <span className="text-[10px] font-black uppercase text-secondary-400 group-hover:text-primary-600">{new Date(h.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                        <span className="text-2xl font-black text-secondary-900">{new Date(h.date).getDate()}</span>
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${h.type === 'PUBLIC' ? 'bg-blue-50 text-blue-600' :
                                            h.type === 'OPTIONAL' ? 'bg-purple-50 text-purple-600' : 'bg-pink-50 text-pink-600'
                                        }`}>
                                        {h.type}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-secondary-900 mb-2 truncate group-hover:text-primary-600 transition-colors">{h.name}</h3>
                                <p className="text-xs text-secondary-500 line-clamp-2 leading-relaxed">{h.description || 'No description provided.'}</p>
                                <div className="mt-6 pt-6 border-t border-secondary-50 flex justify-between items-center text-[10px] font-bold text-secondary-400 uppercase tracking-widest">
                                    <span>{new Date(h.date).toLocaleDateString(undefined, { weekday: 'long' })}</span>
                                    <span>Added {new Date(h.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {showModal && (
                    <div className="fixed inset-0 bg-secondary-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                            <div className="p-8 bg-secondary-900 text-white">
                                <h2 className="text-2xl font-black tracking-tighter uppercase">New Holiday Event</h2>
                                <p className="text-white/60 text-xs font-medium mt-1 uppercase tracking-widest">Update company-wide schedule</p>
                            </div>
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Event Name</label>
                                    <input
                                        required
                                        className="input w-full font-bold text-secondary-900"
                                        placeholder="e.g. Independence Day"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Effective Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="input w-full font-bold"
                                            value={form.date}
                                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Event Type</label>
                                        <select
                                            className="input w-full font-bold"
                                            value={form.type}
                                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                                        >
                                            <option value="PUBLIC">Public Holiday</option>
                                            <option value="OPTIONAL">Optional</option>
                                            <option value="COMPANY_SPECIFIC">Company Event</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Brief Memorandum</label>
                                    <textarea
                                        className="input w-full font-medium h-24"
                                        placeholder="Brief description of the significance..."
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary flex-1 py-4 font-black uppercase text-xs tracking-widest rounded-2xl">Abort</button>
                                    <button type="submit" className="btn btn-primary flex-1 py-4 font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-primary-200">Confirm & Post</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
