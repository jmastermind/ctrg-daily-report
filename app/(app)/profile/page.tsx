'use client';

import { useEffect, useRef, useState } from 'react';

type Profile = {
  id: string;
  username: string;
  displayName: string;
  departmentName: string | null;
  signatureImage: string | null;
  role: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((me) =>
        fetch(`/api/users/${me.id}`).then((r) => r.json())
      )
      .then((u: Profile) => {
        setProfile(u);
        setDisplayName(u.displayName);
      });
  }, []);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (file.size > 1_500_000) {
      setMsg({ type: 'err', text: 'Slika je prevelika (max 1.5 MB).' });
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      await save(profile.id, { signatureImage: base64 });
    };
    reader.readAsDataURL(file);
  }

  async function clearSignature() {
    if (!profile) return;
    await save(profile.id, { signatureImage: null });
  }

  async function saveName() {
    if (!profile) return;
    await save(profile.id, { displayName });
  }

  async function save(id: string, data: Record<string, unknown>) {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Greška pri spremanju');
      const updated: Profile = await res.json();
      setProfile(updated);
      setDisplayName(updated.displayName);
      setMsg({ type: 'ok', text: 'Uspješno spremljeno.' });
    } catch {
      setMsg({ type: 'err', text: 'Greška pri spremanju.' });
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return <div className="text-center py-20 text-gray-400 text-sm">Učitavanje...</div>;
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Moj profil</h1>
        <p className="text-gray-500 text-sm mt-1">@{profile.username}</p>
      </div>

      {msg && (
        <div className={`mb-5 p-3 rounded-lg text-sm ${
          msg.type === 'ok'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Name */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Ime i prezime voditelja odjela
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230] focus:border-transparent"
            placeholder="Ime i prezime"
          />
          <button
            onClick={saveName}
            disabled={saving || displayName === profile.displayName}
            className="px-4 py-2.5 bg-[#C41230] text-white rounded-lg text-sm font-medium hover:bg-[#9c0e26] transition disabled:opacity-50"
          >
            Spremi
          </button>
        </div>
        {profile.departmentName && (
          <p className="mt-2 text-xs text-gray-400">Odjel: {profile.departmentName}</p>
        )}
      </div>

      {/* Signature */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
          Potpis
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Uploadajte sliku potpisa (PNG/JPG, bijela ili prozirna pozadina). Prikazuje se na PDF izvještaju.
        </p>

        {/* Preview area */}
        <div className="border border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center min-h-[120px] mb-4 relative overflow-hidden">
          {profile.signatureImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={`data:image/png;base64,${profile.signatureImage}`}
              alt="Potpis"
              className="max-h-28 max-w-full object-contain"
            />
          ) : (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">✍️</div>
              <p className="text-sm text-gray-400">Nema uploadanog potpisa</p>
            </div>
          )}
        </div>

        {/* Signature line preview (as it appears in PDF) */}
        {profile.signatureImage && (
          <div className="mb-4 px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-400 mb-2">Prikaz u PDF-u:</p>
            <div className="border-t border-gray-400 pt-1">
              <p className="text-xs text-gray-600">{profile.displayName}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={saving}
            className="flex-1 py-2.5 border border-[#C41230] text-[#C41230] rounded-lg text-sm font-medium hover:bg-red-50 transition disabled:opacity-50"
          >
            {profile.signatureImage ? 'Zamijeni potpis' : 'Upload potpisa'}
          </button>
          {profile.signatureImage && (
            <button
              onClick={clearSignature}
              disabled={saving}
              className="px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-lg text-sm transition disabled:opacity-50"
            >
              Ukloni
            </button>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={onFileChange}
        />
      </div>
    </div>
  );
}
