'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function EditorialPage() {
    const [articles, setArticles] = useState<any[]>([]);
    const [journals, setJournals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) setUserRole(JSON.parse(user).role);
        fetchArticles();
        fetchJournals();
    }, []);

    const fetchArticles = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/editorial/articles', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setArticles(await res.json());
        } catch (error) { console.error(error); }
    };

    const fetchJournals = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/journals', { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) setJournals(data);
                else if (data.journals) setJournals(data.journals);
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/editorial/articles', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                setIsSubmitting(false);
                fetchArticles();
            } else {
                alert('Failed to submit article');
            }
        } catch (error) { console.error(error); }
    };

    if (loading) return <div className="p-8 text-center text-secondary-500">Loading editorial dashboard...</div>;

    return (
        <DashboardLayout userRole={userRole}>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-secondary-900">Editorial Workflow</h1>
                        <p className="text-secondary-500">Manage submissions and peer review</p>
                    </div>
                    <button
                        onClick={() => setIsSubmitting(true)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <span>+</span> Submit Article
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="card-premium p-4 bg-white border border-secondary-100">
                        <h4 className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Pending Review</h4>
                        <p className="text-2xl font-black text-secondary-900">{articles.filter(a => a.status === 'SUBMITTED').length}</p>
                    </div>
                    <div className="card-premium p-4 bg-white border border-secondary-100">
                        <h4 className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Under Review</h4>
                        <p className="text-2xl font-black text-warning-600">{articles.filter(a => a.status === 'UNDER_REVIEW').length}</p>
                    </div>
                    <div className="card-premium p-4 bg-white border border-secondary-100">
                        <h4 className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Revisions</h4>
                        <p className="text-2xl font-black text-primary-600">{articles.filter(a => a.status === 'REVISION_REQUESTED').length}</p>
                    </div>
                    <div className="card-premium p-4 bg-white border border-secondary-100">
                        <h4 className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Accepted</h4>
                        <p className="text-2xl font-black text-success-600">{articles.filter(a => a.status === 'ACCEPTED').length}</p>
                    </div>
                </div>

                {/* Articles Table */}
                <div className="bg-white rounded-3xl border border-secondary-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm text-secondary-600">
                        <thead className="bg-secondary-50 text-secondary-900 font-bold border-b border-secondary-200">
                            <tr>
                                <th className="p-4">Title</th>
                                <th className="p-4">Journal</th>
                                <th className="p-4">First Author</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-100">
                            {articles.map(article => (
                                <tr key={article.id} className="hover:bg-secondary-50 transition-colors">
                                    <td className="p-4 font-medium text-secondary-900 line-clamp-1 max-w-xs">{article.title}</td>
                                    <td className="p-4">{article.journal?.name}</td>
                                    <td className="p-4 font-medium">{article.authors?.[0]?.name}</td>
                                    <td className="p-4">{new Date(article.submissionDate).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase 
                                            ${article.status === 'ACCEPTED' ? 'bg-success-100 text-success-700' :
                                                article.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                    article.status === 'PUBLISHED' ? 'bg-primary-100 text-primary-700' :
                                                        'bg-secondary-100 text-secondary-700'}`}>
                                            {article.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button className="text-primary-600 font-bold hover:underline">Review</button>
                                    </td>
                                </tr>
                            ))}
                            {articles.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-secondary-400 italic">No articles found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Submission Modal */}
                {isSubmitting && (
                    <div className="fixed inset-0 bg-secondary-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-[2rem] p-10 max-w-lg w-full shadow-2xl">
                            <h3 className="text-2xl font-bold mb-6">Submit New Manuscript</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="label">Target Journal</label>
                                    <select name="journalId" className="input" required>
                                        <option value="">Select Journal</option>
                                        {journals.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Article Title</label>
                                    <input name="title" className="input" required placeholder="Nature of the Cosmos..." />
                                </div>
                                <div>
                                    <label className="label">Abstract</label>
                                    <textarea name="abstract" className="input h-32" required placeholder="Paste abstract here..." />
                                </div>
                                <div>
                                    <label className="label">First Author Name</label>
                                    <input name="authorName" className="input" required placeholder="e.g. Dr. Jane Doe" />
                                </div>
                                <div className="flex gap-2 pt-6">
                                    <button type="submit" className="btn btn-primary flex-1">Submit Manuscript</button>
                                    <button type="button" onClick={() => setIsSubmitting(false)} className="btn btn-secondary">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
