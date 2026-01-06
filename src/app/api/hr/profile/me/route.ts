import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const profile = await prisma.employeeProfile.findFirst({
            where: { userId: user.id },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        role: true,
                        companies: { select: { name: true, website: true, address: true, logoUrl: true } }
                    }
                },
                documents: true,
                digitalDocuments: true
            }
        });

        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

        return NextResponse.json(profile);
    } catch (error) {
        console.error('Fetch My Profile Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
