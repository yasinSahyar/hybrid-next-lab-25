// src/app/page.tsx
import MediaList from '@/components/MediaList';

export default function Home() {
  return (
    <main>
      <h1 className="text-4xl font-bold">Shopping Stories</h1>
      <p className="mt-2 text-gray-600">
        Share your best shopping experiences and discover others!
      </p>
      <MediaList />
    </main>
  );
}