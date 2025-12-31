'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';

export default function EditJournalPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [userRole, setUserRole] = useState<string>('CUSTOMER');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        issnPrint: '',
        issnOnline: '',
        frequency: 'Monthly',
        formatAvailable: 'Print,Online,Hybrid',
        subjectCategory: '',
        priceINR: '',
        priceUSD: '',
        isActive: true
    });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (userData) {
            const user = JSON.parse(userData);
            setUserRole(user.role);
            if (user.role !== 'SUPER_ADMIN') {
                router.push('/dashboard/journals');
                return;
            }
        } else {
            router.push('/login');
            return;
        }

        const fetchJournal = async () => {
            try {
                const res = await fetch(`/api/journals/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        name: data.name,
                        issnPrint: data.issnPrint || '',
                        issnOnline: data.issnOnline || '',
                        frequency: data.frequency,
                        formatAvailable: data.formatAvailable,
                        subjectCategory: data.subjectCategory || '',
                        priceINR: data.priceINR.toString(),
                        priceUSD: data.priceUSD.toString(),
                        isActive: data.isActive
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchJournal();
    }, [id]);

    const handleJournalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/journals/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                router.push('/dashboard/journals');
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to update journal');
            }
        } catch (error) {
            alert('A network error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout userRole={userRole}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout userRole={userRole}>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/journals" className="p-2 hover:bg-secondary-100 rounded-full text-secondary-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <h1 className="text-3xl font-bold text-secondary-900">Edit Journal</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="card-premium p-6">
                        <h3 className="text-lg font-bold text-secondary-900 mb-4 border-l-4 border-primary-500 pl-3">General Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="label">Journal Name*</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="input"
                                    value={formData.name}
                                    onChange={handleJournalChange}
                                />
                            </div>
                            <div>
                                <label className="label">ISSN (Print)</label>
                                <input
                                    type="text"
                                    name="issnPrint"
                                    className="input"
                                    value={formData.issnPrint}
                                    onChange={handleJournalChange}
                                />
                            </div>
                            <div>
                                <label className="label">ISSN (Online)</label>
                                <input
                                    type="text"
                                    name="issnOnline"
                                    className="input"
                                    value={formData.issnOnline}
                                    onChange={handleJournalChange}
                                />
                            </div>
                            <div>
                                <label className="label">Frequency</label>
                                <select name="frequency" className="input" value={formData.frequency} onChange={handleJournalChange}>
                                    <option>Weekly</option>
                                    <option>Monthly</option>
                                    <option>Quarterly</option>
                                    <option>Semi-Annual</option>
                                    <option>Annual</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Base Price (INR)*</label>
                                <input
                                    type="number"
                                    name="priceINR"
                                    required
                                    className="input"
                                    value={formData.priceINR}
                                    onChange={handleJournalChange}
                                />
                            </div>
                            <div>
                                <label className="label">Base Price (USD)</label>
                                <input
                                    type="number"
                                    name="priceUSD"
                                    className="input"
                                    value={formData.priceUSD}
                                    onChange={handleJournalChange}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="label flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleJournalChange}
                                        className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                                    />
                                    <span>Is Active / Available for Sale</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Link href="/dashboard/journals" className="btn btn-secondary px-6">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className="btn btn-primary px-10"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
