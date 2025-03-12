// src/app/api/media/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fetchAllMedia, postMedia } from '@/models/mediaModel';
import { fetchTagsByMediaId } from '@/models/tagModel';
import { requireAuth } from '@/lib/authActions';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    const mediaList = await fetchAllMedia(page, limit);
    const mediaWithTags = await Promise.all(
      mediaList.map(async (item) => {
        const tags = await fetchTagsByMediaId(item.media_id);
        return { ...item, tags };
      })
    );

    console.log('Medya listesi alındı:', mediaWithTags);
    return NextResponse.json(mediaWithTags, { status: 200 });
  } catch (error) {
    console.error('Medya alma hatası:', error);
    return NextResponse.json(
      { message: (error as Error).message || 'Medya alınamadı' },
      { status: (error as any).status || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const formData = await req.formData();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const file = formData.get('file') as File;
    const tags = formData.get('tags') as string;

    if (!title || !description || !file) {
      return NextResponse.json({ message: 'Gerekli alanlar eksik' }, { status: 400 });
    }

    // Dosyayı Metropolia sunucusuna yükle
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    const uploadResponse = await fetch(`${process.env.UPLOAD_SERVER}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.user_id}`, // Token yerine user_id kullanıldı
      },
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Dosya yükleme başarısız');
    }

    const uploadResult = await uploadResponse.json();

    const media = {
      user_id: session.user_id,
      filename: uploadResult.filename || file.name,
      filesize: file.size,
      media_type: file.type,
      title,
      description,
    };

    const result = await postMedia(media);
    console.log('Medya yüklendi:', result);

    // Etiketleri ekle
    if (tags) {
      const tagArray = tags.split(',').map((tag) => tag.trim());
      for (const tag of tagArray) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tag_name: tag, media_id: result.media_id }),
        });
        console.log(`Etiket "${tag}" eklendi`);
      }
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Medya yükleme hatası:', error);
    return NextResponse.json(
      { message: (error as Error).message || 'Medya yüklenemedi' },
      { status: (error as any).status || 500 }
    );
  }
}