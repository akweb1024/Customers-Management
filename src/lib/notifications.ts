import { prisma } from './prisma';
import webpush from 'web-push';

const vapidKeys = {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    privateKey: process.env.VAPID_PRIVATE_KEY!,
};

if (vapidKeys.publicKey && vapidKeys.privateKey) {
    webpush.setVapidDetails(
        'mailto:admin@stm.com',
        vapidKeys.publicKey,
        vapidKeys.privateKey
    );
}

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
        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                link
            }
        });

        // Try to send push notification
        await sendPushNotification(userId, title, message, link);

        return notification;
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
}

async function sendPushNotification(userId: string, title: string, body: string, link: string | null) {
    try {
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId }
        });

        if (subscriptions.length === 0) return;

        const payload = JSON.stringify({
            title,
            body,
            icon: '/icon-192x192.png',
            data: { url: link || '/dashboard' }
        });

        const results = await Promise.allSettled(
            subscriptions.map((sub: any) =>
                webpush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth
                        }
                    },
                    payload
                )
            )
        );

        // Remove failed subscriptions
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if (result.status === 'rejected') {
                const sub = subscriptions[i];
                if ((result.reason as any).statusCode === 410 || (result.reason as any).statusCode === 404) {
                    await prisma.pushSubscription.delete({
                        where: { id: sub.id }
                    });
                }
            }
        }
    } catch (error) {
        console.error('Push notification error:', error);
    }
}

export async function notifySupportTeam(companyId: string | null, title: string, message: string, link: string) {
    if (!companyId) return;

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
