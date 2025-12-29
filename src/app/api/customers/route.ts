import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { CustomerType } from '@/types';

export async function GET(req: NextRequest) {
    try {
        // 1. Verify Authentication
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || !decoded.role) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Role Check
        const allowedRoles = ['SUPER_ADMIN', 'MANAGER', 'SALES_EXECUTIVE'];
        if (!allowedRoles.includes(decoded.role)) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // 2. Query Params
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const type = searchParams.get('type') as CustomerType | null;

        const skip = (page - 1) * limit;

        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { organizationName: { contains: search } },
                { primaryEmail: { contains: search } }
            ];
        }
        if (type) {
            where.customerType = type;
        }

        // 3. Fetch
        const [customers, total] = await Promise.all([
            prisma.customerProfile.findMany({
                where,
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' },
                include: {
                    user: {
                        select: {
                            email: true,
                            role: true,
                            lastLogin: true,
                            isActive: true
                        }
                    },
                    _count: {
                        select: { subscriptions: true }
                    }
                }
            }),
            prisma.customerProfile.count({ where })
        ]);

        return NextResponse.json({
            data: customers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error: any) {
        console.error('Customer API Error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.split(' ')[1];
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded || !['SUPER_ADMIN', 'MANAGER', 'SALES_EXECUTIVE'].includes(decoded.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const {
            name,
            organizationName,
            customerType,
            primaryEmail,
            primaryPhone,
            billingAddress,
            city,
            state,
            country,
            pincode,
            gstVatTaxId,
            tags,
            institutionDetails
        } = body;

        if (!name || !primaryEmail || !customerType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // Check if email already exists
            const existing = await tx.customerProfile.findFirst({
                where: { primaryEmail }
            });
            if (existing) {
                throw new Error('Customer with this email already exists');
            }

            // Create Profile (Note: userId is required in schema, but usually we link to an existing user or create one)
            // Looking at the schema, userId is NOT optional: user User @relation(...)
            // Let's check the schema logic for userId in CustomerProfile

            // Wait, I need to check if I need to create a USER first.
            // If I'm creating a customer from the dashboard, I might need to create a User record.

            // Re-checking schema:
            // userId String @unique
            // user User @relation(fields: [userId], references: [id], onDelete: Cascade)

            // So I MUST have a userId.

            const user = await tx.user.create({
                data: {
                    email: primaryEmail,
                    password: '$2a$10$p/9p.0vY8Z6Z.p/9p.0vY8Z6Z.p/9p.0vY8Z6Z.p/9p.0v', // Mock hashed password "password123"
                    role: customerType === 'AGENCY' ? 'AGENCY' : 'CUSTOMER'
                }
            });

            const customer = await tx.customerProfile.create({
                data: {
                    userId: user.id,
                    name,
                    organizationName,
                    customerType,
                    primaryEmail,
                    primaryPhone: primaryPhone || '',
                    billingAddress,
                    city,
                    state,
                    country,
                    pincode,
                    gstVatTaxId,
                    tags,
                }
            });

            if (customerType === 'INSTITUTION' && institutionDetails) {
                await tx.institutionDetails.create({
                    data: {
                        customerProfileId: customer.id,
                        category: institutionDetails.category || 'Other',
                        department: institutionDetails.department,
                        libraryContact: institutionDetails.libraryContact,
                        ipRange: institutionDetails.ipRange,
                        numberOfUsers: institutionDetails.numberOfUsers ? parseInt(institutionDetails.numberOfUsers) : null,
                        numberOfSeats: institutionDetails.numberOfSeats ? parseInt(institutionDetails.numberOfSeats) : null
                    }
                });
            }

            await tx.auditLog.create({
                data: {
                    userId: decoded.id,
                    action: 'create',
                    entity: 'customer_profile',
                    entityId: customer.id,
                    changes: JSON.stringify(body)
                }
            });

            return customer;
        });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Create Customer Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
