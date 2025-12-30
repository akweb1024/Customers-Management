import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const decoded = await getAuthenticatedUser();
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Fetch logs with follow-ups
        // TODO: In a real app, maybe filter by "Outcome" != "Resolved"?
        // For now, simple date based.
        // We fetch logs logged by THIS user.
        // Or if Manager, maybe all logs? For simplicity: User's own logs.

        const whereClause: any = {
            NOT: {
                nextFollowUpDate: null
            }
        };

        if (decoded.role === 'SALES_EXECUTIVE') {
            whereClause.userId = decoded.id;
        }
        // Managers/Admins can see all? Or restrict? Let's show all for Admin/Manager for now to be helpful.

        const logs = await prisma.communicationLog.findMany({
            where: whereClause,
            include: {
                customerProfile: {
                    select: {
                        id: true,
                        name: true,
                        organizationName: true,
                        primaryEmail: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        email: true
                    }
                }
            },
            orderBy: {
                nextFollowUpDate: 'asc'
            }
        });

        // Categorize
        const missed: any[] = [];
        const todayLogs: any[] = [];
        const upcoming: any[] = [];

        logs.forEach(log => {
            if (!log.nextFollowUpDate) return;
            const fDate = new Date(log.nextFollowUpDate);
            // reset time for straight comparison or just compare timestamps
            // Since nextFollowUpDate might have time 00:00:00 if coming from date picker input

            // We use simple string comp for YYYY-MM-DD to be safer with timezones if locally generated
            // But here we have Date objects.

            // Normalize fDate to start of day
            const fDateNorm = new Date(fDate);
            fDateNorm.setHours(0, 0, 0, 0);

            if (fDateNorm.getTime() === today.getTime()) {
                todayLogs.push(log);
            } else if (fDateNorm.getTime() < today.getTime()) {
                missed.push(log);
            } else {
                upcoming.push(log);
            }
        });

        return NextResponse.json({
            missed,
            today: todayLogs,
            upcoming,
            meta: {
                total: logs.length,
                counts: {
                    missed: missed.length,
                    today: todayLogs.length,
                    upcoming: upcoming.length
                }
            }
        });

    } catch (error) {
        console.error('Follow-ups API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
