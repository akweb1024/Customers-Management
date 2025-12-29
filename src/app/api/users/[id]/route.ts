import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.split(' ')[1];
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const user = await prisma.user.findUnique({
            where: { id: id },
            include: {
                customerProfile: true,
                _count: {
                    select: {
                        assignedSubscriptions: true,
                        tasks: true,
                        auditLogs: true
                    }
                }
            }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const { password, ...safeUser } = user;
        return NextResponse.json(safeUser);

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
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.split(' ')[1];
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { role, isActive, password } = body;

        const updateData: any = {};
        if (role) updateData.role = role;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { id: id },
            data: updateData
        });

        // Audit log
        await prisma.auditLog.create({
            data: {
                userId: decoded.id,
                action: 'update',
                entity: 'user',
                entityId: user.id,
                changes: JSON.stringify(body)
            }
        });

        const { password: _, ...safeUser } = user;
        return NextResponse.json(safeUser);

    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.split(' ')[1];
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Check if user is the last admin
        if (decoded.id === id) {
            return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
        }

        await prisma.user.delete({
            where: { id: id }
        });

        return NextResponse.json({ message: 'User deleted successfully' });

    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
