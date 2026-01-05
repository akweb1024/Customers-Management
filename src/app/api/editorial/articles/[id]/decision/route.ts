import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getAuthenticatedUser();
        const { id } = await params;

        if (!user || !['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EDITOR'].includes(user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { status } = await req.json();

        if (!['ACCEPTED', 'REJECTED', 'REVISION_REQUESTED', 'PUBLISHED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const article = await prisma.article.update({
            where: { id },
            data: {
                status,
                ...(status === 'ACCEPTED' ? { acceptanceDate: new Date() } : {}),
                ...(status === 'PUBLISHED' ? { publicationDate: new Date() } : {})
            }
        });

        // Notify the first author (simulated since authors aren't necessarily Users in this schema yet, 
        // but we can log it or notify the editor who submitted it if we track submitter)

        return NextResponse.json({ success: true, article });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
