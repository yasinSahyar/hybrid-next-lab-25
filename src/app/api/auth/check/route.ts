import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/authActions';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    console.log('Session in /api/auth/check:', session); // Hata ayıklama için
    if (!session?.user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Authorized', userId: session.user_id }, { status: 200 });
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}