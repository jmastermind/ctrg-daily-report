import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, displayName: true, departmentName: true },
      },
    },
  });

  if (!report) {
    return NextResponse.json({ error: 'Izvještaj nije pronađen.' }, { status: 404 });
  }

  if (session.role === 'USER' && report.userId !== session.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ report });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.report.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Izvještaj nije pronađen.' }, { status: 404 });
  }

  if (session.role === 'USER') {
    if (existing.userId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (existing.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Nije moguće uređivati predani izvještaj.' },
        { status: 400 }
      );
    }
  }

  try {
    const body = await request.json();
    const isSubmitting = body.submit === true;

    const report = await prisma.report.update({
      where: { id },
      data: {
        date: body.date ? new Date(body.date as string) : undefined,
        status: isSubmitting ? 'SUBMITTED' : undefined,
        datumVrijemePredaje: isSubmitting ? new Date() : undefined,
        smjena: body.smjena ?? undefined,
        urednostCistoca: body.urednostCistoca ?? undefined,
        stanjePolica: body.stanjePolica ?? undefined,
        cijeneDeklaracije: body.cijeneDeklaracije ?? undefined,
        uoceniProblemi: body.uoceniProblemi ?? undefined,
        artiklNedostaje: body.artiklNedostaje ?? undefined,
        artiklNajprodavaniji: body.artiklNajprodavaniji ?? undefined,
        robaOtpis: body.robaOtpis ?? undefined,
        potrebneNarudzbe: body.potrebneNarudzbe ?? undefined,
        top1000Izlozenost: body.top1000Izlozenost ?? undefined,
        procjenaDnevneProdaje: body.procjenaDnevneProdaje ?? undefined,
        uspjesniArtikliAkcije: body.uspjesniArtikliAkcije ?? undefined,
        problemiProdaje: body.problemiProdaje ?? undefined,
        prijedloziPovecanjaProdaje: body.prijedloziPovecanjaProdaje ?? undefined,
        prisustvouUredno: body.prisustvouUredno ?? undefined,
        problemiOrganizacijeRada: body.problemiOrganizacijeRada ?? undefined,
        napomeneZaposlenici: body.napomeneZaposlenici ?? undefined,
        dodatnaEdukacija: body.dodatnaEdukacija ?? undefined,
        brojReklamacija: body.brojReklamacija ?? undefined,
        vrstaReklamacija: body.vrstaReklamacija ?? undefined,
        nacinRjesenja: body.nacinRjesenja ?? undefined,
        pohvaleKomentari: body.pohvaleKomentari ?? undefined,
        sigurnosniProblemi: body.sigurnosniProblemi ?? undefined,
        kvaroviOpreme: body.kvaroviOpreme ?? undefined,
        servisOdrzavanje: body.servisOdrzavanje ?? undefined,
        zastiteNaRadu: body.zastiteNaRadu ?? undefined,
        dodatneNapomene: body.dodatneNapomene ?? undefined,
      },
    });

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Update report error:', error);
    return NextResponse.json(
      { error: 'Interna greška servera.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.report.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Izvještaj nije pronađen.' }, { status: 404 });
  }

  if (session.role === 'USER') {
    if (existing.userId !== session.id || existing.status !== 'DRAFT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } else if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.report.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
