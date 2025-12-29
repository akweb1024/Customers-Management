'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function SettingsPage() {
    const [userRole, setUserRole] = useState('CUSTOMER');
    const [theme, setTheme] = useState('light');
    const [notifications, setNotifications] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setUserRole(user.role);
        }
    }, []);

    return (
        <DashboardLayout userRole={userRole}>
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900">System Settings</h1>
                    <p className="text-secondary-600 mt-1">Configure global application preferences and security</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <nav className="space-y-1">
                            {['General', 'Security', 'Billing', 'Notifications', 'API Keys'].map(tab => (
                                <button
                                    key={tab}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${tab === 'General' ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-secondary-500 hover:bg-secondary-100'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <section className="card-premium">
                            <h3 className="text-lg font-bold text-secondary-900 mb-6 border-b border-secondary-100 pb-4">Application Interface</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-secondary-900">Dark Mode</p>
                                        <p className="text-sm text-secondary-500">Switch between light and dark themes</p>
                                    </div>
                                    <button
                                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-primary-600' : 'bg-secondary-200'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-secondary-900">Desktop Notifications</p>
                                        <p className="text-sm text-secondary-500">Receive alerts for new subscriptions and inquiries</p>
                                    </div>
                                    <button
                                        onClick={() => setNotifications(!notifications)}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-success-500' : 'bg-secondary-200'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications ? 'translate-x-7' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section className="card-premium">
                            <h3 className="text-lg font-bold text-secondary-900 mb-6 border-b border-secondary-100 pb-4">Business Information</h3>
                            <form className="space-y-4">
                                <div>
                                    <label className="label">Company Display Name</label>
                                    <input type="text" className="input" defaultValue="STM Journal Solutions" />
                                </div>
                                <div>
                                    <label className="label">Support Email</label>
                                    <input type="email" className="input" defaultValue="support@stmjournals.com" />
                                </div>
                                <div>
                                    <label className="label">Default Currency</label>
                                    <select className="input">
                                        <option>USD ($)</option>
                                        <option>EUR (€)</option>
                                        <option>GBP (£)</option>
                                    </select>
                                </div>
                                <div className="pt-4">
                                    <button type="button" className="btn btn-primary px-8">Save Changes</button>
                                </div>
                            </form>
                        </section>

                        <section className="card-premium border-danger-100">
                            <h3 className="text-lg font-bold text-danger-900 mb-2">Danger Zone</h3>
                            <p className="text-sm text-secondary-500 mb-6">Irreversible actions that affect the entire workspace</p>
                            <button className="btn border border-danger-200 text-danger-600 hover:bg-danger-50 px-8">
                                Maintenance Mode
                            </button>
                        </section>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
