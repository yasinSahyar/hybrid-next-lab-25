// src/app/upload/UploadForm.tsx
'use client';

import { useState } from 'react';
import { fetchData } from '@/lib/functions';

const UploadForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      console.error('Dosya seçilmedi');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file);
    formData.append('tags', tags);

    try {
      const response = await fetchData(`${process.env.NEXT_PUBLIC_API_URL}/api/media`, {
        method: 'POST',
        body: formData,
      });
      console.log('Yükleme başarılı:', response);
      setTitle('');
      setDescription('');
      setTags('');
      setFile(null);
    } catch (error) {
      console.error('Yükleme başarısız:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col p-8">
      <div className="mb-4">
        <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
          Başlık
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
          Açıklama
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
          Etiketler (virgülle ayrılmış)
        </label>
        <input
          type="text"
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="ör. doğa, seyahat, 2025"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="file" className="block text-gray-700 text-sm font-bold mb-2">
          Dosya
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
        Yükle
      </button>
    </form>
  );
};

export default UploadForm;