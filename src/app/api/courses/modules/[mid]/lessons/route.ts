import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(req: NextRequest, props: { params: Promise<{ mid: string }> }) {
    try {
        const { mid: moduleId } = await props.params;
        const user = await getAuthenticatedUser();
        if (!user || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { title, type, content, videoUrl, duration, order } = body;

        const lesson = await (prisma as any).courseLesson.create({
            data: {
                moduleId,
                title,
                type: type || 'TEXT',
                content,
                videoUrl,
                duration: duration || 0,
                order: order || 0
            }
        });

        return NextResponse.json(lesson);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
