'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function SupportPage() {
    const [userRole, setUserRole] = useState('CUSTOMER');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setUserRole(user.role);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate support ticket creation
        setTimeout(() => {
            setIsSubmitting(false);
            setSuccess(true);
            setSubject('');
            setMessage('');
        }, 1500);
    };

    return (
        <DashboardLayout userRole={userRole}>
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900">Support Center</h1>
                    <p className="text-secondary-600">Get help with your subscriptions, access, or billing</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 space-y-6">
                        <div className="card-premium">
                            <h3 className="font-bold text-secondary-900 mb-4">Quick Contact</h3>
                            <div className="space-y-4 text-sm text-secondary-600">
                                <div className="flex items-center">
                                    <span className="text-xl mr-3">📧</span>
                                    <span>support@stm.com</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-xl mr-3">📞</span>
                                    <span>+1 (800) STM-HELP</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-xl mr-3">⏰</span>
                                    <span>Mon-Fri, 9AM-6PM EST</span>
                                </div>
                            </div>
                        </div>

                        <div className="card-premium bg-primary-600 text-white border-primary-600">
                            <h3 className="font-bold mb-2">Knowledge Base</h3>
                            <p className="text-xs opacity-90 mb-4">Browse our documentation for instant answers to common questions.</p>
                            <button className="text-xs font-black uppercase tracking-widest bg-white/20 hover:bg-white/30 p-2 px-4 rounded-lg transition-colors">
                                Browse Docs →
                            </button>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="card-premium">
                            <h3 className="text-lg font-bold text-secondary-900 mb-6">Create Support Ticket</h3>
                            {success ? (
                                <div className="bg-success-50 text-success-700 p-8 rounded-3xl text-center border border-success-100">
                                    <div className="text-4xl mb-4">✅</div>
                                    <h4 className="text-xl font-bold mb-2">Message Sent Successfully!</h4>
                                    <p className="mb-6 opacity-80">Our support team will get back to you within 24 business hours.</p>
                                    <button
                                        onClick={() => setSuccess(false)}
                                        className="btn btn-primary"
                                    >
                                        Send Another Message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="label">Inquiry Subject</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="e.g. Cannot access full-text PDF"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Detailed Description</label>
                                        <textarea
                                            className="input h-48"
                                            placeholder="Please provide details about the issue..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="btn btn-primary w-full"
                                        >
                                            {isSubmitting ? 'Sending inquiry...' : 'Submit Ticket'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
