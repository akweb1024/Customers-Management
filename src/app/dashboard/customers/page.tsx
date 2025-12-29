'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import FormattedDate from '@/components/common/FormattedDate';
import Link from 'next/link';
import { CustomerType } from '@/types';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string>('CUSTOMER');
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setUserRole(user.role);
        }
    }, []);

    const [error, setError] = useState<string | null>(null);

    const fetchCustomers = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                search,
                ...(typeFilter && { type: typeFilter })
            });

            const res = await fetch(`/api/customers?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const result = await res.json();
                setCustomers(result.data);
                setPagination(result.pagination);
            } else {
                const err = await res.json();
                setError(err.message || err.error || 'Failed to fetch customers');
            }
        } catch (error) {
            console.error('Failed to fetch customers:', error);
            setError('A network error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCustomers();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, typeFilter, pagination.page]);

    const getBadgeClass = (type: CustomerType) => {
        switch (type) {
            case 'INDIVIDUAL': return 'badge-primary';
            case 'INSTITUTION': return 'badge-success';
            case 'AGENCY': return 'badge-warning';
            default: return 'badge-secondary';
        }
    };

    return (
        <DashboardLayout userRole={userRole}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-secondary-900">Customers</h1>
                        <p className="text-secondary-600 mt-1">Manage all your customer accounts and profiles</p>
                    </div>
                    <Link href="/dashboard/customers/new" className="btn btn-primary px-6">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Customer
                    </Link>
                </div>

                {/* Filters */}
                <div className="card-premium p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Search by name, email or organization..."
                                className="input pl-10 w-full"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <select
                                className="input w-full"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option value="">All Types</option>
                                <option value="INDIVIDUAL">Individual</option>
                                <option value="INSTITUTION">Institution</option>
                                <option value="AGENCY">Agency</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="card-premium overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Type</th>
                                    <th>Country</th>
                                    <th>Subscriptions</th>
                                    <th>Last Activity</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                                            <p className="text-secondary-500">Loading customers...</p>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12">
                                            <div className="text-danger-600 mb-2">⚠️ Error</div>
                                            <p className="text-secondary-500">{error}</p>
                                            <button
                                                onClick={() => fetchCustomers()}
                                                className="btn btn-secondary mt-4 text-xs"
                                            >
                                                Try Again
                                            </button>
                                        </td>
                                    </tr>
                                ) : customers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12">
                                            <p className="text-secondary-500">No customers found matching your criteria</p>
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-secondary-50 transition-colors">
                                            <td>
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold mr-3">
                                                        {customer.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-secondary-900">{customer.name}</div>
                                                        <div className="text-xs text-secondary-500">{customer.primaryEmail}</div>
                                                        {customer.organizationName && (
                                                            <div className="text-xs text-secondary-400 mt-0.5">{customer.organizationName}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${getBadgeClass(customer.customerType)}`}>
                                                    {customer.customerType.toLowerCase()}
                                                </span>
                                            </td>
                                            <td className="text-sm text-secondary-600">{customer.country || 'N/A'}</td>
                                            <td>
                                                <span className="text-sm font-medium text-secondary-900">
                                                    {customer._count?.subscriptions || 0}
                                                </span>
                                            </td>
                                            <td className="text-sm text-secondary-500">
                                                <FormattedDate date={customer.user?.lastLogin} fallback="Never" />
                                            </td>
                                            <td className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Link
                                                        href={`/dashboard/customers/${customer.id}`}
                                                        className="p-2 hover:bg-secondary-100 rounded-full text-secondary-600 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </Link>
                                                    <button className="p-2 hover:bg-primary-50 rounded-full text-primary-600 transition-colors" title="Edit Profile">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && customers.length > 0 && (
                        <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-100 flex items-center justify-between">
                            <div className="text-sm text-secondary-500">
                                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> customers
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    className="px-3 py-1 bg-white border border-secondary-200 rounded-md text-sm disabled:opacity-50"
                                    disabled={pagination.page === 1}
                                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                >
                                    Previous
                                </button>
                                <button
                                    className="px-3 py-1 bg-white border border-secondary-200 rounded-md text-sm disabled:opacity-50"
                                    disabled={pagination.page === pagination.totalPages}
                                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
