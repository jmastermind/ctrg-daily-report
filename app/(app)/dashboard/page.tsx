import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Dobro jutro, {session.displayName}!
        </h1>
        <p className="text-gray-500 mt-1">
          {session.departmentName ? `Odjel: ${session.departmentName}` : 'CTRG Dnevni Izvještaj'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(session.role === 'USER' || session.role === 'ADMIN') && (
          <Link
            href="/reports/new"
            className="group block p-6 bg-white rounded-xl border border-gray-200 hover:border-[#C41230] hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-100 transition">
              <span className="text-xl">✏️</span>
            </div>
            <h2 className="font-semibold text-gray-900">Novi izvještaj</h2>
            <p className="text-sm text-gray-500 mt-1">Kreirajte dnevni izvještaj</p>
          </Link>
        )}

        <Link
          href="/reports"
          className="group block p-6 bg-white rounded-xl border border-gray-200 hover:border-[#C41230] hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-100 transition">
            <span className="text-xl">📋</span>
          </div>
          <h2 className="font-semibold text-gray-900">
            {session.role === 'USER' ? 'Moji izvještaji' : 'Svi izvještaji'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Pregledajte i filtrirajte izvještaje</p>
        </Link>

        {session.role === 'ADMIN' && (
          <Link
            href="/admin/users"
            className="group block p-6 bg-white rounded-xl border border-gray-200 hover:border-[#C41230] hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-100 transition">
              <span className="text-xl">👥</span>
            </div>
            <h2 className="font-semibold text-gray-900">Korisnici</h2>
            <p className="text-sm text-gray-500 mt-1">Upravljajte korisnicima i odjelima</p>
          </Link>
        )}
      </div>
    </div>
  );
}
