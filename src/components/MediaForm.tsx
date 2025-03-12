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
      // TODO: create form data and add the form content to it
      const formData = new FormData(e.currentTarget);
      // TODO: send the form data to Next.js API endpoint /api/media using fetchData function
      const options = {
        method: 'POST',
        body: formData,
      };
      const uploadResult = await fetchData<MediaResponse>(
        '/api/media',
        options,
      );
      // TODO: if result OK, redirect to the home page to see the uploaded media
      if (!uploadResult) {
        throw new CustomError('Error uploading media', 500);
      }

      // lisätään tägi lomakkeesta
      const data = {
        tag_name: formData.get('tag') as string,
        media_id: uploadResult.media.media_id,
      };

      const tagOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'appilcation/json',
        },
        body: JSON.stringify(data),
      };

      const tagResult = await fetchData<MessageResponse>(
        '/api/tags',
        tagOptions,
      );
      if (!tagResult) {
        throw new CustomError('Error adding tag', 500);
      }

      // lisätään sovelluskohtainen tägi
      const appData = {
        tag_name: 'ilenApp',
        media_id: uploadResult.media.media_id,
      };

      const appOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'appilcation/json',
        },
        body: JSON.stringify(appData),
      };

      const appResult = await fetchData<MessageResponse>(
        '/api/tags',
        appOptions,
      );
      if (!appResult) {
        throw new CustomError('Error adding appTag', 500);
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
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Description
          </label>
          <input
            type="text"
            name="description"
            id="description"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="file"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            File
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
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default MediaForm;