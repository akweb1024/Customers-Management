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
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            include: {
                customerProfile: true
            }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const { password, ...safeUser } = user;
        return NextResponse.json(safeUser);

    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.split(' ')[1];
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const body = await req.json();
        const { currentPassword, newPassword, name, primaryPhone } = body;

        // Change password logic
        if (currentPassword && newPassword) {
            const user = await prisma.user.findUnique({ where: { id: decoded.id } });
            if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await prisma.user.update({
                where: { id: decoded.id },
                data: { password: hashedPassword }
            });

            return NextResponse.json({ message: 'Password updated successfully' });
        }

        // Update profile info
        if (name || primaryPhone) {
            const updateData: any = {};
            if (name) updateData.name = name;
            if (primaryPhone) updateData.primaryPhone = primaryPhone;

            const updated = await prisma.customerProfile.update({
                where: { userId: decoded.id },
                data: updateData
            });

            return NextResponse.json(updated);
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
