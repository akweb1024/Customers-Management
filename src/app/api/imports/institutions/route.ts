import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-legacy';
import { InstitutionType } from '@prisma/client';

export async function POST(req: NextRequest) {
    try {
        const decoded = await getAuthenticatedUser();
        if (!decoded || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(decoded.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { data } = await req.json();

        if (!Array.isArray(data)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        let createdCount = 0;
        let skippedCount = 0;

        for (const rawItem of data) {
            const item: any = {};
            Object.keys(rawItem).forEach(key => {
                item[key.toLowerCase().replace(/\s/g, '').replace(/[#/]/g, '')] = rawItem[key];
            });

            const name = item.name || item.institutionname;
            const code = item.code || item.shortname;

            if (!name || !code) {
                skippedCount++;
                continue;
            }

            // Check if institution code already exists
            const existing = await prisma.institution.findUnique({ where: { code } });
            if (existing) {
                skippedCount++;
                continue;
            }

            const typeStr = (item.type || 'University').toUpperCase().replace(/\s/g, '_');
            const type = (Object.values(InstitutionType) as string[]).includes(typeStr)
                ? (typeStr as InstitutionType)
                : InstitutionType.UNIVERSITY;

            await prisma.institution.create({
                data: {
                    name,
                    code,
                    type,
                    category: item.category,
                    primaryEmail: item.email || item.primaryemail,
                    primaryPhone: item.phone || item.primaryphone,
                    website: item.website,
                    country: item.country || 'India',
                    state: item.state,
                    city: item.city,
                    address: item.address,
                    pincode: item.pincode || item.zipcode,
                    totalStudents: item.totalstudents ? parseInt(item.totalstudents) : null,
                    totalFaculty: item.totalfaculty ? parseInt(item.totalfaculty) : null,
                    ipRange: item.iprange,
                    companyId: decoded.companyId
                }
            });

            createdCount++;
        }

        return NextResponse.json({
            success: true,
            message: `Successfully imported ${createdCount} institutions. ${skippedCount} items skipped.`
        });

    } catch (error: any) {
        console.error('Institution Import Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
