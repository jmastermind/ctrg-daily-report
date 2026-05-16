'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type BoolField = boolean | null;

type FormData = {
  date: string;
  smjena: string;
  urednostCistoca: string;
  stanjePolica: string;
  cijeneDeklaracije: BoolField;
  uoceniProblemi: string;
  artiklNedostaje: string;
  artiklNajprodavaniji: string;
  robaOtpis: string;
  potrebneNarudzbe: string;
  top1000Izlozenost: string;
  procjenaDnevneProdaje: string;
  uspjesniArtikliAkcije: string;
  problemiProdaje: string;
  prijedloziPovecanjaProdaje: string;
  prisustvouUredno: BoolField;
  problemiOrganizacijeRada: string;
  napomeneZaposlenici: string;
  dodatnaEdukacija: string;
  brojReklamacija: string;
  vrstaReklamacija: string;
  nacinRjesenja: string;
  pohvaleKomentari: string;
  sigurnosniProblemi: string;
  kvaroviOpreme: string;
  servisOdrzavanje: string;
  zastiteNaRadu: BoolField;
  dodatneNapomene: string;
};

const SECTIONS = [
  '1. Osnovni podaci',
  '2. Stanje odjela',
  '3. Stanje robe i zaliha',
  '4. Prodaja i rezultati',
  '5. Rad zaposlenika',
  '6. Kupci i reklamacije',
  '7. Sigurnost i tehnički problemi',
  '8. Dodatne napomene',
  '9. Pregled i predaja',
];

const INITIAL: FormData = {
  date: new Date().toISOString().slice(0, 10),
  smjena: '',
  urednostCistoca: '',
  stanjePolica: '',
  cijeneDeklaracije: null,
  uoceniProblemi: '',
  artiklNedostaje: '',
  artiklNajprodavaniji: '',
  robaOtpis: '',
  potrebneNarudzbe: '',
  top1000Izlozenost: '',
  procjenaDnevneProdaje: '',
  uspjesniArtikliAkcije: '',
  problemiProdaje: '',
  prijedloziPovecanjaProdaje: '',
  prisustvouUredno: null,
  problemiOrganizacijeRada: '',
  napomeneZaposlenici: '',
  dodatnaEdukacija: '',
  brojReklamacija: '',
  vrstaReklamacija: '',
  nacinRjesenja: '',
  pohvaleKomentari: '',
  sigurnosniProblemi: '',
  kvaroviOpreme: '',
  servisOdrzavanje: '',
  zastiteNaRadu: null,
  dodatneNapomene: '',
};

function TextField({
  label,
  value,
  onChange,
  multiline = false,
  placeholder = '',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  const cls =
    'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230] focus:border-transparent transition bg-white';
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls + ' resize-none'}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}

function BoolField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: BoolField;
  onChange: (v: boolean) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`px-6 py-2 rounded-lg text-sm font-medium border transition ${
            value === true
              ? 'bg-green-500 text-white border-green-500'
              : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
          }`}
        >
          DA
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`px-6 py-2 rounded-lg text-sm font-medium border transition ${
            value === false
              ? 'bg-[#C41230] text-white border-[#C41230]'
              : 'bg-white text-gray-700 border-gray-300 hover:border-red-400'
          }`}
        >
          NE
        </button>
      </div>
    </div>
  );
}

export default function NewReportPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const totalSteps = SECTIONS.length;

  async function saveDraft() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, submit: false }),
      });
      if (!res.ok) throw new Error('Greška pri spremanju');
      const data = await res.json();
      router.push(`/reports/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Greška');
    } finally {
      setSaving(false);
    }
  }

  async function submitReport() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, submit: true }),
      });
      if (!res.ok) throw new Error('Greška pri predaji');
      const data = await res.json();
      router.push(`/reports/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Greška');
    } finally {
      setSaving(false);
    }
  }

  const sectionContent = [
    // Step 0: Osnovni podaci
    <div key="s1" className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Datum</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => set('date', e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230] focus:border-transparent transition"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Smjena</label>
        <select
          value={form.smjena}
          onChange={(e) => set('smjena', e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230] focus:border-transparent transition bg-white"
        >
          <option value="">Odaberite smjenu</option>
          <option value="I. smjena">I. smjena</option>
          <option value="II. smjena">II. smjena</option>
        </select>
      </div>
    </div>,

    // Step 1: Stanje odjela
    <div key="s2" className="space-y-5">
      <TextField label="Urednost i čistoća odjela" value={form.urednostCistoca} onChange={(v) => set('urednostCistoca', v)} multiline placeholder="Opišite urednost i čistoću..." />
      <TextField label="Stanje polica i izloženosti robe" value={form.stanjePolica} onChange={(v) => set('stanjePolica', v)} multiline placeholder="Opišite stanje polica..." />
      <BoolField label="Jesu li cijene i deklaracije uredno postavljene?" value={form.cijeneDeklaracije} onChange={(v) => set('cijeneDeklaracije', v)} />
      <TextField label="Uočeni problemi ili oštećenja" value={form.uoceniProblemi} onChange={(v) => set('uoceniProblemi', v)} multiline placeholder="Navedite uočene probleme..." />
    </div>,

    // Step 2: Stanje robe i zaliha
    <div key="s3" className="space-y-5">
      <TextField label="Artikli kojih nedostaje" value={form.artiklNedostaje} onChange={(v) => set('artiklNedostaje', v)} multiline placeholder="Navedite artikle..." />
      <TextField label="Artikli koji se najviše prodaju" value={form.artiklNajprodavaniji} onChange={(v) => set('artiklNajprodavaniji', v)} multiline placeholder="Navedite najprodavanije..." />
      <TextField label="Roba za otpis ili oštećena roba" value={form.robaOtpis} onChange={(v) => set('robaOtpis', v)} multiline placeholder="Navedite robu za otpis..." />
      <TextField label="Potrebne narudžbe robe" value={form.potrebneNarudzbe} onChange={(v) => set('potrebneNarudzbe', v)} multiline placeholder="Navedite potrebne narudžbe..." />
      <TextField label="TOP 1000 – izloženost" value={form.top1000Izlozenost} onChange={(v) => set('top1000Izlozenost', v)} placeholder="Status TOP 1000 izloženosti..." />
    </div>,

    // Step 3: Prodaja i rezultati
    <div key="s4" className="space-y-5">
      <TextField label="Procjena dnevne prodaje odjela" value={form.procjenaDnevneProdaje} onChange={(v) => set('procjenaDnevneProdaje', v)} placeholder="npr. 15.000 EUR" />
      <TextField label="Posebno uspješni artikli ili akcije" value={form.uspjesniArtikliAkcije} onChange={(v) => set('uspjesniArtikliAkcije', v)} multiline placeholder="Navedite uspješne artikle..." />
      <TextField label="Problemi u prodaji" value={form.problemiProdaje} onChange={(v) => set('problemiProdaje', v)} multiline placeholder="Opišite probleme..." />
      <TextField label="Prijedlozi za povećanje prodaje" value={form.prijedloziPovecanjaProdaje} onChange={(v) => set('prijedloziPovecanjaProdaje', v)} multiline placeholder="Vaši prijedlozi..." />
    </div>,

    // Step 4: Rad zaposlenika
    <div key="s5" className="space-y-5">
      <BoolField label="Prisustvo zaposlenika uredno?" value={form.prisustvouUredno} onChange={(v) => set('prisustvouUredno', v)} />
      <TextField label="Problemi u organizaciji rada" value={form.problemiOrganizacijeRada} onChange={(v) => set('problemiOrganizacijeRada', v)} multiline placeholder="Opišite probleme..." />
      <TextField label="Napomene o radu zaposlenika" value={form.napomeneZaposlenici} onChange={(v) => set('napomeneZaposlenici', v)} multiline placeholder="Specifične napomene..." />
      <TextField label="Potrebna dodatna edukacija zaposlenika" value={form.dodatnaEdukacija} onChange={(v) => set('dodatnaEdukacija', v)} multiline placeholder="Navedite potrebnu edukaciju..." />
    </div>,

    // Step 5: Kupci i reklamacije
    <div key="s6" className="space-y-5">
      <TextField label="Broj reklamacija ili prigovora kupaca" value={form.brojReklamacija} onChange={(v) => set('brojReklamacija', v)} placeholder="npr. 2" />
      <TextField label="Vrsta reklamacija" value={form.vrstaReklamacija} onChange={(v) => set('vrstaReklamacija', v)} multiline placeholder="Opišite vrstu reklamacija..." />
      <TextField label="Način rješavanja problema" value={form.nacinRjesenja} onChange={(v) => set('nacinRjesenja', v)} multiline placeholder="Kako su riješeni?" />
      <TextField label="Pohvale ili pozitivni komentari kupaca" value={form.pohvaleKomentari} onChange={(v) => set('pohvaleKomentari', v)} multiline placeholder="Pozitivni povratni odgovori..." />
    </div>,

    // Step 6: Sigurnost i tehnički problemi
    <div key="s7" className="space-y-5">
      <TextField label="Sigurnosni problemi na odjelu" value={form.sigurnosniProblemi} onChange={(v) => set('sigurnosniProblemi', v)} multiline placeholder="Opišite sigurnosne probleme..." />
      <TextField label="Kvarovi uređaja ili opreme" value={form.kvaroviOpreme} onChange={(v) => set('kvaroviOpreme', v)} multiline placeholder="Navedite kvarove..." />
      <TextField label="Potreban servis ili održavanje" value={form.servisOdrzavanje} onChange={(v) => set('servisOdrzavanje', v)} multiline placeholder="Navedite što treba servisirati..." />
      <BoolField label="Poštivanje zaštite na radu kontrolirano?" value={form.zastiteNaRadu} onChange={(v) => set('zastiteNaRadu', v)} />
    </div>,

    // Step 7: Dodatne napomene
    <div key="s8" className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Dodatne napomene</label>
        <textarea
          rows={8}
          value={form.dodatneNapomene}
          onChange={(e) => set('dodatneNapomene', e.target.value)}
          placeholder="Unesite sve ostale relevantne informacije o radu odjela..."
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230] focus:border-transparent transition resize-none"
        />
      </div>
    </div>,

    // Step 8: Pregled i predaja
    <div key="s9" className="space-y-6">
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-3">Sažetak izvještaja</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Datum:</dt>
            <dd className="font-medium">{form.date ? new Date(form.date + 'T00:00:00').toLocaleDateString('hr-HR') : '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Smjena:</dt>
            <dd className="font-medium">{form.smjena || '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Cijene uredne:</dt>
            <dd className="font-medium">{form.cijeneDeklaracije === null ? '—' : form.cijeneDeklaracije ? 'DA' : 'NE'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Prisustvo uredno:</dt>
            <dd className="font-medium">{form.prisustvouUredno === null ? '—' : form.prisustvouUredno ? 'DA' : 'NE'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Broj reklamacija:</dt>
            <dd className="font-medium">{form.brojReklamacija || '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Zaštita na radu:</dt>
            <dd className="font-medium">{form.zastiteNaRadu === null ? '—' : form.zastiteNaRadu ? 'DA' : 'NE'}</dd>
          </div>
        </dl>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={saveDraft}
          disabled={saving}
          className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
        >
          {saving ? 'Sprema...' : 'Spremi kao nacrt'}
        </button>
        <button
          onClick={submitReport}
          disabled={saving || !form.date}
          className="flex-1 py-2.5 px-4 bg-[#C41230] text-white rounded-lg text-sm font-semibold hover:bg-[#9c0e26] transition disabled:opacity-60"
        >
          {saving ? 'Predaje...' : 'Predaj izvještaj ✓'}
        </button>
      </div>
    </div>,
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Novi dnevni izvještaj</h1>
        <p className="text-gray-500 text-sm mt-1">
          Korak {step + 1} od {totalSteps}
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex gap-1">
          {SECTIONS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                i < step ? 'bg-[#C41230]' : i === step ? 'bg-[#C41230]' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <div className="mt-3 flex justify-between text-xs text-gray-400">
          <span>Početak</span>
          <span>Predaja</span>
        </div>
      </div>

      {/* Section card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#C41230] to-[#e8293b] px-6 py-4">
          <h2 className="text-white font-semibold">{SECTIONS[step]}</h2>
        </div>
        <div className="p-6">{sectionContent[step]}</div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-40"
        >
          ← Nazad
        </button>
        {step < totalSteps - 1 && (
          <button
            onClick={() => setStep((s) => Math.min(totalSteps - 1, s + 1))}
            className="px-5 py-2.5 bg-[#1e1e2e] text-white rounded-lg text-sm font-medium hover:bg-[#2d2d42] transition"
          >
            Dalje →
          </button>
        )}
      </div>
    </div>
  );
}
