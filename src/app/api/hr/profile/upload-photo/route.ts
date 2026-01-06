import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// POST: Upload Profile Picture
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ideally upload to S3/Cloudinary. For now, local public folder.
        // Format: profile-{empId}-{timestamp}.ext
        const ext = file.name.split('.').pop();
        const filename = `profile-${user.id}-${Date.now()}.${ext}`;
        const path = join(process.cwd(), 'public', 'uploads', filename);

        await writeFile(path, buffer);

        const url = `/uploads/${filename}`;

        // Update Profile
        const updated = await prisma.employeeProfile.update({
            where: { userId: user.id },
            data: { profilePicture: url }
        });

        return NextResponse.json({ url });

    } catch (error) {
        console.error('Profile Photo Upload Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
