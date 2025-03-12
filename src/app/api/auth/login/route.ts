import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    // Örnek: Kullanıcıyı doğrulama (gerçek bir veritabanı kontrolü yapmalısınız)
    if (username === 'test' && password === 'password') {
      const token = jwt.sign({ user_id: 1, username }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '1h',
      });

      const cookieStore = cookies();
      cookieStore.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600, // 1 saat
      });

      return NextResponse.json({ message: 'Login successful' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}