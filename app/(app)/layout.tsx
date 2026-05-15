'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

type User = {
  id: string;
  username: string;
  role: 'USER' | 'SUPERVISOR' | 'ADMIN';
  displayName: string;
  departmentName?: string;
};

function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-[#C41230] text-white'
          : 'text-gray-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      <span className="text-base">{icon}</span>
      {label}
    </Link>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setUser(data);
        else router.push('/login');
      });
  }, [router]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[#1e1e2e] flex flex-col transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="px-4 py-5 border-b border-white/10">
          <Image
            src="/logo.png"
            alt="Color Trgovina"
            width={160}
            height={54}
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="text-white font-semibold text-sm truncate">{user.displayName}</div>
          {user.departmentName && (
            <div className="text-gray-400 text-xs mt-0.5 truncate">{user.departmentName}</div>
          )}
          <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300' :
            user.role === 'SUPERVISOR' ? 'bg-blue-500/20 text-blue-300' :
            'bg-green-500/20 text-green-300'
          }`}>
            {user.role === 'ADMIN' ? 'Administrator' : user.role === 'SUPERVISOR' ? 'Nadzornik' : 'Voditelj odjela'}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavLink href="/dashboard" label="Početna" icon="🏠" />
          <NavLink href="/reports" label="Izvještaji" icon="📋" />
          {(user.role === 'USER' || user.role === 'ADMIN') && (
            <NavLink href="/reports/new" label="Novi izvještaj" icon="✏️" />
          )}
          <NavLink href="/profile" label="Moj profil" icon="👤" />
          {user.role === 'ADMIN' && (
            <NavLink href="/admin/users" label="Korisnici" icon="👥" />
          )}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <span>🚪</span>
            Odjava
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden bg-[#1e1e2e] text-white px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-sm">CTRG Dnevni Izvještaj</span>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
