import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

type ApiError = {
    message: string;
    details?: any;
    code?: string;
};

export function createErrorResponse(
    error: unknown,
    status: number = 500,
    customMessage: string = 'Internal Server Error'
): NextResponse {
    console.error('API Error:', error);

    const response: ApiError = { message: customMessage };

    if (error instanceof ZodError) {
        response.message = 'Validation Error';
        response.details = error.format();
        return NextResponse.json(response, { status: 400 });
    }

    if (error instanceof Error) {
        response.message = error.message;
        // In dev, send stack
        if (process.env.NODE_ENV === 'development') {
            response.details = error.stack;
        }
    } else if (typeof error === 'string') {
        response.message = error;
    }

    // Prisma specific error codes can be handled here
    if (typeof error === 'object' && error !== null && 'code' in error) {
        // e.g. P2002 (Unique constraint)
        const prismaError = error as any;
        if (prismaError.code === 'P2002') {
            response.message = 'Duplicate entry found';
            response.code = prismaError.code;
            return NextResponse.json(response, { status: 409 });
        }
        if (prismaError.code === 'P2025') {
            response.message = 'Record not found';
            response.code = prismaError.code;
            return NextResponse.json(response, { status: 404 });
        }
    }

    return NextResponse.json(response, { status });
}

export function createSuccessResponse<T>(data: T, status: number = 200): NextResponse {
    return NextResponse.json(data, { status });
}

export async function fetchJson(url: string, method: string = 'GET', body?: any) {
    const res = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'API request failed');
    }
    return res.json();
}
