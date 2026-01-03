'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function PaymentsPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [userRole, setUserRole] = useState<string>('');
    const [lastSync, setLastSync] = useState<any>(null);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) setUserRole(JSON.parse(user).role);
        fetchPayments();
        fetchLastSync();
    }, []);

    const fetchPayments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/payments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setPayments(await res.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLastSync = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/payments/razorpay/sync', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLastSync(data.lastSync);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/payments/razorpay/sync', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                alert(`Sync successful! ${data.syncedCount} new payments found.`);
                fetchPayments();
                fetchLastSync();
            } else {
                alert('Sync failed: ' + data.error);
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred during sync');
        } finally {
            setSyncing(false);
        }
    };

    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(userRole);

    if (loading) return <div className="p-8 text-center text-secondary-500">Loading payments...</div>;

    return (
        <DashboardLayout userRole={userRole}>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-secondary-900">Payment Gateway Tracer</h1>
                        <p className="text-secondary-500">Track and reconcile Razorpay payments across all companies</p>
                    </div>
                    {isAdmin && (
                        <div className="flex flex-col items-end gap-2">
                            <button
                                onClick={handleSync}
                                disabled={syncing}
                                className={`btn btn-primary flex items-center gap-2 ${syncing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span className={syncing ? 'animate-spin' : ''}>🔄</span>
                                {syncing ? 'Syncing...' : 'Sync Razorpay'}
                            </button>
                            {lastSync && (
                                <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">
                                    Last Sync: {new Date(lastSync.lastSyncAt).toLocaleString()}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card-premium p-6 bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                        <h4 className="text-xs font-bold uppercase tracking-widest opacity-80">Total Collected</h4>
                        <p className="text-3xl font-black mt-2">
                            ₹{payments.reduce((acc, p) => acc + p.amount, 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="card-premium p-6 bg-white border border-secondary-100">
                        <h4 className="text-xs font-bold text-secondary-400 uppercase tracking-widest">Successful Transactions</h4>
                        <p className="text-3xl font-black text-secondary-900 mt-2">
                            {payments.filter(p => p.status === 'captured').length}
                        </p>
                    </div>
                    <div className="card-premium p-6 bg-white border border-secondary-100">
                        <h4 className="text-xs font-bold text-secondary-400 uppercase tracking-widest">Active Companies</h4>
                        <p className="text-3xl font-black text-secondary-900 mt-2">
                            {new Set(payments.map(p => p.companyId)).size}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-secondary-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm text-secondary-600">
                        <thead className="bg-secondary-50 text-secondary-900 font-bold border-b border-secondary-200">
                            <tr>
                                <th className="p-4">Transaction ID</th>
                                <th className="p-4">Company</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Method</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-100">
                            {payments.map(payment => (
                                <tr key={payment.id} className="hover:bg-secondary-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-secondary-900">{payment.razorpayPaymentId || payment.transactionId}</div>
                                        <div className="text-[10px] text-secondary-400 uppercase font-bold">{payment.invoice?.invoiceNumber || 'No Invoice'}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-primary-600">{payment.company?.name || 'Unknown Company'}</div>
                                        <div className="text-[10px] text-secondary-400">{payment.companyId || 'N/A'}</div>
                                    </td>
                                    <td className="p-4 font-black text-secondary-900 text-base">
                                        ₹{payment.amount.toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-secondary-100 rounded text-[10px] font-black uppercase tracking-wider">
                                            {payment.paymentMethod}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold">{new Date(payment.paymentDate).toLocaleDateString()}</div>
                                        <div className="text-[10px] text-secondary-400">{new Date(payment.paymentDate).toLocaleTimeString()}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest 
                                            ${payment.status === 'captured' ? 'bg-success-100 text-success-700' :
                                                payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                    'bg-secondary-100 text-secondary-700'}`}>
                                            {payment.status || 'unknown'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {payments.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-secondary-400 italic">
                                        <div className="text-4xl mb-4 opacity-20">💰</div>
                                        No payments tracked yet. Use the sync button to fetch data from Razorpay.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
