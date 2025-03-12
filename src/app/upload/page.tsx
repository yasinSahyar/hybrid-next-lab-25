// src/app/upload/page.tsx
import { requireAuth } from '@/lib/authActions';
import UploadForm from './UploadForm';

export default async function Upload() {
  await requireAuth();
  console.log('Kullanıcı doğrulandı, Yükleme sayfası render ediliyor');
  return (
    <main>
      <h1 className="text-4xl font-bold">Yükleme</h1>
      <UploadForm />
    </main>
  );
}