'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface DashboardLayoutProps {
    children: React.ReactNode;
    userRole?: string;
}

export default function DashboardLayout({ children, userRole = 'CUSTOMER' }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notifications, setNotifications] = useState<any[]>([]);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        fetchNotifications();
        // Polling for notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await fetch('/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error('Fetch notifications error:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Mark read error:', err);
        }
    };

    const handleNotificationClick = async (notification: any) => {
        try {
            const token = localStorage.getItem('token');
            if (!notification.isRead) {
                await fetch(`/api/notifications/${notification.id}`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setNotifications(notifications.map(n =>
                    n.id === notification.id ? { ...n, isRead: true } : n
                ));
            }
            if (notification.link) {
                router.push(notification.link);
            }
        } catch (err) {
            console.error('Notification click error:', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    // Navigation items based on role
    const getNavigationItems = () => {
        const commonItems = [
            { name: 'Dashboard', href: '/dashboard', icon: '📊' },
            { name: 'Chat', href: '/dashboard/chat', icon: '💬' },
            { name: 'Profile', href: '/dashboard/profile', icon: '👤' },
        ];

        const roleSpecificItems: Record<string, any[]> = {
            SUPER_ADMIN: [
                { name: 'Companies', href: '/dashboard/companies', icon: '🏢' },
                { name: 'Users', href: '/dashboard/users', icon: '👥' },
                { name: 'Customers', href: '/dashboard/customers', icon: '🙍‍♂️' },
                { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: '📋' },
                { name: 'Tickets', href: '/dashboard/tickets', icon: '🎫' },
                { name: 'Invoices', href: '/dashboard/invoices', icon: '🧾' },
                { name: 'Journals', href: '/dashboard/journals', icon: '📰' },
                { name: 'Follow Ups', href: '/dashboard/follow-ups', icon: '🗓️' },
                { name: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
                { name: 'AI Predictions', href: '/dashboard/ai-insights', icon: '🤖' },
                { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
            ],
            ADMIN: [
                { name: 'Company', href: '/dashboard/company', icon: '🏢' },
                { name: 'Users', href: '/dashboard/users', icon: '👥' },
                { name: 'Customers', href: '/dashboard/customers', icon: '🙍‍♂️' },
                { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: '📋' },
                { name: 'Tickets', href: '/dashboard/tickets', icon: '🎫' },
                { name: 'Invoices', href: '/dashboard/invoices', icon: '🧾' },
                { name: 'Follow Ups', href: '/dashboard/follow-ups', icon: '🗓️' },
                { name: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
            ],
            MANAGER: [
                { name: 'Customers', href: '/dashboard/customers', icon: '🙍‍♂️' },
                { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: '📋' },
                { name: 'Tickets', href: '/dashboard/tickets', icon: '🎫' },
                { name: 'Invoices', href: '/dashboard/invoices', icon: '🧾' },
                { name: 'Team', href: '/dashboard/team', icon: '👥' },
                { name: 'Follow Ups', href: '/dashboard/follow-ups', icon: '🗓️' },
                { name: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
                { name: 'AI Predictions', href: '/dashboard/ai-insights', icon: '🤖' },
            ],
            TEAM_LEADER: [
                { name: 'Customers', href: '/dashboard/customers', icon: '🙍‍♂️' },
                { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: '📋' },
                { name: 'Team', href: '/dashboard/team', icon: '👥' },
                { name: 'Tasks', href: '/dashboard/tasks', icon: '✅' },
                { name: 'Follow Ups', href: '/dashboard/follow-ups', icon: '🗓️' },
            ],
            SALES_EXECUTIVE: [
                { name: 'My Customers', href: '/dashboard/customers', icon: '🏢' },
                { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: '📋' },
                { name: 'Tickets', href: '/dashboard/tickets', icon: '🎫' },
                { name: 'Invoices', href: '/dashboard/invoices', icon: '🧾' },
                { name: 'Tasks', href: '/dashboard/tasks', icon: '✅' },
                { name: 'Follow Ups', href: '/dashboard/follow-ups', icon: '🗓️' },
                { name: 'Communications', href: '/dashboard/communications', icon: '💬' },
                { name: 'AI Predictions', href: '/dashboard/ai-insights', icon: '🤖' },
            ],
            FINANCE_ADMIN: [
                { name: 'Invoices', href: '/dashboard/invoices', icon: '🧾' },
                { name: 'Payments', href: '/dashboard/payments', icon: '💳' },
                { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: '📋' },
                { name: 'AI Predictions', href: '/dashboard/ai-insights', icon: '🤖' },
            ],
            AGENCY: [
                { name: 'My Clients', href: '/dashboard/clients', icon: '🏢' },
                { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: '📋' },
                { name: 'Invoices', href: '/dashboard/invoices', icon: '🧾' },
                { name: 'Commission', href: '/dashboard/commission', icon: '💰' },
                { name: 'AI Predictions', href: '/dashboard/ai-insights', icon: '🤖' },
            ],
            CUSTOMER: [
                { name: 'Browse Journals', href: '/dashboard/subscriptions/new', icon: '📖' },
                { name: 'My Subscriptions', href: '/dashboard/subscriptions', icon: '📋' },
                { name: 'Invoices', href: '/dashboard/invoices', icon: '🧾' },
                { name: 'Support', href: '/dashboard/support', icon: '❓' },
            ],
        };

        return [...commonItems, ...(roleSpecificItems[userRole] || roleSpecificItems.CUSTOMER)];
    };

    const navigationItems = getNavigationItems();

    return (
        <div className="min-h-screen bg-secondary-50">
            {/* Top Navigation Bar */}
            <nav className="bg-white border-b border-secondary-200 fixed w-full z-30 top-0">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            {/* Sidebar Toggle */}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="text-secondary-500 hover:text-secondary-700 focus:outline-none lg:hidden"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            {/* Logo */}
                            <Link href="/dashboard" className="flex items-center ml-4 lg:ml-0">
                                <h1 className="text-xl font-bold text-gradient">STM Customer</h1>
                            </Link>
                        </div>

                        {/* Right side - User menu */}
                        <div className="flex items-center space-x-4">
                            {/* Notifications */}
                            <div className="relative group">
                                <button className="text-secondary-500 hover:text-secondary-700 relative p-2 rounded-xl hover:bg-secondary-100 transition-colors">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    {notifications.filter(n => !n.isRead).length > 0 && (
                                        <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-danger-500 ring-2 ring-white"></span>
                                    )}
                                </button>

                                {/* Notifications Dropdown */}
                                <div className="hidden group-hover:block absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-secondary-200 py-2 z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-secondary-100 flex justify-between items-center bg-secondary-50/50">
                                        <h3 className="text-sm font-bold text-secondary-900">Notifications</h3>
                                        {notifications.some(n => !n.isRead) && (
                                            <button
                                                onClick={markAllAsRead}
                                                className="text-[10px] font-bold text-primary-600 uppercase hover:text-primary-700"
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-secondary-500 italic text-sm">
                                                No notifications yet.
                                            </div>
                                        ) : (
                                            notifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => handleNotificationClick(n)}
                                                    className={`px-4 py-3 hover:bg-secondary-50 cursor-pointer transition-colors border-b border-secondary-50 last:border-0 ${!n.isRead ? 'bg-primary-50/30' : ''}`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <p className={`text-xs ${!n.isRead ? 'font-bold text-secondary-900' : 'text-secondary-700'}`}>{n.title}</p>
                                                        <span className="text-[10px] text-secondary-400">
                                                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-secondary-500 mt-1 line-clamp-2">{n.message}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* User Dropdown */}
                            <div className="relative group">
                                <button className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-secondary-100 transition-colors">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold text-sm shadow-lg">
                                        {userRole.charAt(0)}
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-semibold text-secondary-900 leading-tight">
                                            {typeof window !== 'undefined' && localStorage.getItem('user')
                                                ? JSON.parse(localStorage.getItem('user') || '{}').company?.name || userRole.replace('_', ' ')
                                                : userRole.replace('_', ' ')}
                                        </p>
                                        <p className="text-xs text-secondary-500">
                                            {typeof window !== 'undefined' && localStorage.getItem('user')
                                                ? JSON.parse(localStorage.getItem('user') || '{}').email?.split('@')[0]
                                                : 'User'}
                                        </p>
                                    </div>
                                    <svg className="h-4 w-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu - Enhanced */}
                                <div className="hidden group-hover:block absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-secondary-200 py-2 z-50">
                                    {/* User Info Header */}
                                    <div className="px-4 py-3 border-b border-secondary-100">
                                        <p className="text-sm font-bold text-secondary-900">
                                            {typeof window !== 'undefined' && localStorage.getItem('user')
                                                ? JSON.parse(localStorage.getItem('user') || '{}').email
                                                : 'user@example.com'}
                                        </p>
                                        <p className="text-xs text-secondary-500 mt-1">
                                            Role: <span className="font-semibold text-primary-600">{userRole.replace('_', ' ')}</span>
                                        </p>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-2">
                                        <Link
                                            href="/dashboard/profile"
                                            className="flex items-center px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                                        >
                                            <svg className="h-5 w-5 mr-3 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Profile Settings
                                        </Link>

                                        <Link
                                            href="/dashboard"
                                            className="flex items-center px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                                        >
                                            <svg className="h-5 w-5 mr-3 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Preferences
                                        </Link>
                                    </div>

                                    {/* Logout Button - Prominent */}
                                    <div className="border-t border-secondary-100 pt-2 px-2 pb-2">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-danger-500 to-danger-600 hover:from-danger-600 hover:to-danger-700 rounded-lg transition-all shadow-md hover:shadow-lg"
                                        >
                                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-16 h-full bg-white border-r border-secondary-200 transition-all duration-300 z-20 ${sidebarOpen ? 'w-64' : 'w-0 lg:w-20'
                    }`}
            >
                <nav className="p-4 space-y-2 h-full flex flex-col">
                    <div className="flex-1">
                        {navigationItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-primary-100 text-primary-700 font-semibold'
                                        : 'text-secondary-700 hover:bg-secondary-100'
                                        }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span className={`${sidebarOpen ? 'block' : 'hidden lg:hidden'}`}>
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Logout Button in Sidebar */}
                    <div className={`border-t border-secondary-200 pt-4 ${sidebarOpen ? 'block' : 'hidden lg:hidden'}`}>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-danger-600 hover:bg-danger-50 transition-colors font-medium"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Logout</span>
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main
                className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
                    }`}
            >
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
