'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function SupportPage() {
    const [userRole, setUserRole] = useState('CUSTOMER');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [priority, setPriority] = useState('MEDIUM');
    const [tickets, setTickets] = useState<any[]>([]);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setUserRole(user.role);
            fetchTickets();
        }
    }, []);

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/support/tickets', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTickets(data);
            }
        } catch (err) {
            console.error('Fetch tickets error:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/support/tickets', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ subject, description: message, priority })
            });

            if (res.ok) {
                setSuccess(true);
                setSubject('');
                setMessage('');
                fetchTickets();
            } else {
                alert('Failed to submit ticket');
            }
        } catch (err) {
            console.error('Support error:', err);
            alert('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            <label className="label">Priority</label>
                                            <select
                                                className="input"
                                                value={priority}
                                                onChange={(e) => setPriority(e.target.value)}
                                            >
                                                <option value="LOW">Low</option>
                                                <option value="MEDIUM">Medium</option>
                                                <option value="HIGH">High</option>
                                                <option value="URGENT">Urgent</option>
                                            </select>
                                        </div>
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

                        {/* Tickets List */}
                        <div className="mt-12 space-y-6">
                            <h3 className="text-xl font-bold text-secondary-900">Your Recent Tickets</h3>
                            {tickets.length === 0 ? (
                                <div className="card-premium p-8 text-center text-secondary-500 italic">
                                    No support tickets found.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {tickets.map((ticket) => (
                                        <div key={ticket.id} className="card-premium p-6 hover:shadow-lg transition-shadow">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${ticket.priority === 'URGENT' ? 'bg-danger-100 text-danger-700' :
                                                            ticket.priority === 'HIGH' ? 'bg-warning-100 text-warning-700' :
                                                                'bg-secondary-100 text-secondary-700'
                                                            }`}>
                                                            {ticket.priority}
                                                        </span>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${ticket.status === 'OPEN' ? 'bg-success-100 text-success-700' : 'bg-secondary-200 text-secondary-800'
                                                            }`}>
                                                            {ticket.status.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-bold text-secondary-900">{ticket.subject}</h4>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-secondary-400 font-medium">#{ticket.id.split('-')[0].toUpperCase()}</p>
                                                    <p className="text-xs text-secondary-500 mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-secondary-600 line-clamp-2 mb-4">{ticket.description}</p>
                                            {ticket.chatRoomId && (
                                                <Link
                                                    href={`/dashboard/chat?roomId=${ticket.chatRoomId}`}
                                                    className="inline-flex items-center text-primary-600 font-bold text-sm hover:text-primary-700"
                                                >
                                                    View Conversation →
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
