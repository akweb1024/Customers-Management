import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizedRoute } from '@/lib/middleware-auth';
import { createErrorResponse } from '@/lib/api-utils';

export const PATCH = authorizedRoute(
    ['SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN'],
    async (req: NextRequest, user, { params }) => {
        try {
            const { id } = await params;
            const body = await req.json();

            // Verify ownership
            const existing = await prisma.financialRecord.findUnique({
                where: { id }
            });

            if (!existing) return NextResponse.json({ error: 'Record not found' }, { status: 404 });
            if (user.role !== 'SUPER_ADMIN' && existing.companyId !== user.companyId) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            const updated = await prisma.financialRecord.update({
                where: { id },
                data: {
                    ...body,
                    // Ensure amount is parsed if provided
                    amount: body.amount ? parseFloat(body.amount) : undefined,
                    date: body.date ? new Date(body.date) : undefined
                }
            });

            return NextResponse.json(updated);
        } catch (error) {
            return createErrorResponse(error);
        }
    }
);

export const DELETE = authorizedRoute(
    ['SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN'],
    async (req: NextRequest, user, { params }) => {
        try {
            const { id } = await params;

            const existing = await prisma.financialRecord.findUnique({
                where: { id }
            });

            if (!existing) return NextResponse.json({ error: 'Record not found' }, { status: 404 });
            if (user.role !== 'SUPER_ADMIN' && existing.companyId !== user.companyId) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            await prisma.financialRecord.delete({
                where: { id }
            });

            return NextResponse.json({ success: true });
        } catch (error) {
            return createErrorResponse(error);
        }
    }
);
