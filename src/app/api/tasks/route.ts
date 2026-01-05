import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const decoded = await getAuthenticatedUser();
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const tasks = await prisma.task.findMany({
            where: { userId: decoded.id },
            orderBy: [
                { status: 'asc' },
                { dueDate: 'asc' }
            ]
        });

        return NextResponse.json(tasks);

    } catch (error: any) {
        console.error('Fetch Tasks Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const decoded = await getAuthenticatedUser();
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const body = await req.json();
        const { title, description, dueDate, priority, relatedCustomerId, relatedSubscriptionId } = body;

        if (!title || !dueDate) {
            return NextResponse.json({ error: 'Title and Due Date are required' }, { status: 400 });
        }

        const task = await prisma.task.create({
            data: {
                userId: decoded.id,
                title,
                description,
                dueDate: new Date(dueDate),
                priority: priority || 'MEDIUM',
                status: 'PENDING',
                relatedCustomerId,
                relatedSubscriptionId,
                companyId: (decoded as any).companyId
            }
        });

        return NextResponse.json(task);

    } catch (error: any) {
        console.error('Create Task Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
