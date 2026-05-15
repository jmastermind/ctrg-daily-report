'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type Report = {
  id: string;
  date: string;
  status: 'DRAFT' | 'SUBMITTED';
  smjena: string | null;
  datumVrijemePredaje: string | null;
  createdAt: string;
  user?: { displayName: string; departmentName: string | null };
  urednostCistoca: string | null;
  stanjePolica: string | null;
  cijeneDeklaracije: boolean | null;
  uoceniProblemi: string | null;
  artiklNedostaje: string | null;
  artiklNajprodavaniji: string | null;
  robaOtpis: string | null;
  potrebneNarudzbe: string | null;
  top1000Izlozenost: string | null;
  procjenaDnevneProdaje: string | null;
  uspjesniArtikliAkcije: string | null;
  problemiProdaje: string | null;
  prijedloziPovecanjaProdaje: string | null;
  prisustvouUredno: boolean | null;
  problemiOrganizacijeRada: string | null;
  napomeneZaposlenici: string | null;
  dodatnaEdukacija: string | null;
  brojReklamacija: string | null;
  vrstaReklamacija: string | null;
  nacinRjesenja: string | null;
  pohvaleKomentari: string | null;
  sigurnosniProblemi: string | null;
  kvaroviOpreme: string | null;
  servisOdrzavanje: string | null;
  zastiteNaRadu: boolean | null;
  dodatneNapomene: string | null;
};

function v(val: string | boolean | null | undefined): string {
  if (val === null || val === undefined || val === '') return '—';
  if (typeof val === 'boolean') return val ? 'DA' : 'NE';
  return val;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-[#C41230] to-[#e8293b] px-5 py-3">
        <h2 className="text-white font-semibold text-sm">{title}</h2>
      </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | boolean | null | undefined }) {
  const display = v(value);
  return (
    <div>
      <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</dt>
      <dd className={`text-sm ${display === '—' ? 'text-gray-300 italic' : 'text-gray-800'}`}>{display}</dd>
    </div>
  );
}

function FullField({ label, value }: { label: string; value: string | boolean | null | undefined }) {
  const display = v(value);
  return (
    <div className="sm:col-span-2">
      <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</dt>
      <dd className={`text-sm whitespace-pre-wrap ${display === '—' ? 'text-gray-300 italic' : 'text-gray-800'}`}>{display}</dd>
    </div>
  );
}

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [role, setRole] = useState('USER');

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((u) => setRole(u.role));
    fetch(`/api/reports/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { setReport(data); setLoading(false); });
  }, [id]);

  async function submit() {
    setSubmitting(true);
    await fetch(`/api/reports/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submit: true }),
    });
    const data = await fetch(`/api/reports/${id}`).then((r) => r.json());
    setReport(data);
    setSubmitting(false);
  }

  if (loading) return <div className="text-center py-20 text-gray-400 text-sm">Učitavanje...</div>;
  if (!report) return <div className="text-center py-20 text-gray-500">Izvještaj nije pronađen.</div>;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/reports" className="text-gray-400 hover:text-gray-600 text-sm">← Nazad</Link>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
              report.status === 'SUBMITTED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {report.status === 'SUBMITTED' ? 'Predano' : 'Nacrt'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Izvještaj — {new Date(report.date).toLocaleDateString('hr-HR')}
          </h1>
          {report.user && (
            <p className="text-gray-500 text-sm mt-0.5">
              {report.user.displayName}
              {report.user.departmentName ? ` · ${report.user.departmentName}` : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {report.status === 'DRAFT' && role !== 'SUPERVISOR' && (
            <button
              onClick={submit}
              disabled={submitting}
              className="px-4 py-2 bg-[#C41230] text-white rounded-lg text-sm font-medium hover:bg-[#9c0e26] transition disabled:opacity-60"
            >
              {submitting ? 'Predaje...' : 'Predaj izvještaj'}
            </button>
          )}
          <a
            href={`/api/reports/${id}/pdf`}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Preuzmi PDF
          </a>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        <Section title="1. Osnovni podaci">
          <Field label="Datum" value={new Date(report.date).toLocaleDateString('hr-HR')} />
          <Field label="Smjena" value={report.smjena} />
          {report.datumVrijemePredaje && (
            <Field label="Predano u" value={new Date(report.datumVrijemePredaje).toLocaleString('hr-HR')} />
          )}
        </Section>

        <Section title="2. Stanje odjela">
          <FullField label="Urednost i čistoća" value={report.urednostCistoca} />
          <FullField label="Stanje polica" value={report.stanjePolica} />
          <Field label="Cijene i deklaracije uredne" value={report.cijeneDeklaracije} />
          <FullField label="Uočeni problemi" value={report.uoceniProblemi} />
        </Section>

        <Section title="3. Stanje robe i zaliha">
          <FullField label="Artikli koji nedostaju" value={report.artiklNedostaje} />
          <FullField label="Najprodavaniji artikli" value={report.artiklNajprodavaniji} />
          <FullField label="Roba za otpis" value={report.robaOtpis} />
          <FullField label="Potrebne narudžbe" value={report.potrebneNarudzbe} />
          <Field label="TOP 1000 izloženost" value={report.top1000Izlozenost} />
        </Section>

        <Section title="4. Prodaja i rezultati">
          <Field label="Procjena dnevne prodaje" value={report.procjenaDnevneProdaje} />
          <FullField label="Uspješni artikli/akcije" value={report.uspjesniArtikliAkcije} />
          <FullField label="Problemi prodaje" value={report.problemiProdaje} />
          <FullField label="Prijedlozi za rast prodaje" value={report.prijedloziPovecanjaProdaje} />
        </Section>

        <Section title="5. Rad zaposlenika">
          <Field label="Prisustvo uredno" value={report.prisustvouUredno} />
          <FullField label="Problemi organizacije" value={report.problemiOrganizacijeRada} />
          <FullField label="Napomene o zaposlenicima" value={report.napomeneZaposlenici} />
          <FullField label="Potrebna edukacija" value={report.dodatnaEdukacija} />
        </Section>

        <Section title="6. Kupci i reklamacije">
          <Field label="Broj reklamacija" value={report.brojReklamacija} />
          <FullField label="Vrsta reklamacija" value={report.vrstaReklamacija} />
          <FullField label="Način rješenja" value={report.nacinRjesenja} />
          <FullField label="Pohvale i komentari" value={report.pohvaleKomentari} />
        </Section>

        <Section title="7. Sigurnost i tehnički problemi">
          <FullField label="Sigurnosni problemi" value={report.sigurnosniProblemi} />
          <FullField label="Kvarovi opreme" value={report.kvaroviOpreme} />
          <FullField label="Servis i održavanje" value={report.servisOdrzavanje} />
          <Field label="Zaštita na radu uredna" value={report.zastiteNaRadu} />
        </Section>

        <Section title="8. Dodatne napomene">
          <FullField label="Napomene" value={report.dodatneNapomene} />
        </Section>
      </div>

      <div className="mt-6 text-xs text-gray-400 text-center">
        Kreiran: {new Date(report.createdAt).toLocaleString('hr-HR')}
      </div>
    </div>
  );
}
