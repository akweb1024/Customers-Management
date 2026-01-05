import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const companyId = searchParams.get('companyId');

        let filter: any = {};

        // RBAC & Context
        const targetCompanyId = companyId || user.companyId;
        if (targetCompanyId) {
            filter.companyId = targetCompanyId;
        } else if (!['SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN'].includes(user.role)) {
            return NextResponse.json([]); // Non-admins must have a company context
        }

        const payments = await prisma.payment.findMany({
            where: filter,
            include: {
                company: {
                    select: { name: true }
                },
                invoice: {
                    select: { invoiceNumber: true }
                }
            },
            orderBy: { paymentDate: 'desc' },
        });

        return NextResponse.json(payments);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
