import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-legacy';

export async function GET(req: NextRequest) {
    try {
        const decoded = await getAuthenticatedUser();
        if (!decoded || !['SUPER_ADMIN', 'MANAGER', 'FINANCE_ADMIN'].includes(decoded.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const subscriptions = await prisma.subscription.findMany({
            include: {
                customerProfile: true,
                items: {
                    include: {
                        journal: true,
                        plan: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Generate CSV
        const headers = ['ID', 'Customer', 'Email', 'Organization', 'Status', 'Total', 'Currency', 'Start Date', 'End Date', 'Items'];
        const rows = subscriptions.map(sub => [
            sub.id,
            sub.customerProfile.name,
            sub.customerProfile.primaryEmail,
            sub.customerProfile.organizationName || 'N/A',
            sub.status,
            sub.total,
            sub.currency,
            sub.startDate.toISOString().split('T')[0],
            sub.endDate.toISOString().split('T')[0],
            sub.items.map(item => `${item.journal.name} (${item.plan.planType})`).join('; ')
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="subscriptions-export-${Date.now()}.csv"`
            }
        });

    } catch (error: any) {
        console.error('Export Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
