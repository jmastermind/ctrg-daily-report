import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sp = request.nextUrl.searchParams;
  const userId = sp.get('userId') ?? undefined;
  const from = sp.get('from') ?? undefined;
  const to = sp.get('to') ?? undefined;
  const status = sp.get('status') ?? undefined;
  const sort = sp.get('sort') ?? 'date_desc';

  const where: Record<string, unknown> = {};

  if (session.role === 'USER') {
    where.userId = session.id;
  } else if (userId) {
    where.userId = userId;
  }

  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, unknown>).gte = new Date(from);
    if (to) (where.date as Record<string, unknown>).lte = new Date(to);
  }

  if (status) {
    where.status = status;
  }

  const orderBy =
    sort === 'date_asc'
      ? { date: 'asc' as const }
      : { date: 'desc' as const };

  const reports = await prisma.report.findMany({
    where,
    orderBy,
    include:
      session.role !== 'USER'
        ? {
            user: {
              select: {
                id: true,
                displayName: true,
                departmentName: true,
              },
            },
          }
        : undefined,
  });

  return NextResponse.json({ reports });
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    let targetUserId = session.id;
    if (session.role !== 'USER' && body.userId) {
      targetUserId = body.userId as string;
    }

    const isSubmit = body.submit === true;

    const report = await prisma.report.create({
      data: {
        userId: targetUserId,
        date: body.date ? new Date(body.date as string) : new Date(),
        status: isSubmit ? 'SUBMITTED' : 'DRAFT',
        datumVrijemePredaje: isSubmit ? new Date() : null,
        smjena: body.smjena ?? null,
        urednostCistoca: body.urednostCistoca ?? null,
        stanjePolica: body.stanjePolica ?? null,
        cijeneDeklaracije: body.cijeneDeklaracije ?? null,
        uoceniProblemi: body.uoceniProblemi ?? null,
        artiklNedostaje: body.artiklNedostaje ?? null,
        artiklNajprodavaniji: body.artiklNajprodavaniji ?? null,
        robaOtpis: body.robaOtpis ?? null,
        potrebneNarudzbe: body.potrebneNarudzbe ?? null,
        top1000Izlozenost: body.top1000Izlozenost ?? null,
        procjenaDnevneProdaje: body.procjenaDnevneProdaje ?? null,
        uspjesniArtikliAkcije: body.uspjesniArtikliAkcije ?? null,
        problemiProdaje: body.problemiProdaje ?? null,
        prijedloziPovecanjaProdaje: body.prijedloziPovecanjaProdaje ?? null,
        prisustvouUredno: body.prisustvouUredno ?? null,
        problemiOrganizacijeRada: body.problemiOrganizacijeRada ?? null,
        napomeneZaposlenici: body.napomeneZaposlenici ?? null,
        dodatnaEdukacija: body.dodatnaEdukacija ?? null,
        brojReklamacija: body.brojReklamacija ?? null,
        vrstaReklamacija: body.vrstaReklamacija ?? null,
        nacinRjesenja: body.nacinRjesenja ?? null,
        pohvaleKomentari: body.pohvaleKomentari ?? null,
        sigurnosniProblemi: body.sigurnosniProblemi ?? null,
        kvaroviOpreme: body.kvaroviOpreme ?? null,
        servisOdrzavanje: body.servisOdrzavanje ?? null,
        zastiteNaRadu: body.zastiteNaRadu ?? null,
        dodatneNapomene: body.dodatneNapomene ?? null,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json(
      { error: 'Interna greška servera.' },
      { status: 500 }
    );
  }
}
