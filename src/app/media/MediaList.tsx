'use client';

import { useState, useEffect } from 'react';
import { fetchAllMedia, fetchTagsByMediaId } from '@/models/mediaModel';

interface MediaItem {
  media_id: number;
  title: string;
  description: string;
  filename: string;
}

const MediaList = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const loadMedia = async () => {
      const newMediaItems = await fetchAllMedia(page, 10);
      if (newMediaItems.length === 0) {
        setHasMore(false);
        return;
      }
      const mediaWithTags = await Promise.all(
        newMediaItems.map(async (item) => {
          const tags = await fetchTagsByMediaId(item.media_id);
          return { ...item, tags: tags.map((t) => t.name) };
        })
      );
      setMediaList((prev) => [...prev, ...mediaWithTags]);
    };
    loadMedia();
  }, [page]);

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 100 &&
      hasMore
    ) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Media List</h2>
      {mediaList.map((media) => (
        <div key={media.media_id} className="mb-4 p-4 border rounded">
          <h3 className="text-xl font-semibold">{media.title}</h3>
          <p>{media.description}</p>
          <p>Tags: {media.tags.join(', ')}</p>
          <img src={media.filename} alt={media.title} className="w-32 h-32 object-cover mt-2" />
        </div>
      ))}
      {!hasMore && <p>No more items to load</p>}
    </div>
  );
};

export default MediaList;