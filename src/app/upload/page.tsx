// src/app/upload/page.tsx
import MediaForm from '@/components/MediaForm';
import { requireAuth } from '@/lib/authActions';

const Upload = async () => {
  await requireAuth();
  return (
    <main>
      <h1 className="text-4xl font-bold">Upload Story</h1>
      <p className="mt-2 text-gray-600">
        Share your shopping experience with others!
      </p>
      <MediaForm />
    </main>
  );
};

export default Upload;