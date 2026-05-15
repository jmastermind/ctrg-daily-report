import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const search = request.nextUrl.searchParams.get('search') ?? '';

  const users = await prisma.user.findMany({
    where: search
      ? {
          OR: [
            { displayName: { contains: search, mode: 'insensitive' } },
            { username: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: { displayName: 'asc' },
    select: {
      id: true,
      username: true,
      displayName: true,
      departmentName: true,
      role: true,
      active: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { username, password, displayName, departmentName, role } = body as {
      username: string;
      password: string;
      displayName: string;
      departmentName?: string;
      role?: 'USER' | 'SUPERVISOR' | 'ADMIN';
    };

    if (!username || !password || !displayName) {
      return NextResponse.json(
        { error: 'username, password i displayName su obavezni.' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({ where: { username } });
    if (existing) {
      return NextResponse.json(
        { error: 'Korisnik s tim korisničkim imenom već postoji.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcryptjs.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        displayName,
        departmentName: departmentName ?? null,
        role: role ?? 'USER',
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        departmentName: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Interna greška servera.' },
      { status: 500 }
    );
  }
}
