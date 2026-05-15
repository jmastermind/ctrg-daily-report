import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer';
import { createElement as h } from 'react';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const FOOTER_TEXT =
  'Color trgovina d.o.o. za trgovinu | Industrijska 42, 34 000 Požega | OIB 44543107610 | MB 2068672 | Tel: 034/638-701 | E-mail: info@color-trgovina.com | Registrirano u Trgovačkom sudu u Slavonskom Brodu | MBS 050038921 | Temeljni kapital 955.760,00 eura | Direktorica: Matea Šutalo | IBAN HR2624020061100497443 Erste & Steiermärkische Bank d.d.';

const PRIMARY = '#C41230';

const s = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: 'Helvetica', flexDirection: 'column' },
  header: { marginBottom: 16, flexDirection: 'row', alignItems: 'center' },
  logo: { width: 180, height: 60, objectFit: 'contain' },
  footer: {
    marginTop: 'auto', paddingTop: 6, borderTopWidth: 1, borderTopColor: '#e5e7eb',
    fontSize: 6, color: '#6b7280', textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 13, fontFamily: 'Helvetica-Bold', color: PRIMARY,
    marginBottom: 10, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: PRIMARY,
  },
  field: { marginBottom: 8 },
  fieldLabel: {
    fontSize: 7, color: '#6b7280', fontFamily: 'Helvetica-Bold',
    marginBottom: 2, textTransform: 'uppercase',
  },
  fieldValue: { fontSize: 10, color: '#111827' },
  fieldEmpty: { fontSize: 10, color: '#9ca3af', fontStyle: 'italic' },
  content: { flex: 1 },
});

function display(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'DA' : 'NE';
  return String(v);
}

function field(label: string, value: unknown) {
  const d = display(value);
  return h(View, { style: s.field },
    h(Text, { style: s.fieldLabel }, label),
    h(Text, { style: d === '—' ? s.fieldEmpty : s.fieldValue }, d)
  );
}

function makePage(logoBase64: string | null, title: string, ...fields: React.ReactElement[]) {
  const header = h(View, { style: s.header },
    logoBase64
      ? h(Image, { style: s.logo, src: `data:image/png;base64,${logoBase64}` })
      : h(Text, { style: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: PRIMARY } }, 'Color Trgovina')
  );
  const footer = h(View, { style: s.footer }, h(Text, null, FOOTER_TEXT));

  return h(Page, { size: 'A4', style: s.page },
    header,
    h(View, { style: s.content },
      h(Text, { style: s.sectionTitle }, title),
      ...fields
    ),
    footer
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildDocument(report: any, logoBase64: string | null) {
  const dateStr = report.date ? new Date(report.date).toLocaleDateString('hr-HR') : '—';

  return h(Document, null,
    makePage(logoBase64, '1. Osnovni podaci',
      field('Datum', dateStr),
      field('Smjena', report.smjena),
      field('Voditelj odjela', report.user?.displayName ?? report.userId),
      field('Naziv odjela', report.user?.departmentName),
      field('Status izvještaja', report.status === 'SUBMITTED' ? 'Predano' : 'Nacrt'),
    ),
    makePage(logoBase64, '2. Stanje odjela',
      field('Urednost i čistoća odjela', report.urednostCistoca),
      field('Stanje polica i izloženosti robe', report.stanjePolica),
      field('Jesu li cijene i deklaracije uredne', report.cijeneDeklaracije),
      field('Uočeni problemi ili oštećenja', report.uoceniProblemi),
    ),
    makePage(logoBase64, '3. Stanje robe i zaliha',
      field('Artikli kojih nedostaje', report.artiklNedostaje),
      field('Artikli koji se najviše prodaju', report.artiklNajprodavaniji),
      field('Roba za otpis ili oštećena roba', report.robaOtpis),
      field('Potrebne narudžbe robe', report.potrebneNarudzbe),
      field('TOP 1000 – izloženost', report.top1000Izlozenost),
    ),
    makePage(logoBase64, '4. Prodaja i rezultati',
      field('Procjena dnevne prodaje odjela', report.procjenaDnevneProdaje),
      field('Posebno uspješni artikli ili akcije', report.uspjesniArtikliAkcije),
      field('Problemi u prodaji', report.problemiProdaje),
      field('Prijedlozi za povećanje prodaje', report.prijedloziPovecanjaProdaje),
    ),
    makePage(logoBase64, '5. Rad zaposlenika',
      field('Prisustvo zaposlenika uredno', report.prisustvouUredno),
      field('Problemi u organizaciji rada', report.problemiOrganizacijeRada),
      field('Napomene o radu zaposlenika', report.napomeneZaposlenici),
      field('Potrebna dodatna edukacija', report.dodatnaEdukacija),
    ),
    makePage(logoBase64, '6. Kupci i reklamacije',
      field('Broj reklamacija ili prigovora', report.brojReklamacija),
      field('Vrsta reklamacija', report.vrstaReklamacija),
      field('Način rješavanja problema', report.nacinRjesenja),
      field('Pohvale ili pozitivni komentari', report.pohvaleKomentari),
    ),
    makePage(logoBase64, '7. Sigurnost i tehnički problemi',
      field('Sigurnosni problemi na odjelu', report.sigurnosniProblemi),
      field('Kvarovi uređaja ili opreme', report.kvaroviOpreme),
      field('Potreban servis ili održavanje', report.servisOdrzavanje),
      field('Zaštita na radu kontrolirana', report.zastiteNaRadu),
    ),
    makePage(logoBase64, '8. Dodatne napomene',
      field('Napomene', report.dodatneNapomene),
    ),
    makePage(logoBase64, '9. Potpis',
      field('Voditelj odjela', report.user?.displayName ?? report.userId),
      field('Datum i vrijeme predaje', report.datumVrijemePredaje
        ? new Date(report.datumVrijemePredaje).toLocaleString('hr-HR')
        : '—'),
    ),
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
    include: { user: { select: { id: true, displayName: true, departmentName: true } } },
  });

  if (!report) return NextResponse.json({ error: 'Izvještaj nije pronađen.' }, { status: 404 });
  if (session.role === 'USER' && report.userId !== session.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let logoBase64: string | null = null;
  const logoPath = join(process.cwd(), 'public', 'logo.png');
  if (existsSync(logoPath)) {
    logoBase64 = readFileSync(logoPath).toString('base64');
  }

  const doc = buildDocument(report, logoBase64);
  const buffer = await renderToBuffer(doc);

  const dateStr = report.date ? new Date(report.date).toISOString().slice(0, 10) : 'izvjestaj';

  return new Response(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="izvjestaj-${dateStr}.pdf"`,
    },
  });
}
