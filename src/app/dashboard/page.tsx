'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>({
        stats: [],
        recentActivities: [],
        upcomingRenewals: []
    });

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            router.push('/login');
            return;
        }

        setUser(JSON.parse(userData));

        // Fetch dashboard data
        const fetchDashboardData = async () => {
            try {
                const response = await fetch('/api/dashboard/stats', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const dashboardData = await response.json();
                    setData(dashboardData);
                } else if (response.status === 401) {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-secondary-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-secondary-600 font-medium">Crunching your subscription data...</p>
                </div>
            </div>
        );
    }

    const { stats, recentActivities, upcomingRenewals } = data;

    return (
        <DashboardLayout userRole={user?.role}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-secondary-900">
                            Welcome back, {user?.customerProfile?.name || 'User'}!
                        </h1>
                        <p className="text-secondary-600 mt-1">
                            Here's what's happening with your subscriptions today
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Link href="/dashboard/subscriptions/new" className="btn btn-primary">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            New Subscription
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats?.map((stat: any) => (
                        <div key={stat.name} className="stat-card">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`stat-card-icon ${stat.color} text-white`}>
                                    {stat.icon}
                                </div>
                            </div>
                            <h3 className="text-secondary-600 text-sm font-medium">{stat.name}</h3>
                            <p className="text-3xl font-bold text-secondary-900 mt-2">{stat.value}</p>
                            <p className={`text-sm mt-2 ${stat.changePositive ? 'text-success-600' : 'text-warning-600'}`}>
                                {stat.change}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <div className="card-premium">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-secondary-900">Recent Activity</h2>
                            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                                View all
                            </button>
                        </div>
                        <div className="space-y-4">
                            {recentActivities?.map((activity: any) => (
                                <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-secondary-100 last:border-0 last:pb-0">
                                    <div className="text-2xl">{activity.icon}</div>
                                    <div className="flex-1">
                                        <p className="text-secondary-900">{activity.message}</p>
                                        <p className="text-sm text-secondary-500 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                            {(!recentActivities || recentActivities.length === 0) && (
                                <p className="text-secondary-500 text-center py-4 italic">No recent activity found.</p>
                            )}
                        </div>
                    </div>

                    {/* Subscription Request Banner for Customers */}
                    {user?.role === 'CUSTOMER' ? (
                        <div className="card-premium bg-gradient-to-br from-primary-600 to-primary-800 text-white border-0">
                            <div className="h-full flex flex-col justify-between">
                                <div>
                                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Limited Offer</span>
                                    <h2 className="text-3xl font-bold mt-4">Expand Your Library</h2>
                                    <p className="mt-2 text-primary-100">
                                        Request access to premium academic journals and stay ahead in your research field.
                                    </p>
                                </div>
                                <div className="mt-8">
                                    <Link
                                        href="/dashboard/subscriptions/new"
                                        className="inline-flex items-center px-6 py-3 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                    >
                                        Browse Journals & Request Subscription
                                        <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Upcoming Renewals for Staff */
                        <div className="card-premium">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-secondary-900">Upcoming Renewals</h2>
                                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                                    View all
                                </button>
                            </div>
                            <div className="space-y-4">
                                {upcomingRenewals?.map((renewal: any) => (
                                    <div key={renewal.id} className="p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors group">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="font-semibold text-secondary-900">{renewal.customer}</h4>
                                                <p className="text-sm text-secondary-600">{renewal.journal}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`badge ${renewal.status === 'auto-renew' ? 'badge-success' : 'badge-warning'}`}>
                                                    {renewal.status}
                                                </span>
                                                {renewal.status === 'pending' && (
                                                    <button
                                                        onClick={async () => {
                                                            const token = localStorage.getItem('token');
                                                            const res = await fetch(`/api/communications`, {
                                                                method: 'POST',
                                                                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({
                                                                    customerProfileId: renewal.customerProfileId,
                                                                    channel: 'EMAIL',
                                                                    type: 'EMAIL',
                                                                    subject: `Renewal Reminder: ${renewal.journal}`,
                                                                    notes: 'Manual renewal reminder sent from dashboard.',
                                                                    outcome: 'sent'
                                                                })
                                                            });
                                                            if (res.ok) alert('Reminder notification logged and sent.');
                                                        }}
                                                        className="text-[10px] font-bold text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                        </svg>
                                                        Send Reminder
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-secondary-600">Due: {renewal.dueDate}</span>
                                            <span className="font-bold text-secondary-900">{renewal.amount}</span>
                                        </div>
                                    </div>
                                ))}
                                {(!upcomingRenewals || upcomingRenewals.length === 0) && (
                                    <p className="text-secondary-500 text-center py-4 italic">No upcoming renewals found.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="card-premium">
                    <h2 className="text-xl font-bold text-secondary-900 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link href="/dashboard/subscriptions/new" className="flex flex-col items-center justify-center p-6 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors text-center">
                            <span className="text-3xl mb-2">📋</span>
                            <span className="text-xs font-bold uppercase tracking-widest text-secondary-900">New Subscription</span>
                        </Link>

                        {user?.role !== 'CUSTOMER' && (
                            <Link href="/dashboard/customers/new" className="flex flex-col items-center justify-center p-6 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors text-center">
                                <span className="text-3xl mb-2">👥</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-secondary-900">Add {user?.role === 'AGENCY' ? 'Client' : 'Customer'}</span>
                            </Link>
                        )}

                        {['SUPER_ADMIN', 'MANAGER', 'SALES_EXECUTIVE'].includes(user?.role) && (
                            <Link href="/dashboard/customers" className="flex flex-col items-center justify-center p-6 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors text-center">
                                <span className="text-3xl mb-2">💬</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-secondary-900">Log Activity</span>
                            </Link>
                        )}

                        {['SUPER_ADMIN', 'MANAGER', 'FINANCE_ADMIN'].includes(user?.role) && (
                            <Link href="/dashboard/analytics" className="flex flex-col items-center justify-center p-6 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors text-center">
                                <span className="text-3xl mb-2">📊</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-secondary-900">Reports</span>
                            </Link>
                        )}

                        {user?.role === 'CUSTOMER' && (
                            <>
                                <Link href="/dashboard/support" className="flex flex-col items-center justify-center p-6 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors text-center">
                                    <span className="text-3xl mb-2">❓</span>
                                    <span className="text-xs font-bold uppercase tracking-widest text-secondary-900">Get Help</span>
                                </Link>
                                <Link href="/dashboard/invoices" className="flex flex-col items-center justify-center p-6 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors text-center">
                                    <span className="text-3xl mb-2">🧾</span>
                                    <span className="text-xs font-bold uppercase tracking-widest text-secondary-900">My Invoices</span>
                                </Link>
                                <Link href="/dashboard/profile" className="flex flex-col items-center justify-center p-6 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors text-center">
                                    <span className="text-3xl mb-2">👤</span>
                                    <span className="text-xs font-bold uppercase tracking-widest text-secondary-900">Settings</span>
                                </Link>
                            </>
                        )}

                        {user?.role === 'AGENCY' && (
                            <Link href="/dashboard/commission" className="flex flex-col items-center justify-center p-6 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors text-center">
                                <span className="text-3xl mb-2">💰</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-secondary-900">Earnings</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
