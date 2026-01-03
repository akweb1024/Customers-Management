import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest, props: { params: Promise<{ lid: string }> }) {
    try {
        const { lid: lessonId } = await props.params;
        const user = await getAuthenticatedUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const lesson = await (prisma as any).courseLesson.findUnique({
            where: { id: lessonId },
            include: {
                module: {
                    include: {
                        course: {
                            include: {
                                modules: {
                                    include: { lessons: { orderBy: { order: 'asc' } } },
                                    orderBy: { order: 'asc' }
                                }
                            }
                        }
                    }
                },
                progress: {
                    where: { userId: user.id }
                }
            }
        });

        if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

        return NextResponse.json(lesson);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest, props: { params: Promise<{ lid: string }> }) {
    // Mark as completed
    try {
        const { lid: lessonId } = await props.params;
        const user = await getAuthenticatedUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const progress = await (prisma as any).userLessonProgress.upsert({
            where: {
                userId_lessonId: {
                    userId: user.id,
                    lessonId: lessonId
                }
            },
            update: { isCompleted: true, completedAt: new Date() },
            create: {
                userId: user.id,
                lessonId: lessonId,
                isCompleted: true,
                completedAt: new Date()
            }
        });

        return NextResponse.json(progress);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
