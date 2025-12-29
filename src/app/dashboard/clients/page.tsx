'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import FormattedDate from '@/components/common/FormattedDate';
import Link from 'next/link';

export default function ClientsPage() {
    const [userRole, setUserRole] = useState('AGENCY');
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setUserRole(user.role);
        }
        // Mock data for demo
        setTimeout(() => {
            setClients([
                { id: 'c1', name: 'Global University', org: 'Education', subs: 12, status: 'ACTIVE', lastRenewal: '2025-08-10' },
                { id: 'c2', name: 'BioMed Research', org: 'Healthcare', subs: 5, status: 'ACTIVE', lastRenewal: '2025-11-02' },
                { id: 'c3', name: 'Tech Innovations', org: 'Technology', subs: 2, status: 'PENDING_PAYMENT', lastRenewal: '2025-12-15' },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <DashboardLayout userRole={userRole}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-secondary-900">My Clients</h1>
                        <p className="text-secondary-600">Managing accounts and subscriptions for your partners</p>
                    </div>
                </div>

                <div className="card-premium overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Client Name</th>
                                    <th>Organization</th>
                                    <th>Active Subs</th>
                                    <th>Status</th>
                                    <th>Last Activity</th>
                                    <th className="text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center py-12 animate-pulse">Loading clients...</td></tr>
                                ) : clients.map(c => (
                                    <tr key={c.id}>
                                        <td className="font-bold text-secondary-900">{c.name}</td>
                                        <td className="text-sm text-secondary-500">{c.org}</td>
                                        <td className="font-bold text-primary-600">{c.subs}</td>
                                        <td>
                                            <span className={`badge ${c.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                                                {c.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="text-sm text-secondary-500"><FormattedDate date={c.lastRenewal} /></td>
                                        <td className="text-right">
                                            <Link href={`/dashboard/customers/${c.id}`} className="p-2 border border-secondary-100 rounded-lg hover:bg-secondary-50 transition-colors inline-block text-xs font-bold uppercase tracking-widest text-secondary-600">
                                                View Details
                                            </Link>
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
