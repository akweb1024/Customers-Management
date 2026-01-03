import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        const { id: courseId } = await props.params;
        const user = await getAuthenticatedUser();
        if (!user || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { title, order } = body;

        const module = await (prisma as any).courseModule.create({
            data: {
                courseId,
                title,
                order: order || 0
            }
        });

        return NextResponse.json(module);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
