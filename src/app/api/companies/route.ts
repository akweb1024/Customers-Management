import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';



export async function GET(req: NextRequest) {
    try {
        const decoded = await getAuthenticatedUser();
        // Only SUPER_ADMIN can see all companies (multi-tenant future proofing)
        // Or if we just have one company, internal admins can see it
        if (!decoded || !['SUPER_ADMIN', 'ADMIN'].includes(decoded.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const companies = await prisma.company.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { users: true }
                }
            }
        });

        return NextResponse.json(companies);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const decoded = await getAuthenticatedUser();
        if (!decoded || decoded.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { name, address, phone, email, website } = body;

        if (!name) {
            return NextResponse.json({ error: 'Company Name is required' }, { status: 400 });
        }

        const company = await prisma.company.create({
            data: {
                name,
                address,
                phone,
                email,
                website
            }
        });

        return NextResponse.json(company, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
