import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-legacy';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const journal = await prisma.journal.findUnique({
            where: { id },
            include: {
                plans: {
                    where: { isActive: true }
                }
            }
        });

        if (!journal) {
            return NextResponse.json({ error: 'Journal not found' }, { status: 404 });
        }

        return NextResponse.json(journal);
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const decoded = await getAuthenticatedUser();
        if (!decoded || decoded.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { name, issnPrint, issnOnline, frequency, formatAvailable, subjectCategory, priceINR, priceUSD, isActive } = body;

        const journal = await prisma.journal.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(issnPrint !== undefined && { issnPrint }),
                ...(issnOnline !== undefined && { issnOnline }),
                ...(frequency && { frequency }),
                ...(formatAvailable && { formatAvailable }),
                ...(subjectCategory !== undefined && { subjectCategory }),
                ...(priceINR !== undefined && { priceINR: parseFloat(priceINR) }),
                ...(priceUSD !== undefined && { priceUSD: parseFloat(priceUSD) }),
                ...(isActive !== undefined && { isActive })
            }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                userId: decoded.id,
                action: 'update',
                entity: 'journal',
                entityId: id,
                changes: JSON.stringify(body)
            }
        });

        return NextResponse.json(journal);
    } catch (error: any) {
        console.error('Journal Update Error:', error);
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
        if (!decoded || decoded.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Soft delete
        await prisma.journal.update({
            where: { id },
            data: { isActive: false }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                userId: decoded.id,
                action: 'delete',
                entity: 'journal',
                entityId: id,
                changes: JSON.stringify({ isActive: false })
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
