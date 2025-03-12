'use client';

import { useState } from 'react';
import { fetchData } from '@/lib/functions';

const MediaForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [mediaId, setMediaId] = useState<number | null>(null); // Media ID'sini saklamak için

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      console.error('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags);
    formData.append('file', file);

    try {
      const response = await fetchData('/api/media', {
        method: 'POST',
        body: formData,
      });
      console.log('Media upload successful:', response);
      if (response.mediaId) {
        setMediaId(response.mediaId); // Media ID'sini al
        await handleTagsSubmit(response.mediaId); // Etiketleri gönder
      }
    } catch (error) {
      console.error('Media upload failed:', error);
    }
  };

  const handleTagsSubmit = async (mediaId: number) => {
    try {
      const response = await fetchData('/api/tags', {
        method: 'POST',
        body: JSON.stringify({ mediaId, tags }),
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Tags upload successful:', response);
    } catch (error) {
      console.error('Tags upload failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col p-8">
      <div className="mb-4">
        <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="tags" className="block text-gray-700 text-sm font-bold mb-2">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g., nature, travel, 2025"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="file" className="block text-gray-700 text-sm font-bold mb-2">
          File
        </label>
        <input
          type="file"
          id="file"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Upload
      </button>
    </form>
  );
};

export default MediaForm;