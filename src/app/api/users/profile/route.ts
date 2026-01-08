import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-legacy';

export async function GET(req: NextRequest) {
    try {
        const decoded = await getAuthenticatedUser();
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                role: true,
                theme: true,
                notificationsEnabled: true,
                lastLogin: true,
                createdAt: true,
                company: true,
                customerProfile: true
            }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        return NextResponse.json(user);
    } catch (error: any) {
        console.error('Profile GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const decoded = await getAuthenticatedUser();
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { theme, notificationsEnabled } = body;

        const updatedUser = await prisma.user.update({
            where: { id: decoded.id },
            data: {
                ...(theme && { theme }),
                ...(notificationsEnabled !== undefined && { notificationsEnabled })
            }
        });

        return NextResponse.json({
            success: true,
            theme: updatedUser.theme,
            notificationsEnabled: updatedUser.notificationsEnabled
        });
    } catch (error: any) {
        console.error('Profile PATCH Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
