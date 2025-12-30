import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { CustomerType } from '@/types';

export async function GET(req: NextRequest) {
    // Fetch customers with filtering and assignment
    try {
        // 1. Verify Authentication
        const decoded = await getAuthenticatedUser();
        if (!decoded || !decoded.role) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Role Check and Filtering
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
        const userCompanyId = (decoded as any).companyId;

        // Multi-tenancy: Restrict to company if not SUPER_ADMIN
        if (decoded.role !== 'SUPER_ADMIN' && userCompanyId) {
            where.companyId = userCompanyId;
        }

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

        // Executive Restriction: Only see assigned customers
        if (decoded.role === 'SALES_EXECUTIVE') {
            where.assignedToUserId = decoded.id;
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
                    assignedTo: { // Include assigned staff info
                        select: {
                            email: true,
                            // id: true // id is implicitly available
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
        const decoded = await getAuthenticatedUser();
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
            institutionDetails,
            assignedToUserId, // Optional override
            companyId // Optional override for SUPER_ADMIN
        } = body;

        if (!name || !primaryEmail || !customerType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Determine target company
        let targetCompanyId = companyId || (decoded as any).companyId;

        const result = await prisma.$transaction(async (tx) => {
            // Check if email already exists
            const existing = await tx.customerProfile.findFirst({
                where: { primaryEmail }
            });
            if (existing) {
                throw new Error('Customer with this email already exists');
            }

            const user = await tx.user.create({
                data: {
                    email: primaryEmail,
                    password: '$2a$10$p/9p.0vY8Z6Z.p/9p.0vY8Z6Z.p/9p.0vY8Z6Z.p/9p.0v', // Mock hashed password "password123"
                    role: customerType === 'AGENCY' ? 'AGENCY' : 'CUSTOMER',
                    companyId: targetCompanyId
                }
            });

            // Determine Assignment
            let initialAssignedTo = assignedToUserId;
            if (!initialAssignedTo && decoded.role === 'SALES_EXECUTIVE') {
                initialAssignedTo = decoded.id; // Auto-assign to self
            }

            const customer = await tx.customerProfile.create({
                data: {
                    userId: user.id,
                    assignedToUserId: initialAssignedTo, // Use the determined ID
                    companyId: targetCompanyId,
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
