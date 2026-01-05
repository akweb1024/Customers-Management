'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showCompanySelection, setShowCompanySelection] = useState(false);
    const [availableCompanies, setAvailableCompanies] = useState<any[]>([]);

    const redirectUrl = searchParams.get('redirect_url') || '/dashboard';

    const handleSelectCompany = async (companyId: string) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/auth/select-company', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ companyId })
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                window.location.href = redirectUrl;
            } else {
                setError(data.error || 'Selection failed');
            }
        } catch (err) {
            setError('An error occurred during selection');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                // Store auth data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                if (data.availableCompanies) {
                    localStorage.setItem('availableCompanies', JSON.stringify(data.availableCompanies));
                }

                if (data.requiresCompanySelection) {
                    setAvailableCompanies(data.availableCompanies);
                    setShowCompanySelection(true);
                } else {
                    // Redirect
                    window.location.href = redirectUrl;
                }
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (showCompanySelection) {
        return (
            <div className="p-8 animate-in fade-in duration-500">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Select Company</h1>
                    <p className="text-slate-600 mt-2">Choose a company to manage</p>
                </div>

                <div className="space-y-4">
                    {availableCompanies.map((comp) => (
                        <button
                            key={comp.id}
                            onClick={() => handleSelectCompany(comp.id)}
                            disabled={loading}
                            className="w-full p-4 text-left border border-slate-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group flex items-center justify-between"
                        >
                            <div>
                                <h3 className="font-bold text-slate-900 group-hover:text-primary-700">{comp.name}</h3>
                                {comp.registrationNumber && (
                                    <p className="text-sm text-slate-500">{comp.registrationNumber}</p>
                                )}
                            </div>
                            <svg className="w-5 h-5 text-slate-400 group-hover:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setShowCompanySelection(false)}
                    className="w-full mt-6 text-slate-500 hover:text-slate-700 text-sm font-medium"
                >
                    Back to Login
                </button>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
                <p className="text-slate-600 mt-2">Sign in to your account to continue</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {loading ? (
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    ) : 'Sign In'}
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-primary-600 hover:text-primary-700 font-bold">
                    Create one
                </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-2">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest text-center">Troubleshooting</p>
                <button
                    onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                    }}
                    className="text-xs text-slate-500 hover:text-danger-500 transition-colors underline decoration-dotted"
                >
                    Clear saved sessions & reset app
                </button>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
                    <LoginForm />
                </Suspense>
                <div className="bg-slate-50 p-4 text-center text-xs text-slate-500 border-t border-slate-100">
                    &copy; {new Date().getFullYear()} STM Management. All rights reserved.
                </div>
            </div>
        </div>
    );
}
