import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizedRoute } from '@/lib/middleware-auth';
import { createErrorResponse } from '@/lib/api-utils';

// GET all financial records for the company
export const GET = authorizedRoute(
    ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'FINANCE_ADMIN'],
    async (req: NextRequest, user) => {
        try {
            const { searchParams } = new URL(req.url);
            const type = searchParams.get('type');
            const category = searchParams.get('category');
            const startDate = searchParams.get('startDate');
            const endDate = searchParams.get('endDate');

            const where: any = {
                companyId: user.companyId || undefined
            };

            if (type) where.type = type;
            if (category) where.category = category;
            if (startDate || endDate) {
                where.date = {};
                if (startDate) where.date.gte = new Date(startDate);
                if (endDate) where.date.lte = new Date(endDate);
            }

            const records = await prisma.financialRecord.findMany({
                where,
                orderBy: { date: 'desc' },
                include: {
                    createdByUser: {
                        select: { name: true, email: true }
                    }
                }
            });

            return NextResponse.json(records);
        } catch (error) {
            return createErrorResponse(error);
        }
    }
);

// POST a new financial record
export const POST = authorizedRoute(
    ['SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN'],
    async (req: NextRequest, user) => {
        try {
            const body = await req.json();
            const { type, category, amount, currency, date, description, status, paymentMethod, referenceId } = body;

            if (!type || !category || !amount) {
                return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
            }

            const record = await prisma.financialRecord.create({
                data: {
                    type,
                    category,
                    amount: parseFloat(amount),
                    currency: currency || 'INR',
                    date: date ? new Date(date) : new Date(),
                    description,
                    status: status || 'COMPLETED',
                    paymentMethod,
                    referenceId,
                    companyId: user.companyId,
                    createdByUserId: user.id
                }
            });

            return NextResponse.json(record);
        } catch (error) {
            return createErrorResponse(error);
        }
    }
);
