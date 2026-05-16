import { NextRequest } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import {
  Document,
  Font,
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

// Register Roboto which supports Croatian characters (ć, š, ž, đ, č)
const fontDir = join(process.cwd(), 'public', 'fonts');
if (existsSync(join(fontDir, 'Roboto-Regular.ttf'))) {
  Font.register({
    family: 'Roboto',
    fonts: [
      { src: join(fontDir, 'Roboto-Regular.ttf') },
      { src: join(fontDir, 'Roboto-Bold.ttf'), fontWeight: 700 },
    ],
  });
}
const FONT = existsSync(join(fontDir, 'Roboto-Regular.ttf')) ? 'Roboto' : 'Helvetica';
const FONT_BOLD = existsSync(join(fontDir, 'Roboto-Bold.ttf')) ? 'Roboto' : 'Helvetica-Bold';

// Exact footer text from the Word template
const FOOTER_LINE1 = 'Color trgovina d.o.o. za trgovinu, Industrijska 42, 34 000 Požega, OIB 44543107610, MB 2068672';
const FOOTER_LINE2 = 'Tel: 034/638-701, Fax: 034/638-740, E-mail: info@color-trgovina.com';
const FOOTER_LINE3 = 'Društvo je registrirano u Trgovačkom sudu u Slavonskom Brodu, MBS 050038921';
const FOOTER_LINE4 = 'Temeljni kapital uplaćen u cijelosti iznosi 955.760,00 eura. Član Uprave - direktorica Matea Šutalo';
const FOOTER_LINE5 = 'IBAN HR2624020061100497443 Erste & Steiermärkische Bank d.d. Rijeka';

const PRIMARY = '#C41230';

const s = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingBottom: 60,
    paddingHorizontal: 32,
    fontSize: 9,
    fontFamily: FONT,
    flexDirection: 'column',
  },
  header: {
    marginBottom: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 6,
  },
  logo: { width: '100%', height: 70, objectFit: 'contain' },
  footer: {
    position: 'absolute',
    bottom: 12,
    left: 32,
    right: 32,
    borderTopWidth: 0.5,
    borderTopColor: '#9ca3af',
    paddingTop: 4,
  },
  footerLine: { fontSize: 5.5, color: '#6b7280', textAlign: 'center', lineHeight: 1.4 },
  // Section styling
  sectionTitle: {
    fontSize: 9,
    fontFamily: FONT_BOLD,
    color: PRIMARY,
    backgroundColor: '#fff0f2',
    paddingVertical: 3,
    paddingHorizontal: 5,
    marginTop: 8,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: PRIMARY,
  },
  // Two-column grid for fields
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  fieldHalf: { width: '50%', paddingRight: 8, marginBottom: 5 },
  fieldFull: { width: '100%', marginBottom: 5 },
  fieldLabel: {
    fontSize: 6,
    color: '#9ca3af',
    fontFamily: FONT_BOLD,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 1,
  },
  fieldValue: { fontSize: 8.5, color: '#111827' },
  fieldEmpty: { fontSize: 8.5, color: '#d1d5db' },
  // Signature line at end
  signatureLine: {
    marginTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#d1d5db',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBlock: { width: '45%' },
  signatureLabel: { fontSize: 7, color: '#6b7280', marginBottom: 2 },
  signatureValue: { fontSize: 8.5, color: '#111827', fontFamily: FONT_BOLD },
});

function display(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'DA' : 'NE';
  return String(v);
}

function fieldHalf(label: string, value: unknown) {
  const d = display(value);
  return h(View, { style: s.fieldHalf },
    h(Text, { style: s.fieldLabel }, label),
    h(Text, { style: d === '—' ? s.fieldEmpty : s.fieldValue }, d)
  );
}

function fieldFull(label: string, value: unknown) {
  const d = display(value);
  return h(View, { style: s.fieldFull },
    h(Text, { style: s.fieldLabel }, label),
    h(Text, { style: d === '—' ? s.fieldEmpty : s.fieldValue }, d)
  );
}

function header(logoBase64: string | null) {
  return h(View, { style: s.header },
    logoBase64
      ? h(Image, { style: s.logo, src: `data:image/png;base64,${logoBase64}` })
      : h(Text, { style: { fontSize: 12, fontFamily: FONT_BOLD, color: PRIMARY } }, 'Color Trgovina')
  );
}

function footer() {
  return h(View, { style: s.footer },
    h(Text, { style: s.footerLine }, FOOTER_LINE1),
    h(Text, { style: s.footerLine }, FOOTER_LINE2),
    h(Text, { style: s.footerLine }, FOOTER_LINE3),
    h(Text, { style: s.footerLine }, FOOTER_LINE4),
    h(Text, { style: s.footerLine }, FOOTER_LINE5),
  );
}

function sectionTitle(title: string) {
  return h(Text, { style: s.sectionTitle }, title);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildDocument(report: any, logoBase64: string | null) {
  const dateStr = report.date ? new Date(report.date).toLocaleDateString('hr-HR') : '—';
  const predanoStr = report.datumVrijemePredaje
    ? new Date(report.datumVrijemePredaje).toLocaleString('hr-HR')
    : '—';

  // Page 1: Sections 1–4 (basic data, department status, goods, sales)
  const page1 = h(Page, { size: 'A4', style: s.page },
    header(logoBase64),

    sectionTitle('1. Osnovni podaci'),
    h(View, { style: s.grid },
      fieldHalf('Datum', dateStr),
      fieldHalf('Smjena', report.smjena),
      fieldHalf('Voditelj odjela', report.user?.displayName ?? report.userId),
      fieldHalf('Naziv odjela', report.user?.departmentName ?? null),
    ),

    sectionTitle('2. Stanje odjela'),
    h(View, { style: s.grid },
      fieldHalf('Urednost i čistoća odjela', report.urednostCistoca),
      fieldHalf('Stanje polica i izloženosti robe', report.stanjePolica),
      fieldHalf('Cijene i deklaracije uredne', report.cijeneDeklaracije),
      fieldFull('Uočeni problemi ili oštećenja', report.uoceniProblemi),
    ),

    sectionTitle('3. Stanje robe i zaliha'),
    h(View, { style: s.grid },
      fieldHalf('Artikli kojih nedostaje', report.artiklNedostaje),
      fieldHalf('Artikli koji se najviše prodaju', report.artiklNajprodavaniji),
      fieldHalf('Roba za otpis ili oštećena roba', report.robaOtpis),
      fieldHalf('Potrebne narudžbe robe', report.potrebneNarudzbe),
      fieldFull('TOP 1000 – izloženost', report.top1000Izlozenost),
    ),

    sectionTitle('4. Prodaja i rezultati'),
    h(View, { style: s.grid },
      fieldHalf('Procjena dnevne prodaje odjela', report.procjenaDnevneProdaje),
      fieldHalf('Posebno uspješni artikli ili akcije', report.uspjesniArtikliAkcije),
      fieldHalf('Problemi u prodaji', report.problemiProdaje),
      fieldFull('Prijedlozi za povećanje prodaje', report.prijedloziPovecanjaProdaje),
    ),

    footer(),
  );

  // Page 2: Sections 5–9 (employees, customers, safety, notes, signature)
  const page2 = h(Page, { size: 'A4', style: s.page },
    header(logoBase64),

    sectionTitle('5. Rad zaposlenika'),
    h(View, { style: s.grid },
      fieldHalf('Prisustvo zaposlenika uredno', report.prisustvouUredno),
      fieldHalf('Problemi u organizaciji rada', report.problemiOrganizacijeRada),
      fieldFull('Napomene o radu zaposlenika', report.napomeneZaposlenici),
      fieldFull('Potrebna dodatna edukacija zaposlenika', report.dodatnaEdukacija),
    ),

    sectionTitle('6. Kupci i reklamacije'),
    h(View, { style: s.grid },
      fieldHalf('Broj reklamacija ili prigovora kupaca', report.brojReklamacija),
      fieldHalf('Vrsta reklamacija', report.vrstaReklamacija),
      fieldHalf('Način rješavanja problema', report.nacinRjesenja),
      fieldFull('Pohvale ili pozitivni komentari kupaca', report.pohvaleKomentari),
    ),

    sectionTitle('7. Sigurnost i tehnički problemi'),
    h(View, { style: s.grid },
      fieldHalf('Sigurnosni problemi na odjelu', report.sigurnosniProblemi),
      fieldHalf('Kvarovi uređaja ili opreme', report.kvaroviOpreme),
      fieldHalf('Potreban servis ili održavanje', report.servisOdrzavanje),
      fieldHalf('Zaštita na radu kontrolirana', report.zastiteNaRadu),
    ),

    sectionTitle('8. Dodatne napomene'),
    h(View, { style: s.grid },
      fieldFull('Napomene', report.dodatneNapomene),
    ),

    // Section 9: Signature block
    h(View, { style: s.signatureLine },
      h(View, { style: s.signatureBlock },
        h(Text, { style: s.signatureLabel }, '9. POTPIS — Voditelj odjela'),
        report.user?.signatureImage
          ? h(Image, {
              style: { width: 120, height: 40, objectFit: 'contain', marginBottom: 4 },
              src: `data:image/png;base64,${report.user.signatureImage}`,
            })
          : null,
        h(Text, { style: s.signatureValue }, report.user?.displayName ?? report.userId),
      ),
      h(View, { style: s.signatureBlock },
        h(Text, { style: s.signatureLabel }, 'Datum i vrijeme predaje izvještaja'),
        h(Text, { style: s.signatureValue }, predanoStr),
      ),
    ),

    footer(),
  );

  return h(Document, null, page1, page2);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
    include: { user: { select: { id: true, displayName: true, departmentName: true, signatureImage: true } } },
  });

  if (!report) return Response.json({ error: 'Izvještaj nije pronađen.' }, { status: 404 });
  if (session.role === 'USER' && report.userId !== session.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
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
