import { prisma } from './prisma';

export async function createNotification({
    userId,
    title,
    message,
    type = 'INFO',
    link = null
}: {
    userId: string;
    title: string;
    message: string;
    type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER' | 'CHAT' | 'TICKET';
    link?: string | null;
}) {
    try {
        return await (prisma as any).notification.create({
            data: {
                userId,
                title,
                message,
                type,
                link
            }
        });
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
}

export async function notifySupportTeam(companyId: string | null, title: string, message: string, link: string) {
    if (!companyId) return;

    // Find all staff who should receive notifications (Admin, Manager, TL, Sales Exec)
    const staff = await prisma.user.findMany({
        where: {
            companyId,
            role: {
                in: ['ADMIN', 'MANAGER', 'TEAM_LEADER', 'SALES_EXECUTIVE', 'SUPER_ADMIN']
            }
        } as any,
        select: { id: true }
    });

    for (const member of staff) {
        await createNotification({
            userId: member.id,
            title,
            message,
            type: 'TICKET',
            link
        });
    }
}
