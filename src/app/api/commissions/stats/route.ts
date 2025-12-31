import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const decoded = await getAuthenticatedUser();
        if (!decoded || !['AGENCY', 'SUPER_ADMIN', 'FINANCE_ADMIN'].includes(decoded.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        let agencyId: string | undefined;

        if (decoded.role === 'AGENCY') {
            const profile = await prisma.customerProfile.findUnique({
                where: { userId: decoded.id },
                include: { agencyDetails: true }
            });
            if (!profile || !profile.agencyDetails) {
                return NextResponse.json({
                    totalEarned: 0,
                    pendingPayout: 0,
                    rate: 10,
                    recentPayouts: []
                });
            }
            agencyId = profile.agencyDetails.id;
        }

        // Calculate commissions
        // Rule: 10% commission on all ACTIVE subscriptions for this agency
        const where: any = {
            salesChannel: 'AGENCY',
            status: 'ACTIVE'
        };
        if (agencyId) where.agencyId = agencyId;

        const activeSubscriptions = await prisma.subscription.findMany({
            where,
            select: { total: true }
        });

        const totalValue = activeSubscriptions.reduce((acc, sub) => acc + sub.total, 0);
        const commissionRate = 10; // 10% default
        const totalEarned = totalValue * (commissionRate / 100);

        // For now, let's assume all earned is pending payout since we don't have a Payout model yet
        // In a real app, you'd subtract already paid amounts

        return NextResponse.json({
            totalEarned,
            pendingPayout: totalEarned, // Assumption for demo
            rate: commissionRate,
            payoutsCount: 0
        });

    } catch (error: any) {
        console.error('Commission API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
