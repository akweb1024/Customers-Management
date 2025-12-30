import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const decoded = await getAuthenticatedUser();
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const body = await req.json();
        const { status, priority, title, description, dueDate } = body;

        // Verify ownership
        const existing = await prisma.task.findUnique({
            where: { id: id }
        });

        if (!existing) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        if (existing.userId !== decoded.id && decoded.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const task = await prisma.task.update({
            where: { id: id },
            data: {
                ...(status && { status }),
                ...(priority && { priority }),
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(dueDate && { dueDate: new Date(dueDate) })
            }
        });

        return NextResponse.json(task);

    } catch (error: any) {
        console.error('Update Task Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const decoded = await getAuthenticatedUser();
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const existing = await prisma.task.findUnique({
            where: { id: id }
        });

        if (!existing) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        if (existing.userId !== decoded.id && decoded.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.task.delete({
            where: { id: id }
        });

        return NextResponse.json({ message: 'Task deleted' });

    } catch (error: any) {
        console.error('Delete Task Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
