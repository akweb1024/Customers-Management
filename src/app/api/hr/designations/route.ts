import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const decoded = await getAuthenticatedUser();
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const companyId = (decoded as any).companyId;
        if (!companyId) return NextResponse.json({ error: 'No company context' }, { status: 400 });

        const designations = await prisma.designation.findMany({
            where: { companyId },
            orderBy: { level: 'asc' }
        });

        return NextResponse.json(designations);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const decoded = await getAuthenticatedUser();
        if (!decoded || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(decoded.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const companyId = (decoded as any).companyId;
        const body = await req.json();
        const { name, code, jobDescription, kra, expectedExperience, promotionWaitPeriod, incrementGuidelines, level } = body;

        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

        const designation = await prisma.designation.create({
            data: {
                companyId,
                name,
                code,
                jobDescription,
                kra,
                expectedExperience: parseFloat(expectedExperience) || 0,
                promotionWaitPeriod: parseInt(promotionWaitPeriod) || 12,
                incrementGuidelines,
                level: parseInt(level) || 1
            }
        });

        return NextResponse.json(designation);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
