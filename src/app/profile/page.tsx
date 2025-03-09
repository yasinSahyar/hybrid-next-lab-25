import { requireAuth } from '@/lib/authActions';

const Page = async () => {
  await requireAuth();
  return (
    <main>
      <h1 className="text-4xl font-bold">Profile</h1>
    </main>
  );
};

export default Page;