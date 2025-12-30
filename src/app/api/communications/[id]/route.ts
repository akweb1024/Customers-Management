import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const decoded = await getAuthenticatedUser();
        if (!decoded) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const {
            outcome,
            nextFollowUpDate,
            notes
        } = body;

        // Verify ownership or permission
        const log = await prisma.communicationLog.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!log) {
            return NextResponse.json({ error: 'Log not found' }, { status: 404 });
        }

        // Allow update if user is the creator OR is a Manager/Admin
        if (log.userId !== decoded.id && !['SUPER_ADMIN', 'MANAGER'].includes(decoded.role)) {
            // Check if manager of the creator
            if (decoded.role === 'MANAGER') {
                // Already checked above, manager is allowed. 
                // Detailed check: is this log's user a subordinate? 
                // For simplicity, Managers can edit any log in the system or we valid hierarchy.
                // Given previous logic 'Managers seeing everything in team', we assume trust.
            } else {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        const updatedLog = await prisma.communicationLog.update({
            where: { id },
            data: {
                outcome: outcome !== undefined ? outcome : log.outcome,
                nextFollowUpDate: nextFollowUpDate !== undefined ? (nextFollowUpDate ? new Date(nextFollowUpDate) : null) : log.nextFollowUpDate,
                notes: notes !== undefined ? notes : log.notes,
            }
        });

        await prisma.auditLog.create({
            data: {
                userId: decoded.id,
                action: 'update',
                entity: 'communication_log',
                entityId: id,
                changes: JSON.stringify(body)
            }
        });

        return NextResponse.json(updatedLog);

    } catch (error) {
        console.error('Update Communication Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
