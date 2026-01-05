'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';

type ViewType = 'OVERVIEW' | 'ORDERS' | 'COURIERS';

export default function LogisticsPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [couriers, setCouriers] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [view, setView] = useState<ViewType>('OVERVIEW');
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) setUserRole(JSON.parse(user).role);
        fetchData();
        fetchCouriers();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/logistics/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders || []);
                setAnalytics({
                    stats: data.stats || {},
                    carrierPerformance: data.carrierPerformance || [],
                    trends: data.trends || []
                });
            }
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const fetchCouriers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/logistics/couriers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setCouriers(await res.json());
        } catch (error) { console.error(error); }
    };

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const data: any = Object.fromEntries(formData);
        data.items = { "description": "Journal Subscription Package", "qty": 1 };

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/logistics/orders', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                setIsCreatingOrder(false);
                fetchData();
            } else {
                alert('Failed to create order');
            }
        } catch (error) { console.error(error); }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/logistics/orders/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) fetchData();
        } catch (error) { console.error(error); }
    };

    const handleAddCourier = async () => {
        const name = prompt("Courier Name:");
        if (!name) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/logistics/couriers', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name })
            });
            if (res.ok) fetchCouriers();
        } catch (error) { console.error(error); }
    };

    if (loading) return <div className="p-8 text-center text-secondary-500">Initializing Logistics Dashboard...</div>;

    const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

    return (
        <DashboardLayout userRole={userRole}>
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-secondary-900 tracking-tighter">Smart Logistics</h1>
                        <p className="text-secondary-500 font-medium">Predictive dispatch tracking and carrier performance intelligence.</p>
                    </div>
                    <div className="flex bg-secondary-100 p-1 rounded-2xl">
                        {(['OVERVIEW', 'ORDERS', 'COURIERS'] as ViewType[]).map((t) => (
                            <button
                                key={t}
                                onClick={() => setView(t)}
                                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === t ? 'bg-white text-primary-600 shadow-sm' : 'text-secondary-500 hover:text-secondary-700'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {view === 'OVERVIEW' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="card-premium bg-gradient-to-br from-primary-600 to-primary-800 text-white border-0 shadow-xl shadow-primary-900/20">
                                <h3 className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Total Dispatches</h3>
                                <p className="text-3xl font-black">{orders.length}</p>
                                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-white/80">
                                    <span className="bg-white/20 px-2 py-0.5 rounded-full">Active Month</span>
                                </div>
                            </div>
                            <div className="card-premium">
                                <h3 className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-1">In Transit</h3>
                                <p className="text-3xl font-black text-secondary-900">{analytics?.stats?.IN_TRANSIT || 0}</p>
                                <p className="text-[10px] text-primary-600 mt-4 font-black uppercase tracking-widest">Active Shipments</p>
                            </div>
                            <div className="card-premium">
                                <h3 className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-1">Delivered</h3>
                                <p className="text-3xl font-black text-success-600">{analytics?.stats?.DELIVERED || 0}</p>
                                <p className="text-[10px] text-secondary-500 mt-4 font-black uppercase tracking-widest">Successful Completion</p>
                            </div>
                            <div className="card-premium">
                                <h3 className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-1">Returns / Lost</h3>
                                <p className="text-3xl font-black text-danger-600">{(analytics?.stats?.RETURNED || 0) + (analytics?.stats?.LOST || 0)}</p>
                                <p className="text-[10px] text-secondary-500 mt-4 font-black uppercase tracking-widest">Exception Rate: {orders.length > 0 ? (((analytics?.stats?.RETURNED || 0 + analytics?.stats?.LOST || 0) / orders.length) * 100).toFixed(1) : 0}%</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Shipment Trends */}
                            <div className="lg:col-span-2 card-premium p-8">
                                <h2 className="text-xl font-black text-secondary-900 mb-8">Shipment Velocity</h2>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={analytics?.trends}>
                                            <defs>
                                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                            <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Carrier Scorecard */}
                            <div className="card-premium p-8">
                                <h2 className="text-xl font-black text-secondary-900 mb-8">Carrier Scorecard</h2>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analytics?.carrierPerformance} layout="vertical" margin={{ left: -20 }}>
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="courierName" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#1e293b' }} width={100} />
                                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                            <Bar dataKey="orderCount" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={20}>
                                                {analytics?.carrierPerformance?.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'ORDERS' && (
                    <div className="animate-fade-in space-y-4">
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsCreatingOrder(true)}
                                className="btn btn-primary flex items-center gap-2"
                            >
                                <span>+</span> New Shipment
                            </button>
                        </div>

                        <div className="card-premium p-0 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-secondary-600">
                                    <thead className="bg-secondary-50 text-[10px] font-black text-secondary-400 uppercase tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Recipient / Destination</th>
                                            <th className="px-6 py-4">Courier / Tracking</th>
                                            <th className="px-6 py-4">Shipment Weights</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Last Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-secondary-100">
                                        {orders.map(order => (
                                            <tr key={order.id} className="hover:bg-secondary-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-secondary-900">{order.recipientName}</p>
                                                    <p className="text-[10px] text-secondary-400 font-medium">{order.city}, {order.country}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-secondary-800 text-xs">{order.courier?.name || 'Unassigned'}</p>
                                                    <p className="text-[10px] text-primary-600 font-black tracking-widest uppercase">{order.trackingNumber || 'PENDING ASSIGNMENT'}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-black text-secondary-900">{order.weight || '--'} kg</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(userRole) ? (
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                            className="bg-transparent text-[10px] font-black uppercase text-primary-600 cursor-pointer hover:underline outline-none"
                                                        >
                                                            <option value="PENDING">Pending</option>
                                                            <option value="PROCESSING">Processing</option>
                                                            <option value="SHIPPED">Shipped</option>
                                                            <option value="IN_TRANSIT">In Transit</option>
                                                            <option value="DELIVERED">Delivered</option>
                                                            <option value="RETURNED">Returned</option>
                                                            <option value="LOST">Lost</option>
                                                        </select>
                                                    ) : (
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${order.status === 'DELIVERED' ? 'bg-success-100 text-success-700' : 'bg-secondary-100 text-secondary-700'}`}>
                                                            {order.status}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-[10px] font-bold text-secondary-400">
                                                    {new Date(order.updatedAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'COURIERS' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="flex justify-end">
                            <button onClick={handleAddCourier} className="btn btn-primary flex items-center gap-2">
                                <span>+</span> Add Courier Partner
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {couriers.map(courier => (
                                <div key={courier.id} className="card-premium p-8 flex flex-col items-center text-center group hover:border-primary-300 transition-all">
                                    <div className="p-4 bg-secondary-100 rounded-[2rem] mb-4 text-3xl group-hover:scale-110 transition-transform">🚚</div>
                                    <h3 className="text-lg font-black text-secondary-900 leading-tight">{courier.name}</h3>
                                    <p className="text-[10px] text-secondary-400 font-bold uppercase tracking-[0.2em] mt-2">Certified Partner</p>
                                    <div className="mt-6 pt-6 border-t border-secondary-50 w-full flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-secondary-400">Operational Status</span>
                                        <span className="text-success-600 flex items-center gap-1.5 align-middle">
                                            <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse"></span>
                                            Active
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Create Order Modal */}
                {isCreatingOrder && (
                    <div className="fixed inset-0 bg-secondary-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
                            <button onClick={() => setIsCreatingOrder(false)} className="absolute top-6 right-8 text-2xl text-secondary-300 hover:text-secondary-900 transition-colors">×</button>
                            <h3 className="text-2xl font-black text-secondary-900 mb-6">Dispatch Origin</h3>
                            <form onSubmit={handleCreateOrder} className="space-y-4">
                                <div>
                                    <label className="label">Recipient Identity</label>
                                    <input name="recipientName" className="input" required placeholder="Full Name / Org" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="label">Destination Address</label>
                                        <textarea name="address" className="input" required rows={2} placeholder="Street details..." />
                                    </div>
                                    <div>
                                        <label className="label">City</label>
                                        <input name="city" className="input" required />
                                    </div>
                                    <div>
                                        <label className="label">Zip/Pincode</label>
                                        <input name="pincode" className="input" required />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="label">Country</label>
                                        <input name="country" className="input" required defaultValue="India" />
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Assign Carrier</label>
                                    <select name="courierId" className="input" required>
                                        <option value="">Choose Partner...</option>
                                        {couriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex gap-2 pt-6">
                                    <button type="submit" className="btn btn-primary flex-1 py-4 font-black uppercase text-xs tracking-widest">Generate Shipment</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
