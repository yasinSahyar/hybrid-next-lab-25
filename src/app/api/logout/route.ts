// src/app/api/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logout } from '@/lib/authActions';

export async function POST(request: NextRequest) {
  return logout(request);
}