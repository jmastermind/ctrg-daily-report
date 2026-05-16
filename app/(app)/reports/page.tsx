'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

type Report = {
  id: string;
  date: string;
  status: 'DRAFT' | 'SUBMITTED';
  smjena: string | null;
  createdAt: string;
  userId: string;
  user?: { displayName: string; departmentName: string | null };
};

type User = { id: string; displayName: string; departmentName: string | null };

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Nacrt',
  SUBMITTED: 'Predano',
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-800',
  SUBMITTED: 'bg-green-100 text-green-800',
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>('USER');

  const [filterUser, setFilterUser] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [sort, setSort] = useState('date_desc');

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterUser) params.set('userId', filterUser);
    if (filterStatus) params.set('status', filterStatus);
    if (filterFrom) params.set('from', filterFrom);
    if (filterTo) params.set('to', filterTo);
    params.set('sort', sort);

    const res = await fetch(`/api/reports?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setReports(data.reports ?? data);
    }
    setLoading(false);
  }, [filterUser, filterStatus, filterFrom, filterTo, sort]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((u) => {
        setRole(u.role);
        if (u.role !== 'USER') {
          fetch('/api/users')
            .then((r) => r.ok ? r.json() : { users: [] })
            .then((d) => setUsers(Array.isArray(d.users) ? d.users : Array.isArray(d) ? d : []));
        }
      });
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  async function deleteReport(id: string) {
    if (!confirm('Obrisati ovaj izvještaj?')) return;
    await fetch(`/api/reports/${id}`, { method: 'DELETE' });
    fetchReports();
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {role === 'USER' ? 'Moji izvještaji' : 'Svi izvještaji'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{reports.length} izvještaja pronađeno</p>
        </div>
        {(role === 'USER' || role === 'ADMIN') && (
          <Link
            href="/reports/new"
            className="flex items-center gap-2 px-4 py-2 bg-[#C41230] text-white rounded-lg text-sm font-medium hover:bg-[#9c0e26] transition"
          >
            <span>+</span> Novi izvještaj
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {role !== 'USER' && (
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230]"
            >
              <option value="">Svi odjeli</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.displayName}{u.departmentName ? ` — ${u.departmentName}` : ''}
                </option>
              ))}
            </select>
          )}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230]"
          >
            <option value="">Svi statusi</option>
            <option value="DRAFT">Nacrt</option>
            <option value="SUBMITTED">Predano</option>
          </select>
          <input
            type="date"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            placeholder="Od datuma"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230]"
          />
          <input
            type="date"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
            placeholder="Do datuma"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230]"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230]"
          >
            <option value="date_desc">Datum ↓ (najnoviji)</option>
            <option value="date_asc">Datum ↑ (najstariji)</option>
          </select>
        </div>
        {(filterUser || filterStatus || filterFrom || filterTo) && (
          <button
            onClick={() => { setFilterUser(''); setFilterStatus(''); setFilterFrom(''); setFilterTo(''); }}
            className="mt-3 text-xs text-[#C41230] hover:underline"
          >
            Ukloni filtre
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Učitavanje...</div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <div className="text-gray-500 text-sm">Nema pronađenih izvještaja</div>
            {role !== 'SUPERVISOR' && (
              <Link href="/reports/new" className="mt-4 inline-block text-sm text-[#C41230] hover:underline">
                Kreirajte prvi izvještaj →
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
                  {role !== 'USER' && <th className="text-left px-4 py-3 font-medium text-gray-600">Voditelj / Odjel</th>}
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Smjena</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Kreiran</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {new Date(r.date).toLocaleDateString('hr-HR')}
                    </td>
                    {role !== 'USER' && (
                      <td className="px-4 py-3">
                        <div className="text-gray-900">{r.user?.displayName ?? '—'}</div>
                        {r.user?.departmentName && (
                          <div className="text-gray-400 text-xs">{r.user.departmentName}</div>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3 text-gray-600">{r.smjena ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[r.status]}`}>
                        {STATUS_LABEL[r.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(r.createdAt).toLocaleDateString('hr-HR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/reports/${r.id}`}
                          className="text-xs px-3 py-1.5 border border-gray-200 rounded-md hover:border-[#C41230] hover:text-[#C41230] transition"
                        >
                          Pregled
                        </Link>
                        <a
                          href={`/api/reports/${r.id}/pdf`}
                          className="text-xs px-3 py-1.5 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                        >
                          PDF
                        </a>
                        {(role === 'ADMIN' || (r.status === 'DRAFT' && role !== 'SUPERVISOR')) && (
                          <button
                            onClick={() => deleteReport(r.id)}
                            className="text-xs px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-md transition"
                          >
                            Obriši
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
