// src/app/api/tags/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { postTag } from '@/models/tagModel';
import { requireAuth } from '@/lib/authActions';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { tag_name, media_id } = await req.json();

    if (!tag_name || !media_id) {
      return NextResponse.json({ message: 'Etiket adı ve medya ID gerekli' }, { status: 400 });
    }

    const result = await postTag(tag_name, media_id);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Etiket ekleme hatası:', error);
    return NextResponse.json(
      { message: (error as Error).message || 'Etiket eklenemedi' },
      { status: (error as any).status || 500 }
    );
  }
}