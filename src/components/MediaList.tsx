// src/components/MediaList.tsx
'use client';

import { useState, useEffect } from 'react';
import { fetchData } from '@/lib/functions';

const MediaList = () => {
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const loadMore = async () => {
    try {
      const newMedia = await fetchData(
        `${process.env.NEXT_PUBLIC_API_URL}/api/media?page=${page}&limit=${limit}`
      );
      if (newMedia.length > 0) {
        setMediaList((prev) => [...prev, ...newMedia]);
        setPage((prev) => prev + 1);
      }
      if (newMedia.length < limit) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Medya yükleme hatası:', error);
    }
  };

  useEffect(() => {
    loadMore();
  }, []);

  if (mediaList.length === 0 && !hasMore) {
    return <p>Medya bulunamadı</p>;
  }

  return (
    <section className="flex flex-col p-8">
      <ul className="grid grid-cols-3 gap-4">
        {mediaList.map((item, index) => (
          <li
            key={index}
            className="flex flex-col items-center border border-gray-300 p-4 shadow-lg rounded-md bg-white"
          >
            <h3 className="text-lg font-bold self-start">{item.title}</h3>
            <p>Açıklama: {item.description}</p>
            <p>Tarih: {new Date(item.created_at).toLocaleDateString('fi-FI')}</p>
            <p>
              Etiketler:{' '}
              {item.tags && item.tags.length > 0
                ? item.tags.map((tag: any) => tag.tag_name).join(', ')
                : 'Etiket yok'}
            </p>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          onClick={loadMore}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
        >
          Daha Fazla Yükle
        </button>
      )}
    </section>
  );
};

export default MediaList;