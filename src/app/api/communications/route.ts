import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        // 1. Verify Authentication
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded || !['SUPER_ADMIN', 'SALES_EXECUTIVE', 'MANAGER', 'FINANCE_ADMIN'].includes(decoded.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. Parse Body
        const body = await req.json();
        const { customerProfileId, channel, subject, notes, outcome, nextFollowUpDate } = body;

        if (!customerProfileId || !channel || !subject || !notes) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 3. Create Log
        const log = await prisma.communicationLog.create({
            data: {
                customerProfileId,
                userId: decoded.id,
                channel,
                subject,
                notes,
                outcome,
                nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
                date: new Date()
            }
        });

        // 4. Log Audit
        await prisma.auditLog.create({
            data: {
                userId: decoded.id,
                action: 'create',
                entity: 'communication_log',
                entityId: log.id,
                changes: JSON.stringify(body)
            }
        });

        return NextResponse.json(log);

    } catch (error: any) {
        console.error('Communication Log Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.split(' ')[1];
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded || !['SUPER_ADMIN', 'MANAGER', 'SALES_EXECUTIVE'].includes(decoded.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            prisma.communicationLog.findMany({
                skip,
                take: limit,
                orderBy: { date: 'desc' },
                include: {
                    customerProfile: {
                        select: { name: true, organizationName: true, customerType: true }
                    },
                    user: {
                        select: { role: true }
                    }
                }
            }),
            prisma.communicationLog.count()
        ]);

        return NextResponse.json({
            data: logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error: any) {
        console.error('Fetch Communications Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
