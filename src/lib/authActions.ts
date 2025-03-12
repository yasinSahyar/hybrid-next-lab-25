// src/lib/authActions.ts
import { NextRequest, NextResponse } from 'next/server'; // NextResponse import edildi
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import promisePool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { TokenContent } from 'hybrid-types';

const key = process.env.JWT_SECRET || 'yasinjan';

// Server Components için getSession
export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;
  try {
    return jwt.verify(session, key) as TokenContent;
  } catch (error) {
    console.error('JWT Verification Error:', (error as Error).message);
    return null;
  }
}

// API rotaları için getSession
export async function getSessionForAPI(request: NextRequest) {
  const cookie = request.cookies.get('session');
  const session = cookie?.value;
  if (!session) return null;
  try {
    return jwt.verify(session, key) as TokenContent;
  } catch (error) {
    console.error('JWT Verification Error:', (error as Error).message);
    return null;
  }
}

export async function updateSession(request: NextRequest) {
  const cookie = request.cookies.get('session');
  const session = cookie?.value;
  if (!session) return null;
  try {
    const tokenContent = jwt.verify(session, key) as TokenContent;
    return tokenContent;
  } catch (error) {
    console.error('JWT Verification Error:', (error as Error).message);
    return null;
  }
}

export async function requireAuth(request: NextRequest) {
  const session = await getSessionForAPI(request);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
}

export async function login(request: NextRequest) {
  const { username, password } = await request.json();
  try {
    const [rows] = await promisePool.execute<RowDataPacket[]>(
      'SELECT * FROM Users WHERE username = ?',
      [username]
    );

    if (!rows.length) {
      throw new Error('User not found');
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { user_id: user.user_id, username: user.username },
      process.env.JWT_SECRET || 'yasinjan',
      { expiresIn: '1h' }
    );

    const response = NextResponse.json({ message: 'Login successful' }, { status: 200 }); // NextResponse kullanıldı
    response.cookies.set('session', token, { httpOnly: true, path: '/' });
    return response;
  } catch (error) {
    console.error('Login error:', (error as Error).message);
    return NextResponse.json({ message: (error as Error).message }, { status: 401 }); // NextResponse kullanıldı
  }
}

export async function logout(request: NextRequest) {
  try {
    const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 }); // NextResponse kullanıldı
    response.cookies.delete('session');
    return response;
  } catch (error) {
    console.error('Logout error:', (error as Error).message);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 }); // NextResponse kullanıldı
  }
}