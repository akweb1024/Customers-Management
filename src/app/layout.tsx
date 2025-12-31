import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'STM Customer Management System',
    description: 'Centralized platform for managing journal subscriptions, customers, and sales channels',
};

import { ThemeProvider } from '@/components/theme/ThemeProvider';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="antialiased" suppressHydrationWarning>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
