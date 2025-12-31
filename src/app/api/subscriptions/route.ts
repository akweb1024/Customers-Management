import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { SubscriptionStatus } from '@/types';

export async function GET(req: NextRequest) {
    try {
        // 1. Verify Authentication
        const decoded = await getAuthenticatedUser();
        if (!decoded || !decoded.role) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // 2. Parse Query Parameters
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status') as SubscriptionStatus | null;
        const search = searchParams.get('search') || '';

        const skip = (page - 1) * limit;

        // 3. Build Filter
        const where: any = {};
        const userCompanyId = (decoded as any).companyId;

        // Multi-tenancy: Restrict to company if not SUPER_ADMIN
        if (decoded.role !== 'SUPER_ADMIN' && userCompanyId) {
            where.companyId = userCompanyId;
        }

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { customerProfile: { name: { contains: search, mode: 'insensitive' } } },
                { customerProfile: { organizationName: { contains: search, mode: 'insensitive' } } },
                { id: { contains: search, mode: 'insensitive' } },
                { items: { some: { journal: { name: { contains: search, mode: 'insensitive' } } } } },
                { items: { some: { journal: { issnPrint: { contains: search, mode: 'insensitive' } } } } },
                { items: { some: { journal: { issnOnline: { contains: search, mode: 'insensitive' } } } } }
            ];
        }

        // Special handling for CUSTOMER role - they only see their own subscriptions
        if (decoded.role === 'CUSTOMER') {
            const customerProfile = await prisma.customerProfile.findUnique({
                where: { userId: decoded.id }
            });
            if (!customerProfile) {
                return NextResponse.json({ data: [], pagination: { total: 0 } });
            }
            where.customerProfileId = customerProfile.id;
        }

        // 4. Fetch Subscriptions
        const [subscriptions, total] = await Promise.all([
            prisma.subscription.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    customerProfile: {
                        select: {
                            id: true,
                            name: true,
                            organizationName: true,
                            primaryEmail: true
                        }
                    },
                    items: {
                        include: {
                            journal: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            },
                            plan: {
                                select: {
                                    id: true,
                                    planType: true,
                                    format: true
                                }
                            }
                        }
                    }
                }
            }),
            prisma.subscription.count({ where })
        ]);

        return NextResponse.json({
            data: subscriptions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error: any) {
        console.error('Subscription API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
