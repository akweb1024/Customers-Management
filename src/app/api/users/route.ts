import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.split(' ')[1];
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        assignedSubscriptions: true,
                        tasks: true
                    }
                }
            }
        });

        // Don't send passwords
        const safeUsers = users.map(user => {
            const { password, ...safeUser } = user;
            return safeUser;
        });

        return NextResponse.json(safeUsers);

    } catch (error: any) {
        console.error('Fetch Users Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.split(' ')[1];
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { email, password, role } = body;

        if (!email || !password || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
                isActive: true
            }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                userId: decoded.id,
                action: 'create',
                entity: 'user',
                entityId: user.id,
                changes: JSON.stringify({ email, role })
            }
        });

        const { password: _, ...safeUser } = user;
        return NextResponse.json(safeUser);

    } catch (error: any) {
        console.error('Create User Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
