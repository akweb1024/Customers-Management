import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        if (!user.companyId && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Company association required' }, { status: 403 });
        }

        const where: any = {};

        // Contextual Filtering
        if (user.companyId) {
            where.user = { companyId: user.companyId };
        }

        // Role-based restrictions within the context
        if (user.role === 'MANAGER') {
            where.user = { ...where.user, managerId: user.id };
        }

        const employees = await prisma.employeeProfile.findMany({
            where: where,
            include: {
                user: {
                    select: {
                        email: true,
                        role: true,
                        isActive: true
                    }
                },
                workReports: {
                    orderBy: { date: 'desc' },
                    take: 10
                },
                _count: {
                    select: {
                        attendance: true,
                        workReports: true
                    }
                }
            }
        });

        return NextResponse.json(employees);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { id, ...data } = body;

        // Parse helpers
        const parseDate = (d: any) => (d && !isNaN(Date.parse(d)) ? new Date(d) : null);
        const parseFloatSafe = (n: any) => {
            const parsed = parseFloat(n);
            return isNaN(parsed) ? undefined : parsed;
        };
        const parseIntSafe = (n: any) => {
            const parsed = parseInt(n);
            return isNaN(parsed) ? 0 : parsed;
        };

        // Prepare typed data
        const safeData = {
            dateOfJoining: parseDate(data.dateOfJoining),
            dateOfBirth: parseDate(data.dateOfBirth),
            baseSalary: parseFloatSafe(data.baseSalary)
        };

        // Update User Role if passed
        if (data.role || data.isActive !== undefined) {
            const emp = await prisma.employeeProfile.findUnique({ where: { id }, select: { userId: true } });
            if (emp) {
                await prisma.user.update({
                    where: { id: emp.userId },
                    data: {
                        ...(data.role && { role: data.role }),
                        ...(data.isActive !== undefined && { isActive: data.isActive })
                    }
                });
            }
        }

        // Check if salary changed to record history
        const currentProfile = await prisma.employeeProfile.findUnique({ where: { id } });

        let newBaseSalary = safeData.baseSalary;
        // If undefined (not sent/invalid), keep old or set to null? 
        // Logic: if sent but empty string -> undefined -> Prisma ignores update.
        // If valid number -> update.

        if (currentProfile && newBaseSalary !== undefined && newBaseSalary !== null && currentProfile.baseSalary !== newBaseSalary) {
            const oldSalary = currentProfile.baseSalary || 0;
            const increment = newBaseSalary - oldSalary;
            const percentage = oldSalary > 0 ? (increment / oldSalary) * 100 : 0;

            await prisma.salaryIncrementRecord.create({
                data: {
                    employeeProfileId: id,
                    oldSalary,
                    newSalary: newBaseSalary,
                    incrementAmount: increment,
                    percentage: parseFloat(percentage.toFixed(2)),
                    date: new Date(),
                    effectiveDate: new Date(),
                    type: increment >= 0 ? 'INCREMENT' : 'DECREMENT',
                    approvedByUserId: user.id
                }
            });
        }

        const updated = await prisma.employeeProfile.update({
            where: { id },
            data: {
                designation: data.designation,
                designationId: data.designationId || null, // Fix: Convert empty string to null to avoid FK violation
                baseSalary: safeData.baseSalary,

                bankName: data.bankName,
                accountNumber: data.accountNumber,
                ifscCode: data.ifscCode,
                panNumber: data.panNumber,
                aadharNumber: data.aadharNumber,
                uanNumber: data.uanNumber,
                pfNumber: data.pfNumber,
                esicNumber: data.esicNumber,

                personalEmail: data.personalEmail,
                officialEmail: data.officialEmail,
                phoneNumber: data.phoneNumber,
                officePhone: data.officePhone,
                emergencyContact: data.emergencyContact,

                address: data.address,
                permanentAddress: data.permanentAddress,
                bloodGroup: data.bloodGroup,

                offerLetterUrl: data.offerLetterUrl,
                contractUrl: data.contractUrl,
                jobDescription: data.jobDescription,
                kra: data.kra,

                profilePicture: data.profilePicture,
                employeeId: data.employeeId,

                // New Fields
                totalExperienceYears: parseIntSafe(data.totalExperienceYears),
                totalExperienceMonths: parseIntSafe(data.totalExperienceMonths),
                relevantExperienceYears: parseIntSafe(data.relevantExperienceYears),
                relevantExperienceMonths: parseIntSafe(data.relevantExperienceMonths),
                qualification: data.qualification,

                educationDetails: data.educationDetails !== undefined ? data.educationDetails : undefined,
                experienceDetails: data.experienceDetails !== undefined ? data.experienceDetails : undefined,

                grade: data.grade,
                lastPromotionDate: parseDate(data.lastPromotionDate),
                lastIncrementDate: parseDate(data.lastIncrementDate),
                nextReviewDate: parseDate(data.nextReviewDate),
                lastIncrementPercentage: parseFloatSafe(data.lastIncrementPercentage)
            }
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error('Error updating employee profile:', error); // Log to server console
        return NextResponse.json({ error: error.message, details: error.toString() }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user || !['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { email, password, role, ...profileData } = await req.json();

        // Robust data conversion
        const cleanProfileData: any = {};
        if (profileData.designation) cleanProfileData.designation = profileData.designation;
        if (profileData.bankName) cleanProfileData.bankName = profileData.bankName;
        if (profileData.accountNumber) cleanProfileData.accountNumber = profileData.accountNumber;
        if (profileData.panNumber) cleanProfileData.panNumber = profileData.panNumber;
        if (profileData.aadharNumber) cleanProfileData.aadharNumber = profileData.aadharNumber;
        if (profileData.uanNumber) cleanProfileData.uanNumber = profileData.uanNumber;
        if (profileData.pfNumber) cleanProfileData.pfNumber = profileData.pfNumber;
        if (profileData.esicNumber) cleanProfileData.esicNumber = profileData.esicNumber;

        if (profileData.personalEmail) cleanProfileData.personalEmail = profileData.personalEmail;
        if (profileData.officialEmail) cleanProfileData.officialEmail = profileData.officialEmail;
        if (profileData.phoneNumber) cleanProfileData.phoneNumber = profileData.phoneNumber;
        if (profileData.officePhone) cleanProfileData.officePhone = profileData.officePhone;
        if (profileData.emergencyContact) cleanProfileData.emergencyContact = profileData.emergencyContact;
        if (profileData.bloodGroup) cleanProfileData.bloodGroup = profileData.bloodGroup;

        if (profileData.address) cleanProfileData.address = profileData.address;
        if (profileData.permanentAddress) cleanProfileData.permanentAddress = profileData.permanentAddress;

        if (profileData.offerLetterUrl) cleanProfileData.offerLetterUrl = profileData.offerLetterUrl;
        if (profileData.contractUrl) cleanProfileData.contractUrl = profileData.contractUrl;
        if (profileData.jobDescription) cleanProfileData.jobDescription = profileData.jobDescription;
        if (profileData.kra) cleanProfileData.kra = profileData.kra;
        if (profileData.designationId) cleanProfileData.designationId = profileData.designationId;
        if (profileData.qualification) cleanProfileData.qualification = profileData.qualification;

        if (profileData.educationDetails) cleanProfileData.educationDetails = profileData.educationDetails;
        if (profileData.experienceDetails) cleanProfileData.experienceDetails = profileData.experienceDetails;

        if (profileData.grade) cleanProfileData.grade = profileData.grade;
        if (profileData.lastIncrementPercentage) cleanProfileData.lastIncrementPercentage = parseFloat(profileData.lastIncrementPercentage) || 0;

        if (profileData.lastPromotionDate) cleanProfileData.lastPromotionDate = new Date(profileData.lastPromotionDate);
        if (profileData.lastIncrementDate) cleanProfileData.lastIncrementDate = new Date(profileData.lastIncrementDate);
        if (profileData.nextReviewDate) cleanProfileData.nextReviewDate = new Date(profileData.nextReviewDate);

        if (profileData.baseSalary !== undefined && profileData.baseSalary !== '') {
            const salary = parseFloat(profileData.baseSalary);
            if (!isNaN(salary)) cleanProfileData.baseSalary = salary;
        }

        if (profileData.dateOfJoining) {
            const d = new Date(profileData.dateOfJoining);
            if (!isNaN(d.getTime())) cleanProfileData.dateOfJoining = d;
        }

        if (profileData.dateOfBirth) {
            const d = new Date(profileData.dateOfBirth);
            if (!isNaN(d.getTime())) cleanProfileData.dateOfBirth = d;
        }

        // Check if user already exists
        let targetUser = await prisma.user.findUnique({ where: { email } });

        if (targetUser) {
            // Update existing user's company and role if needed
            targetUser = await prisma.user.update({
                where: { email },
                data: {
                    companyId: user.companyId,
                    role: role || targetUser.role
                }
            });
        } else {
            // Create user first
            targetUser = await prisma.user.create({
                data: {
                    email,
                    password: password || 'Welcome123', // Default password
                    role: role || 'SALES_EXECUTIVE',
                    companyId: user.companyId
                }
            });
        }

        // Check if profile already exists for this user
        const existingProfile = await prisma.employeeProfile.findUnique({
            where: { userId: targetUser.id }
        });

        let profile;
        if (existingProfile) {
            // Update existing profile
            profile = await prisma.employeeProfile.update({
                where: { id: existingProfile.id },
                data: cleanProfileData
            });
        } else {
            // Create new profile
            profile = await prisma.employeeProfile.create({
                data: {
                    userId: targetUser.id,
                    ...cleanProfileData
                }
            });
        }

        return NextResponse.json({ user: targetUser, profile });
    } catch (error: any) {
        console.error('ONBOARD_ERROR:', error);
        return NextResponse.json({
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user || !['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // Deleting an employee is complex (relationships). 
        // Best practice: Soft Delete (set isActive = false). 
        // But for this request, if asking to delete, we'll try to delete or deactivate.
        // Let's implement Soft Delete via this endpoint for safety.

        const emp = await prisma.employeeProfile.findUnique({ where: { id }, select: { userId: true } });
        if (emp) {
            await prisma.user.update({
                where: { id: emp.userId },
                data: { isActive: false }
            });
        }

        return NextResponse.json({ message: 'Employee deactivated successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
