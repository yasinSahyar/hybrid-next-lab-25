import { requireAuth } from '@/lib/authActions';
import { postTag } from '@/models/tagModel';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  requireAuth();
  try {
    const jsonData = (await request.json()) as {
      tag_name: string;
      media_id: string;
    };
    const postResult = await postTag(
      jsonData.tag_name,
      Number(jsonData.media_id),
    );

    if (!postResult) {
      return new NextResponse('Error adding tag', { status: 500 });
    }

    return new NextResponse(JSON.stringify(postResult), {
      headers: { 'content-type': 'application/json' },
      status: 203,
    });
  } catch (error) {
    return new NextResponse((error as Error).message, { status: 500 });
  }
}