import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body as { username: string; password: string };

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Korisničko ime i lozinka su obavezni.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { username, active: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Neispravno korisničko ime ili lozinka.' },
        { status: 401 }
      );
    }

    const passwordMatch = await bcryptjs.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Neispravno korisničko ime ili lozinka.' },
        { status: 401 }
      );
    }

    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role as 'USER' | 'SUPERVISOR' | 'ADMIN',
      displayName: user.displayName,
      departmentName: user.departmentName ?? undefined,
    };

    const token = await signToken(tokenPayload);

    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        displayName: user.displayName,
        departmentName: user.departmentName,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Interna greška servera.' },
      { status: 500 }
    );
  }
}
