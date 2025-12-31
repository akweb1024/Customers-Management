'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import FormattedDate from '@/components/common/FormattedDate';

export default function CommissionPage() {
    const [userRole, setUserRole] = useState('AGENCY');
    const [stats, setStats] = useState({
        totalEarned: 0,
        pendingPayout: 0,
        rate: 10
    });
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (userData) {
            const user = JSON.parse(userData);
            setUserRole(user.role);
        }

        const fetchStats = async () => {
            try {
                const res = await fetch('/api/commissions/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats({
                        totalEarned: data.totalEarned,
                        pendingPayout: data.pendingPayout,
                        rate: data.rate
                    });
                }
            } catch (err) {
                console.error('Failed to fetch commission stats', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();

        // Keep mock payouts for now as we don't have a Payout model yet
        setPayouts([
            { id: '1', date: '2025-11-15', amount: 3200, status: 'PAID', method: 'Bank Transfer' },
            { id: '2', date: '2025-10-15', amount: 2800, status: 'PAID', method: 'Bank Transfer' },
            { id: '3', date: '2025-09-15', amount: 3100, status: 'PAID', method: 'Bank Transfer' },
        ]);
    }, []);

    return (
        <DashboardLayout userRole={userRole}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-secondary-900">Commission Earnings</h1>
                        <p className="text-secondary-600">Track and manage your agency partner rewards</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card-premium">
                        <p className="text-xs font-black text-secondary-400 uppercase tracking-widest mb-2">Commission Rate</p>
                        <p className="text-3xl font-black text-primary-600">{stats.rate}%</p>
                        <p className="text-xs text-secondary-500 mt-2">Per successful subscription</p>
                    </div>
                    <div className="card-premium">
                        <p className="text-xs font-black text-secondary-400 uppercase tracking-widest mb-2">Total Earnings</p>
                        <p className="text-3xl font-black text-secondary-900">${stats.totalEarned.toLocaleString()}</p>
                        <p className="text-xs text-success-600 mt-2">↑ 14% from last quarter</p>
                    </div>
                    <div className="card-premium border-primary-100 bg-primary-50">
                        <p className="text-xs font-black text-primary-600 uppercase tracking-widest mb-2">Available for Payout</p>
                        <p className="text-3xl font-black text-secondary-900">${stats.pendingPayout.toLocaleString()}</p>
                        <button className="btn btn-primary w-full mt-4 py-2">Request Payout</button>
                    </div>
                </div>

                <div className="card-premium overflow-hidden">
                    <h3 className="text-lg font-bold text-secondary-900 mb-6 p-6 pb-0">Recent Payouts</h3>
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Payout Date</th>
                                    <th>Method</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th className="text-right">Receipt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} className="text-center py-12 animate-pulse">Loading payouts...</td></tr>
                                ) : payouts.map(p => (
                                    <tr key={p.id}>
                                        <td><FormattedDate date={p.date} /></td>
                                        <td>{p.method}</td>
                                        <td className="font-bold text-secondary-900">${p.amount.toLocaleString()}</td>
                                        <td><span className="badge badge-success">{p.status}</span></td>
                                        <td className="text-right">
                                            <button className="text-primary-600 hover:text-primary-800 font-bold text-xs uppercase">Download PDF</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
