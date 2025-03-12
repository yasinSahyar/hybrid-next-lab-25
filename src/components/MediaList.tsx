// src/components/MediaList.tsx
import { fetchMediaByTagName, fetchTagsByMediaId } from '@/models/tagModel';
import Image from 'next/image';
import Link from 'next/link';

const MediaList = async () => {
  const mediaList = await fetchMediaByTagName('shoppingStory');

  if (!mediaList) {
    return <p>No stories found.</p>;
  }

  const mediaListWithTags = await Promise.all(
    mediaList.map(async (item) => {
      const tags = await fetchTagsByMediaId(item.media_id);
      return { ...item, tags };
    }),
  );

  return (
    <section className="flex flex-col p-8">
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mediaListWithTags.map((item, index) => (
          <li
            key={index}
            className="flex flex-col items-center border border-gray-200 p-4 shadow-lg rounded-lg bg-white hover:shadow-xl transition-shadow"
          >
            <Link href={'/single/' + item.media_id}>
              <h3 className="text-xl font-semibold text-indigo-600 self-start">
                {item.title}
              </h3>
              <Image
                src={item.thumbnail}
                alt={item.title}
                width={320}
                height={320}
                className="h-[320px] w-[320px] object-cover rounded-md mt-2"
              />
              <p className="mt-2 text-gray-700">Description: {item.description}</p>
              <p className="text-gray-500">
                Date: {new Date(item.created_at).toLocaleDateString('en-US')}
              </p>
              <p className="text-gray-500">
                Tags: {item.tags.map((tag) => tag.tag_name).join(' | ')}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default MediaList;