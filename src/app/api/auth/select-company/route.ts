import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, generateToken } from '@/lib/auth';


// Removed force-dynamic to let Next.js decide


export async function POST(req: NextRequest) {
    try {
        const decoded = await getAuthenticatedUser();
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { companyId } = body;

        if (!companyId) {
            return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
        }

        // Verify access
        let hasAccess = false;
        if (decoded.role === 'SUPER_ADMIN') {
            const company = await prisma.company.findUnique({ where: { id: companyId } });
            if (company) hasAccess = true;
        } else {
            const userWithCompanies = await prisma.user.findUnique({
                where: { id: decoded.id },
                include: { companies: { where: { id: companyId } } }
            });
            if (userWithCompanies?.companies.length || userWithCompanies?.companyId === companyId) {
                hasAccess = true;
            }
        }

        if (!hasAccess) {
            return NextResponse.json({ error: 'Forbidden: No access to this company' }, { status: 403 });
        }

        // Update active company in User model (optional, but good for consistency)
        await prisma.user.update({
            where: { id: decoded.id },
            data: { companyId }
        });

        // Generate new token with updated companyId
        const newToken = generateToken({
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            companyId: companyId
        });

        return NextResponse.json({
            success: true,
            token: newToken,
            message: 'Company selected successfully'
        });

    } catch (error: any) {
        console.error('Select Company Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
