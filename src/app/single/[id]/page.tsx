import { fetchMediaById } from '@/models/mediaModel';
import Image from 'next/image';

type SingleProps = {
  params: Promise<{ id: string }>;
};

export default async function Single({ params }: SingleProps) {
  const { id } = await params;
  const mediaItem = await fetchMediaById(Number(id));
  return (
    <div>
      {mediaItem.media_type.includes('video') ? (
        <video
          src={mediaItem.filename}
          controls
          className="max-h-[80vh] mx-auto object-contain rounded max-w-full"
        />
      ) : (
        <Image
          src={mediaItem.filename}
          alt={mediaItem.title}
          width={1200}
          height={800}
          className="mx-auto object-cover rounded max-w-full"
        />
      )}
    </div>
  );
}