import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const USER_SELECT = {
  id: true,
  username: true,
  displayName: true,
  departmentName: true,
  signatureImage: true,
  role: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  // Users can fetch their own profile; admins can fetch any
  if (session.role !== 'ADMIN' && session.id !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const user = await prisma.user.findUnique({ where: { id }, select: USER_SELECT });
  if (!user) return NextResponse.json({ error: 'Korisnik nije pronađen.' }, { status: 404 });

  return NextResponse.json(user);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  // Users can update only their own profile (limited fields); admins can update anything
  const isSelf = session.id === id;
  const isAdmin = session.role === 'ADMIN';
  if (!isSelf && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json() as Record<string, unknown>;
    const updateData: Record<string, unknown> = {};

    // Fields any user can update on their own profile
    if (body.signatureImage !== undefined) {
      updateData.signatureImage = body.signatureImage; // base64 string or null to clear
    }
    if (body.displayName !== undefined) updateData.displayName = body.displayName;

    // Admin-only fields
    if (isAdmin) {
      if (body.departmentName !== undefined) updateData.departmentName = body.departmentName;
      if (body.role !== undefined) updateData.role = body.role;
      if (body.active !== undefined) updateData.active = body.active;
      if (body.username !== undefined) updateData.username = body.username;
    }

    if (body.password && typeof body.password === 'string') {
      updateData.passwordHash = await bcryptjs.hash(body.password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: USER_SELECT,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(request);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { active: false },
      select: { id: true, username: true, active: true },
    });
    return NextResponse.json(user);
  } catch (error) {
    console.error('Deactivate user error:', error);
    return NextResponse.json({ error: 'Interna greška servera.' }, { status: 500 });
  }
}
