import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { razorpay } from '@/lib/razorpay';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST() {
    try {
        const user = await getAuthenticatedUser();
        if (!user || !['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const lastSync = await prisma.razorpaySync.findFirst({
            where: { status: 'SUCCESS' },
            orderBy: { createdAt: 'desc' },
        });

        // Razorpay expects timestamp in seconds
        const from = lastSync ? Math.floor(lastSync.lastSyncAt.getTime() / 1000) : undefined;

        let payments: any;
        try {
            payments = await razorpay.payments.all({
                from,
                count: 100,
            });
        } catch (err: any) {
            console.error('Razorpay API failure:', err);
            throw new Error(`Razorpay API Error: ${err.message}`);
        }

        let syncedCount = 0;
        const currentSyncAt = new Date();

        if (payments && payments.items) {
            for (const rpPayment of payments.items) {
                const companyId = rpPayment.notes?.company_id || rpPayment.notes?.companyId;

                const existing = await prisma.payment.findUnique({
                    where: { razorpayPaymentId: rpPayment.id },
                });

                if (existing) continue;

                await prisma.payment.create({
                    data: {
                        amount: rpPayment.amount / 100,
                        paymentMethod: rpPayment.method,
                        paymentDate: new Date(rpPayment.created_at * 1000),
                        razorpayPaymentId: rpPayment.id,
                        razorpayOrderId: rpPayment.order_id,
                        status: rpPayment.status,
                        notes: rpPayment.notes ? JSON.stringify(rpPayment.notes) : null,
                        companyId: companyId || null,
                    },
                });
                syncedCount++;
            }
        }

        await prisma.razorpaySync.create({
            data: {
                lastSyncAt: currentSyncAt,
                status: 'SUCCESS',
                syncedCount,
            },
        });

        return NextResponse.json({ success: true, syncedCount });
    } catch (error: any) {
        console.error('Razorpay Sync Error:', error);
        await prisma.razorpaySync.create({
            data: {
                lastSyncAt: new Date(),
                status: 'FAILED',
                error: error.message,
            },
        });
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        const user = await getAuthenticatedUser();
        if (!user || !['SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const lastSync = await prisma.razorpaySync.findFirst({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ lastSync });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
