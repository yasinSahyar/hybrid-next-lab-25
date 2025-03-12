// src/app/api/media/route.ts
import { getSession, requireAuth } from '@/lib/authActions';
import { postMedia } from '@/models/mediaModel';
import { MediaResponse } from 'hybrid-types';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  await requireAuth();
  try {
    const formData = await request.formData();
    const token = request.cookies.get('session')?.value;
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const file = formData.get('file') as File;
    if (!file) {
      return new NextResponse('File missing', { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, filename);
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));

    const tokenContent = await getSession();
    if (!tokenContent) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const media = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      filename: `/uploads/${filename}`,
      filesize: file.size,
      media_type: file.type,
      user_id: tokenContent.user_id,
    };

    const postResult = await postMedia(media);

    if (!postResult) {
      return new NextResponse('Failed to add story to database', {
        status: 500,
      });
    }

    const uploadResponse: MediaResponse = {
      message: 'Story added successfully',
      media: postResult,
    };

    return new NextResponse(JSON.stringify(uploadResponse), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error((error as Error).message, error);
    return new NextResponse((error as Error).message, { status: 500 });
  }
}