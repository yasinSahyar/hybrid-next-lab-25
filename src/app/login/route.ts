// src/app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'Kullanıcı adı ve şifre gerekli' }, { status: 400 });
    }

    const authResponse = await fetch(`${process.env.AUTH_API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const responseText = await authResponse.text(); // Ham yanıtı al
    console.log('AUTH_API yanıtı:', responseText); // Konsola yazdır

    if (!authResponse.ok) {
      try {
        const errorData = JSON.parse(responseText); // JSON ayrıştırmayı dene
        return NextResponse.json(
          { message: errorData.message || 'Giriş başarısız' },
          { status: authResponse.status }
        );
      } catch (jsonError) {
        // JSON değilse (örneğin HTML), ham metni döndür
        return NextResponse.json(
          { message: 'Sunucu hatası: ' + responseText.substring(0, 100) },
          { status: authResponse.status }
        );
      }
    }

    const { token } = JSON.parse(responseText);
    console.log('Giriş başarılı, token alındı:', token);

    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    });

    return NextResponse.json({ message: 'Giriş başarılı' }, { status: 200 });
  } catch (error) {
    console.error('Giriş hatası:', error);
    return NextResponse.json(
      { message: (error as Error).message || 'Giriş başarısız' },
      { status: 500 }
    );
  }
}