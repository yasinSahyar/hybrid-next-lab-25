import { fetchMediaByTagName, fetchTagsByMediaId } from '@/models/tagModel';
import Image from 'next/image';
import Link from 'next/link';
const MediaList = async () => {
  const mediaList = await fetchMediaByTagName('ilenApp');

  if (!mediaList) {
    return <p>No media found</p>;
  }

  const mediaListWithTags = await Promise.all(
    mediaList.map(async (item) => {
      const tags = await fetchTagsByMediaId(item.media_id);
      return { ...item, tags };
    }),
  );

  return (
    <section className="flex flex-col p-8">
      <ul className="grid grid-cols-3 gap-4">
        {mediaListWithTags.map((item, index) => (
          <li
            key={index}
            className="flex flex-col items-center border border-gray-300 p-4 shadow-lg rounded-md bg-white"
          >
            <Link href={'/single/' + item.media_id}>
              <h3 className="text-lg font-bold self-start">{item.title}</h3>
              <Image
                src={item.thumbnail}
                alt={item.title}
                width={320}
                height={320}
                className="h-[320px] w-[320px] object-cover"
              />
              <p>Description: {item.description}</p>
              <p>
                Date: {new Date(item.created_at).toLocaleDateString('fi-FI')}
              </p>
              <p>Tags: {item.tags.map((tag) => tag.tag_name).join(' | ')}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default MediaList;