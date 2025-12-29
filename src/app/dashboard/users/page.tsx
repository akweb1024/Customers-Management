'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import FormattedDate from '@/components/common/FormattedDate';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('CUSTOMER');
    const [showNewModal, setShowNewModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setUserRole(user.role);
        }
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setActionLoading(true);
        const form = e.currentTarget;
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowNewModal(false);
                fetchUsers();
                form.reset();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to create user');
            }
        } catch (err) {
            alert('Network error');
        } finally {
            setActionLoading(false);
        }
    };

    const toggleUserStatus = async (user: any) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/users/${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isActive: !user.isActive })
            });

            if (res.ok) {
                setUsers(users.map(u => u.id === user.id ? { ...u, isActive: !user.isActive } : u));
            }
        } catch (err) {
            alert('Failed to update status');
        }
    };

    return (
        <DashboardLayout userRole={userRole}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-secondary-900">User Management</h1>
                        <p className="text-secondary-600">Administrative control over staff and system access</p>
                    </div>
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="btn btn-primary px-6"
                    >
                        + Invite Staff
                    </button>
                </div>

                <div className="card-premium overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Activity</th>
                                    <th>Created</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                                        </td>
                                    </tr>
                                ) : users.map(user => (
                                    <tr key={user.id} className="hover:bg-secondary-50 transition-colors">
                                        <td>
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center font-bold text-secondary-600 mr-3">
                                                    {user.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-secondary-900">{user.email}</p>
                                                    <p className="text-xs text-secondary-500">ID: {user.id.split('-')[0]}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${user.role === 'SUPER_ADMIN' ? 'badge-primary' :
                                                    user.role === 'MANAGER' ? 'badge-success' : 'badge-secondary'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => toggleUserStatus(user)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${user.isActive ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'
                                                    }`}
                                            >
                                                {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                                            </button>
                                        </td>
                                        <td>
                                            <div className="text-xs space-y-1">
                                                <p><span className="text-secondary-400">Subs:</span> {user._count.assignedSubscriptions}</p>
                                                <p><span className="text-secondary-400">Tasks:</span> {user._count.tasks}</p>
                                            </div>
                                        </td>
                                        <td className="text-xs text-secondary-500">
                                            <FormattedDate date={user.createdAt} />
                                        </td>
                                        <td className="text-right">
                                            <button className="p-2 border border-secondary-200 rounded-lg text-secondary-600 hover:bg-secondary-50 transition-colors">
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Invite Modal */}
            {showNewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <h2 className="text-2xl font-bold text-secondary-900 mb-6 font-primary">Invite Staff Member</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="label">Work Email</label>
                                <input name="email" type="email" className="input" required placeholder="staff@stm.com" />
                            </div>
                            <div>
                                <label className="label">Temporary Password</label>
                                <input name="password" type="password" className="input" required placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="label">System Role</label>
                                <select name="role" className="input" required>
                                    <option value="SALES_EXECUTIVE">Sales Executive</option>
                                    <option value="MANAGER">Manager</option>
                                    <option value="FINANCE_ADMIN">Finance Admin</option>
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setShowNewModal(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="btn btn-primary px-8"
                                >
                                    {actionLoading ? 'Creating...' : 'Invite Staff'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
