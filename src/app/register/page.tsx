'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        primaryPhone: '',
        customerType: 'INDIVIDUAL',
        organizationName: '',
        country: '',
        // Institution specific
        category: '',
        // Agency specific
        territory: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                // Auto login after register
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/dashboard';
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
                        <p className="text-slate-600 mt-2">Join us to manage your subscriptions</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="input w-full px-4 py-2 border rounded-lg"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                                <input
                                    name="primaryPhone"
                                    type="tel"
                                    required
                                    className="input w-full px-4 py-2 border rounded-lg"
                                    value={formData.primaryPhone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="input w-full px-4 py-2 border rounded-lg"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                className="input w-full px-4 py-2 border rounded-lg"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Account Type</label>
                            <select
                                name="customerType"
                                className="input w-full px-4 py-2 border rounded-lg"
                                value={formData.customerType}
                                onChange={handleChange}
                            >
                                <option value="INDIVIDUAL">Individual</option>
                                <option value="INSTITUTION">Institution (University, Library, etc.)</option>
                                <option value="AGENCY">Agency (Subscription Agent)</option>
                            </select>
                        </div>

                        {formData.customerType !== 'INDIVIDUAL' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Organization Name</label>
                                <input
                                    name="organizationName"
                                    type="text"
                                    required
                                    className="input w-full px-4 py-2 border rounded-lg"
                                    value={formData.organizationName}
                                    onChange={handleChange}
                                />
                            </div>
                        )}

                        {formData.customerType === 'INSTITUTION' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                                <select
                                    name="category"
                                    className="input w-full px-4 py-2 border rounded-lg"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Category</option>
                                    <option value="University">University</option>
                                    <option value="College">College</option>
                                    <option value="Research Institute">Research Institute</option>
                                    <option value="Corporate">Corporate</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg transition-colors ${loading ? 'opacity-70' : ''}`}
                        >
                            {loading ? 'Creating Account...' : 'Register'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-600">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary-600 hover:text-primary-700 font-bold">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
