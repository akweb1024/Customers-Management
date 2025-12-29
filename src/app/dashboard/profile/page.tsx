'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import FormattedDate from '@/components/common/FormattedDate';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('CUSTOMER');
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const data = JSON.parse(userData);
            setUserRole(data.role);
        }
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setActionLoading(true);
        setMessage({ type: '', text: '' });

        const formData = new FormData(e.currentTarget);
        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            setActionLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Password changed successfully' });
                (e.target as HTMLFormElement).reset();
            } else {
                const err = await res.json();
                setMessage({ type: 'error', text: err.error || 'Failed to change password' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error occurred' });
        } finally {
            setActionLoading(false);
        }
    };

    const [infoMessage, setInfoMessage] = useState({ type: '', text: '' });

    const handleInfoUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setActionLoading(true);
        setInfoMessage({ type: '', text: '' });

        const formData = new FormData(e.currentTarget);
        const name = formData.get('name');
        const primaryPhone = formData.get('primaryPhone');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, primaryPhone })
            });

            if (res.ok) {
                setInfoMessage({ type: 'success', text: 'Profile updated successfully' });
                fetchProfile();
            } else {
                const err = await res.json();
                setInfoMessage({ type: 'error', text: err.error || 'Update failed' });
            }
        } catch (err) {
            setInfoMessage({ type: 'error', text: 'Network error' });
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout userRole={userRole}>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 rounded-3xl bg-primary-600 text-white flex items-center justify-center text-4xl font-black shadow-2xl shadow-primary-200">
                        {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-secondary-900">{user.customerProfile?.name || 'Staff Member'}</h1>
                        <p className="text-secondary-600 font-medium">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-2">
                            <span className="badge badge-primary">{user.role}</span>
                            <span className="text-xs text-secondary-400 font-bold uppercase tracking-widest">
                                Member since <FormattedDate date={user.createdAt} />
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="card-premium">
                        <h3 className="text-lg font-bold text-secondary-900 mb-6 border-b border-secondary-100 pb-4 flex items-center">
                            <span className="mr-2">👤</span> Personal Information
                        </h3>
                        <form onSubmit={handleInfoUpdate} className="space-y-4">
                            {infoMessage.text && (
                                <div className={`p-3 rounded-xl text-xs font-bold ${infoMessage.type === 'success' ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'}`}>
                                    {infoMessage.text}
                                </div>
                            )}
                            <div>
                                <label className="label">Display Name</label>
                                <input name="name" className="input" defaultValue={user.customerProfile?.name} required />
                            </div>
                            <div>
                                <label className="label">Contact Phone</label>
                                <input name="primaryPhone" className="input" defaultValue={user.customerProfile?.primaryPhone} />
                            </div>
                            <div className="pt-2">
                                <button type="submit" disabled={actionLoading} className="btn btn-primary w-full">
                                    Update Info
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Security */}
                    <div className="card-premium">
                        <h3 className="text-lg font-bold text-secondary-900 mb-6 border-b border-secondary-100 pb-4 flex items-center">
                            <span className="mr-2">🔒</span> Security & Password
                        </h3>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            {message.text && (
                                <div className={`p-3 rounded-xl text-xs font-bold ${message.type === 'success' ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'}`}>
                                    {message.text}
                                </div>
                            )}
                            <div>
                                <label className="label">Current Password</label>
                                <input name="currentPassword" type="password" className="input" required />
                            </div>
                            <div>
                                <label className="label">New Password</label>
                                <input name="newPassword" type="password" className="input" required minLength={8} />
                            </div>
                            <div>
                                <label className="label">Confirm New Password</label>
                                <input name="confirmPassword" type="password" className="input" required minLength={8} />
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="btn btn-secondary w-full"
                                >
                                    {actionLoading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Additional Profile Info for Customers */}
                {user.customerProfile && user.customerProfile.organizationName && (
                    <div className="card-premium">
                        <h3 className="text-lg font-bold text-secondary-900 mb-6 border-b border-secondary-100 pb-4">Institutional Verification</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="label">Organization</p>
                                <p className="text-secondary-900 font-bold">{user.customerProfile.organizationName}</p>
                            </div>
                            <div>
                                <p className="label">Customer Type</p>
                                <span className="badge badge-primary">{user.customerProfile.customerType}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
