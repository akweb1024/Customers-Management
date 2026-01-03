import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { razorpay } from '@/lib/razorpay';

export async function GET(req: Request) {
    // Check for authorization (Optional: CRON_SECRET)
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const lastSync = await prisma.razorpaySync.findFirst({
            where: { status: 'SUCCESS' },
            orderBy: { createdAt: 'desc' },
        });

        // Check if 1 hour has passed
        const oneHourAgo = new Date(Date.now() - 3600000);
        if (lastSync && lastSync.lastSyncAt > oneHourAgo) {
            return NextResponse.json({ message: 'Sync not needed yet', lastSync: lastSync.lastSyncAt });
        }

        const from = lastSync ? Math.floor(lastSync.lastSyncAt.getTime() / 1000) : undefined;

        let payments: any;
        try {
            payments = await razorpay.payments.all({
                from,
                count: 100,
            });
        } catch (err: any) {
            console.error('Razorpay API failure:', err);
            return NextResponse.json({ error: 'Razorpay API Error' }, { status: 500 });
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

        return NextResponse.json({ success: true, syncedCount, nextSyncScheduled: new Date(Date.now() + 3600000) });
    } catch (error: any) {
        console.error('Automated Razorpay Sync Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
