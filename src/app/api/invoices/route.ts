import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { InvoiceStatus } from '@/types';

export async function GET(req: NextRequest) {
    try {
        // 1. Verify Authentication
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || !decoded.role) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // 2. Parse Query Parameters
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status') as InvoiceStatus | null;
        const search = searchParams.get('search') || '';

        const skip = (page - 1) * limit;

        // 3. Build Filter
        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { invoiceNumber: { contains: search } },
                { subscription: { customerProfile: { name: { contains: search } } } },
                { subscription: { customerProfile: { organizationName: { contains: search } } } }
            ];
        }

        // Role-based filtering: Customers only see their own invoices
        if (decoded.role === 'CUSTOMER') {
            where.subscription = {
                customerProfile: {
                    userId: decoded.id
                }
            };
        }

        // 4. Fetch Invoices
        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    subscription: {
                        include: {
                            customerProfile: {
                                select: {
                                    id: true,
                                    name: true,
                                    organizationName: true
                                }
                            }
                        }
                    }
                }
            }),
            prisma.invoice.count({ where })
        ]);

        return NextResponse.json({
            data: invoices,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error: any) {
        console.error('Invoices API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
