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
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const notification = await (prisma as any).notification.update({
            where: { id, userId: decoded.id },
            data: { isRead: true }
        });

        return NextResponse.json(notification);
    } catch (error: any) {
        console.error('Notification PATCH Error:', error);
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
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await (prisma as any).notification.delete({
            where: { id, userId: decoded.id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Notification DELETE Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
