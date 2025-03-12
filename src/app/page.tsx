// src/app/page.tsx
import MediaList from '@/components/MediaList';

export default function Home() {
  return (
    <main>
      <h1 className="text-4xl font-bold">Anasayfa</h1>
      <MediaList />
    </main>
  );
}