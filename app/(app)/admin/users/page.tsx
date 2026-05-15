'use client';

import { useEffect, useState } from 'react';

type User = {
  id: string;
  username: string;
  displayName: string;
  departmentName: string | null;
  role: 'USER' | 'SUPERVISOR' | 'ADMIN';
  active: boolean;
  createdAt: string;
};

const ROLE_LABEL: Record<string, string> = {
  USER: 'Voditelj odjela',
  SUPERVISOR: 'Nadzornik',
  ADMIN: 'Administrator',
};

const ROLE_COLOR: Record<string, string> = {
  USER: 'bg-green-100 text-green-800',
  SUPERVISOR: 'bg-blue-100 text-blue-800',
  ADMIN: 'bg-purple-100 text-purple-800',
};

const EMPTY_FORM = {
  username: '',
  password: '',
  displayName: '',
  departmentName: '',
  role: 'USER' as 'USER' | 'SUPERVISOR' | 'ADMIN',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const res = await fetch(`/api/users?${params}`);
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users ?? data);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  function openNew() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setError('');
    setShowModal(true);
  }

  function openEdit(u: User) {
    setEditing(u);
    setForm({
      username: u.username,
      password: '',
      displayName: u.displayName,
      departmentName: u.departmentName ?? '',
      role: u.role,
    });
    setError('');
    setShowModal(true);
  }

  async function save() {
    setSaving(true);
    setError('');
    try {
      const body: Record<string, unknown> = {
        username: form.username,
        displayName: form.displayName,
        departmentName: form.departmentName || null,
        role: form.role,
      };
      if (form.password) body.password = form.password;

      const res = editing
        ? await fetch(`/api/users/${editing.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        : await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...body, password: form.password }),
          });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Greška');
      }
      setShowModal(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Greška');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(u: User) {
    await fetch(`/api/users/${u.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !u.active }),
    });
    load();
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upravljanje korisnicima</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} korisnika</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-[#C41230] text-white rounded-lg text-sm font-medium hover:bg-[#9c0e26] transition"
        >
          <span>+</span> Novi korisnik
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pretraži po imenu ili korisničkom imenu..."
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230] focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Učitavanje...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Nema korisnika</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Korisnik</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Korisničko ime</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Odjel</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Uloga</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${!u.active ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{u.displayName}</div>
                      <div className="text-gray-400 text-xs">Kreiran {new Date(u.createdAt).toLocaleDateString('hr-HR')}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{u.username}</td>
                    <td className="px-4 py-3 text-gray-600">{u.departmentName ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLOR[u.role]}`}>
                        {ROLE_LABEL[u.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${u.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {u.active ? 'Aktivan' : 'Neaktivan'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="text-xs px-3 py-1.5 border border-gray-200 rounded-md hover:border-[#C41230] hover:text-[#C41230] transition"
                        >
                          Uredi
                        </button>
                        <button
                          onClick={() => toggleActive(u)}
                          className={`text-xs px-3 py-1.5 rounded-md transition ${
                            u.active
                              ? 'text-red-500 hover:bg-red-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {u.active ? 'Deaktiviraj' : 'Aktiviraj'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">
                {editing ? 'Uredi korisnika' : 'Novi korisnik'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Puno ime *</label>
                <input
                  type="text"
                  value={form.displayName}
                  onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230]"
                  placeholder="Ime i prezime"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Korisničko ime *</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230]"
                  placeholder="npr. pero.peric"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lozinka {editing ? '(ostavite prazno za bez promjene)' : '*'}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230]"
                  placeholder="Unesite lozinku"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Naziv odjela</label>
                <input
                  type="text"
                  value={form.departmentName}
                  onChange={(e) => setForm((f) => ({ ...f, departmentName: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230]"
                  placeholder="npr. Kućanski aparati"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Uloga</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as 'USER' | 'SUPERVISOR' | 'ADMIN' }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230] bg-white"
                >
                  <option value="USER">Voditelj odjela</option>
                  <option value="SUPERVISOR">Nadzornik</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Odustani
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 py-2.5 bg-[#C41230] text-white rounded-lg text-sm font-semibold hover:bg-[#9c0e26] transition disabled:opacity-60"
              >
                {saving ? 'Sprema...' : 'Spremi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
