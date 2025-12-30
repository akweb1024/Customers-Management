import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                company: true,
                customerProfile: {
                    include: {
                        institutionDetails: true,
                        agencyDetails: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Check if user is active
        if (!user.isActive) {
            return NextResponse.json(
                { error: 'Account is inactive. Please contact support.' },
                { status: 403 }
            );
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password);

        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const userAny = user as any;
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
            companyId: userAny.companyId || undefined
        });

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });

        // Log audit
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'login',
                entity: 'user',
                entityId: user.id,
                ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            },
        });

        // Return user data (exclude password)
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(
            {
                success: true,
                message: 'Login successful',
                token,
                user: userWithoutPassword,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'An error occurred during login' },
            { status: 500 }
        );
    }
}
