'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import FormattedDate from '@/components/common/FormattedDate';
import Link from 'next/link';

export default function PaymentsPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('CUSTOMER');

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setUserRole(user.role);
        }
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/payments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPayments(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

    return (
        <DashboardLayout userRole={userRole}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-secondary-900">Payment History</h1>
                        <p className="text-secondary-600 mt-1">Verifiable ledger of all successful financial transactions</p>
                    </div>
                    <div className="bg-success-50 border border-success-100 p-4 rounded-2xl flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-success-600 text-white flex items-center justify-center text-xl shadow-lg shadow-success-200">
                            💰
                        </div>
                        <div>
                            <p className="text-xs font-bold text-success-600 uppercase tracking-widest">Selected Period Revenue</p>
                            <p className="text-2xl font-black text-secondary-900">${totalRevenue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="card-premium overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Ref ID / Date</th>
                                    <th>Customer / Organization</th>
                                    <th>Invoice #</th>
                                    <th>Method</th>
                                    <th>Amount</th>
                                    <th className="text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                                        </td>
                                    </tr>
                                ) : payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-secondary-400">No payments found.</td>
                                    </tr>
                                ) : payments.map(payment => (
                                    <tr key={payment.id} className="hover:bg-secondary-50 transition-colors">
                                        <td>
                                            <div className="text-sm font-bold text-secondary-900">{payment.transactionId || 'N/A'}</div>
                                            <div className="text-xs text-secondary-500"><FormattedDate date={payment.paymentDate} /></div>
                                        </td>
                                        <td>
                                            <div className="text-sm font-bold text-secondary-900">
                                                {payment.invoice.subscription.customerProfile.name}
                                            </div>
                                            <div className="text-xs text-secondary-500">
                                                {payment.invoice.subscription.customerProfile.organizationName || 'Individual'}
                                            </div>
                                        </td>
                                        <td>
                                            <Link
                                                href={`/dashboard/invoices/${payment.invoice.id}`}
                                                className="text-xs font-black text-primary-600 hover:underline"
                                            >
                                                {payment.invoice.invoiceNumber}
                                            </Link>
                                        </td>
                                        <td>
                                            <span className="text-[10px] font-black px-2 py-0.5 bg-secondary-100 rounded uppercase tracking-wider text-secondary-600">
                                                {payment.paymentMethod}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-sm font-black text-success-600">
                                                +${payment.amount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <button className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-secondary-200">
                                                <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </button>
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
