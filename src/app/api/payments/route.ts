import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.split(' ')[1];
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded || !['SUPER_ADMIN', 'FINANCE_ADMIN', 'MANAGER'].includes(decoded.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                skip,
                take: limit,
                orderBy: { paymentDate: 'desc' },
                include: {
                    invoice: {
                        include: {
                            subscription: {
                                include: {
                                    customerProfile: {
                                        select: { name: true, organizationName: true }
                                    }
                                }
                            }
                        }
                    }
                }
            }),
            prisma.payment.count()
        ]);

        return NextResponse.json({
            data: payments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error: any) {
        console.error('Fetch Payments Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
