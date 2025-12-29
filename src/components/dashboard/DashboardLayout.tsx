'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface DashboardLayoutProps {
    children: React.ReactNode;
    userRole?: string;
}

export default function DashboardLayout({ children, userRole = 'CUSTOMER' }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    // Navigation items based on role
    const getNavigationItems = () => {
        const commonItems = [
            { name: 'Dashboard', href: '/dashboard', icon: '📊' },
            { name: 'Profile', href: '/dashboard/profile', icon: '👤' },
        ];

        const roleSpecificItems: Record<string, any[]> = {
            SUPER_ADMIN: [
                { name: 'Users', href: '/dashboard/users', icon: '👥' },
                { name: 'Customers', href: '/dashboard/customers', icon: '🏢' },
                { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: '📋' },
                { name: 'Invoices', href: '/dashboard/invoices', icon: '🧾' },
                { name: 'Journals', href: '/dashboard/journals', icon: '📰' },
                { name: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
                { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
            ],
            MANAGER: [
                { name: 'Customers', href: '/dashboard/customers', icon: '🏢' },
                { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: '📋' },
                { name: 'Invoices', href: '/dashboard/invoices', icon: '🧾' },
                { name: 'Team', href: '/dashboard/team', icon: '👥' },
                { name: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
            ],
            SALES_EXECUTIVE: [
                { name: 'My Customers', href: '/dashboard/customers', icon: '🏢' },
                { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: '📋' },
                { name: 'Invoices', href: '/dashboard/invoices', icon: '🧾' },
                { name: 'Tasks', href: '/dashboard/tasks', icon: '✅' },
                { name: 'Communications', href: '/dashboard/communications', icon: '💬' },
            ],
            FINANCE_ADMIN: [
                { name: 'Invoices', href: '/dashboard/invoices', icon: '🧾' },
                { name: 'Payments', href: '/dashboard/payments', icon: '💳' },
                { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: '📋' },
            ],
            AGENCY: [
                { name: 'My Clients', href: '/dashboard/clients', icon: '🏢' },
                { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: '📋' },
                { name: 'Invoices', href: '/dashboard/invoices', icon: '🧾' },
                { name: 'Commission', href: '/dashboard/commission', icon: '💰' },
            ],
            CUSTOMER: [
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
                            <button className="text-secondary-500 hover:text-secondary-700 relative">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-danger-500"></span>
                            </button>

                            {/* User Dropdown */}
                            <div className="relative group">
                                <button className="flex items-center space-x-2 text-secondary-700 hover:text-secondary-900">
                                    <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold">
                                        {userRole.charAt(0)}
                                    </div>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-premium border border-secondary-200 py-2">
                                    <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50">
                                        Profile Settings
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-danger-600 hover:bg-danger-50"
                                    >
                                        Logout
                                    </button>
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
                <nav className="p-4 space-y-2">
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
