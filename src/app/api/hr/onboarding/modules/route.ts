import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizedRoute } from '@/lib/middleware-auth';
import { createErrorResponse } from '@/lib/api-utils';

// GET: Fetch all onboarding modules for the company
export const GET = authorizedRoute(
    ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR_MANAGER', 'TEAM_LEADER'],
    async (req: NextRequest, user) => {
        try {
            if (!user.companyId) return createErrorResponse('Company association required', 403);

            const modules = await prisma.onboardingModule.findMany({
                where: { companyId: user.companyId },
                include: { questions: true },
                orderBy: { order: 'asc' }
            });

            return NextResponse.json(modules);
        } catch (error) {
            return createErrorResponse(error);
        }
    }
);

// POST: Create a new onboarding module
export const POST = authorizedRoute(
    ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR_MANAGER'],
    async (req: NextRequest, user) => {
        try {
            if (!user.companyId) return createErrorResponse('Company association required', 403);

            const body = await req.json();
            const { title, type, description, content, departmentId, requiredForDesignation, questions, order } = body;

            if (!title || !type || !content) {
                return createErrorResponse('Missing required fields', 400);
            }

            const newModule = await prisma.onboardingModule.create({
                data: {
                    companyId: user.companyId,
                    title,
                    type, // COMPANY, ROLE, DEPARTMENT
                    description,
                    content,
                    departmentId: departmentId || null,
                    requiredForDesignation: requiredForDesignation || null,
                    order: order || 0,
                    questions: {
                        create: Array.isArray(questions) ? questions.map((q: any) => ({
                            question: q.question,
                            options: q.options,
                            correctAnswer: parseInt(q.correctAnswer)
                        })) : []
                    }
                },
                include: { questions: true }
            });

            return NextResponse.json(newModule);
        } catch (error) {
            return createErrorResponse(error);
        }
    }
);
