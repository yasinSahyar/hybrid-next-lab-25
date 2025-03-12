// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { login } from '@/lib/authActions';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await login(formData);
      router.push('/'); // Giriş başarılıysa anasayfaya yönlendir
    } catch (err) {
      setError((err as Error).message || 'Giriş başarısız');
    }
  };

  return (
    <main className="flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-4">Giriş Yap</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-1/3">
        <div>
          <label htmlFor="username" className="block text-sm font-bold mb-2">
            Kullanıcı Adı
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className="shadow border rounded w-full py-2 px-3"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-bold mb-2">
            Şifre
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="shadow border rounded w-full py-2 px-3"
            required
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
          Giriş Yap
        </button>
      </form>
    </main>
  );
}