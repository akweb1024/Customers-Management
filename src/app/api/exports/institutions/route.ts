import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-legacy';

export async function GET(req: NextRequest) {
    try {
        const decoded = await getAuthenticatedUser();
        if (!decoded || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(decoded.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const institutions = await prisma.institution.findMany({
            where: decoded.role === 'SUPER_ADMIN' ? {} : { companyId: decoded.companyId },
            include: {
                _count: {
                    select: {
                        customers: true,
                        subscriptions: true,
                        communications: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        // Generate CSV
        const headers = [
            'ID', 'Name', 'Code', 'Type', 'Category', 'Email', 'Phone',
            'Website', 'Country', 'State', 'City', 'IP Range',
            'Total Students', 'Total Faculty', 'Customer Count', 'Sub Count'
        ];

        const rows = institutions.map(inst => [
            inst.id,
            inst.name,
            inst.code,
            inst.type,
            inst.category || 'N/A',
            inst.primaryEmail || 'N/A',
            inst.primaryPhone || 'N/A',
            inst.website || 'N/A',
            inst.country,
            inst.state || 'N/A',
            inst.city || 'N/A',
            inst.ipRange || 'N/A',
            inst.totalStudents || 0,
            inst.totalFaculty || 0,
            inst._count.customers,
            inst._count.subscriptions
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="institutions-export-${Date.now()}.csv"`
            }
        });

    } catch (error: any) {
        console.error('Institution Export Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
