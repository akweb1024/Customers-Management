'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('CUSTOMER');

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setUserRole(user.role);
        }

        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/analytics', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <DashboardLayout userRole={userRole}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!data) return null;

    return (
        <DashboardLayout userRole={userRole}>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900">Advanced Analytics</h1>
                    <p className="text-secondary-600">Real-time business intelligence and growth metrics</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Revenue History Card */}
                    <div className="card-premium">
                        <h3 className="text-lg font-bold text-secondary-900 mb-6 flex items-center">
                            <span className="mr-2">📈</span> Revenue Trends (Last 6 Months)
                        </h3>
                        <div className="h-64 flex items-end justify-between gap-2 px-4">
                            {data.revenueHistory.map((item: any) => {
                                const max = Math.max(...data.revenueHistory.map((h: any) => h.value), 1);
                                const height = (item.value / max) * 100;
                                return (
                                    <div key={item.name} className="flex-1 flex flex-col items-center group relative">
                                        <div
                                            className="w-full bg-primary-500 rounded-t-lg transition-all duration-500 hover:bg-primary-600"
                                            style={{ height: `${height}%` }}
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-secondary-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                ${item.value.toLocaleString()}
                                            </div>
                                        </div>
                                        <span className="text-[10px] sm:text-xs text-secondary-500 mt-2 font-medium">{item.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Subscription Status Distribution */}
                    <div className="card-premium">
                        <h3 className="text-lg font-bold text-secondary-900 mb-6 flex items-center">
                            <span className="mr-2">📋</span> Subscription status
                        </h3>
                        <div className="space-y-6">
                            {data.statusSplit.map((status: any) => {
                                const total = data.statusSplit.reduce((acc: number, s: any) => acc + s.value, 0);
                                const percentage = (status.value / total) * 100;
                                return (
                                    <div key={status.name}>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-bold text-secondary-700">{status.name}</span>
                                            <span className="text-secondary-500">{status.value} ({percentage.toFixed(1)}%)</span>
                                        </div>
                                        <div className="w-full bg-secondary-100 rounded-full h-3 overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ${status.name === 'ACTIVE' ? 'bg-success-500' :
                                                        status.name === 'EXPIRED' ? 'bg-danger-500' :
                                                            'bg-warning-500'
                                                    }`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Top Journals List */}
                    <div className="card-premium">
                        <h3 className="text-lg font-bold text-secondary-900 mb-6 flex items-center">
                            <span className="mr-2">📚</span> Performance by Journal
                        </h3>
                        <div className="space-y-4">
                            {data.topJournals.map((journal: any, idx: number) => (
                                <div key={journal.name} className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl border border-secondary-100">
                                    <div className="flex items-center space-x-4">
                                        <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-secondary-400">
                                            {idx + 1}
                                        </span>
                                        <div>
                                            <p className="font-bold text-secondary-900 truncate max-w-[150px] sm:max-w-xs">{journal.name}</p>
                                            <p className="text-xs text-secondary-500">{journal.count} Active Subscriptions</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-primary-600">${journal.revenue.toLocaleString()}</p>
                                        <p className="text-[10px] text-secondary-400 font-bold uppercase tracking-widest">Revenue</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Channel Distribution */}
                    <div className="card-premium">
                        <h3 className="text-lg font-bold text-secondary-900 mb-6 flex items-center">
                            <span className="mr-2">🔌</span> Acquisition Channels
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {data.channelSplit.map((channel: any) => (
                                <div key={channel.name} className="p-6 text-center rounded-2xl bg-secondary-50 border-2 border-dashed border-secondary-200">
                                    <p className="text-4xl font-black text-secondary-900">{channel.value}</p>
                                    <p className="text-sm font-bold text-secondary-500 uppercase mt-2">{channel.name}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-8 border-t border-secondary-100 italic text-sm text-secondary-400 text-center">
                            Direct sales currently accounts for {((data.channelSplit.find((c: any) => c.name === 'DIRECT')?.value || 0) / data.statusSplit.reduce((a: any, s: any) => a + s.value, 0) * 100).toFixed(1)}% of all acquisitions.
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
