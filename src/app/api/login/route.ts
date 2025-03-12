// src/app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/authActions';

export async function POST(request: NextRequest) {
  return login(request);
}