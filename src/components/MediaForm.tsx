// src/components/MediaForm.tsx
'use client';
import CustomError from '@/classes/CustomError';
import { fetchData } from '@/lib/functions';
import { MediaResponse, MessageResponse } from 'hybrid-types';
import { useRouter } from 'next/navigation';

const MediaForm = () => {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const formData = new FormData(e.currentTarget);
      const options = {
        method: 'POST',
        body: formData,
      };
      const uploadResult = await fetchData<MediaResponse>(
        '/api/media',
        options,
      );

      if (!uploadResult) {
        throw new CustomError('Failed to upload story', 500);
      }

      const data = {
        tag_name: formData.get('tag') as string,
        media_id: uploadResult.media.media_id,
      };

      const tagOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      };

      const tagResult = await fetchData<MessageResponse>(
        '/api/tags',
        tagOptions,
      );
      if (!tagResult) {
        throw new CustomError('Failed to add tag', 500);
      }

      const appData = {
        tag_name: 'shoppingStory',
        media_id: uploadResult.media.media_id,
      };

      const appOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appData),
      };

      const appResult = await fetchData<MessageResponse>(
        '/api/tags',
        appOptions,
      );
      if (!appResult) {
        throw new CustomError('Failed to add app tag', 500);
      }

      router.push('/');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col p-8">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Story Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., My New Shoes!"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Story Description
          </label>
          <textarea
            name="description"
            id="description"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Describe your shopping experience..."
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="tag"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Tag
          </label>
          <input
            type="text"
            name="tag"
            id="tag"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., fashion, electronics"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="file"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Photo or Video
          </label>
          <input
            className="block w-full text-sm text-gray-900 border-2 border-gray-300 rounded-md shadow-sm cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 px-2 py-2"
            id="file_input"
            type="file"
            name="file"
            accept="image/*, video/*"
          />
        </div>
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Upload Story
        </button>
      </form>
    </div>
  );
};

export default MediaForm;