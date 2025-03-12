// src/lib/authActions.ts
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import CustomError from '../classes/CustomError';
import jwt from 'jsonwebtoken';
import { TokenContent } from 'hybrid-types/DBTypes'; // Tür dosyanıza göre yolu ayarlayın

// Kullanıcı girişi (login)
export async function login(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  try {
    const authResponse = await fetch(`${process.env.AUTH_API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!authResponse.ok) {
      const errorData = await authResponse.json();
      throw new CustomError(errorData.message || 'Giriş başarısız', authResponse.status);
    }

    const { token } = await authResponse.json();
    console.log('Giriş başarılı, token alındı:', token);

    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    throw error; // Hata, login sayfasında yakalanacak
  }
}

// Çıkış yapma (logout)
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set('session', '', { expires: new Date(0) });
}

// Oturum bilgisini alma (getSession)
export async function getSession() {
  if (!process.env.JWT_SECRET) {
    throw new CustomError('JWT anahtarı ayarlanmamış', 500);
  }
  const key = process.env.JWT_SECRET;

  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) {
    console.log('Oturum bulunamadı');
    return null;
  }

  try {
    const decoded = jwt.verify(session, key) as TokenContent;
    console.log('Oturum doğrulandı:', decoded);
    return decoded;
  } catch (error) {
    console.error('JWT doğrulama hatası:', error);
    return null;
  }
}

// Oturumu güncelleme (updateSession)
export async function updateSession(request: NextRequest) {
  if (!process.env.JWT_SECRET) {
    throw new CustomError('JWT anahtarı ayarlanmamış', 500);
  }
  const key = process.env.JWT_SECRET;
  const session = request.cookies.get('session')?.value;
  if (!session) return;

  const tokenContent = jwt.verify(session, key) as TokenContent;
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const res = NextResponse.next();
  res.cookies.set({
    name: 'session',
    value: jwt.sign(tokenContent, key, { expiresIn: '7d' }),
    httpOnly: true,
    expires,
  });
  return res;
}

// Kimlik doğrulama gerektiren sayfalar için kontrol (requireAuth)
export async function requireAuth() {
  const session = await getSession();
  if (!session?.user_id) {
    console.log('Kullanıcı oturumu bulunamadı, anasayfaya yönlendiriliyor');
    redirect('/');
  }
  console.log('Kullanıcı doğrulandı:', session.user_id);
  return session;
}