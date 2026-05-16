'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? 'Prijava nije uspjela. Provjerite podatke.');
      }
    } catch {
      setError('Greška pri prijavi. Pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo-app.png"
            alt="Color Trgovina"
            width={240}
            height={80}
            priority
            style={{ objectFit: 'contain' }}
          />
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Dnevni Izvještaj
        </h1>
        <p className="text-center text-gray-500 text-sm mb-8">
          Prijavite se sa svojim korisničkim podacima
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Korisničko ime
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230] focus:border-transparent transition"
              placeholder="Unesite korisničko ime"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Lozinka
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C41230] focus:border-transparent transition"
              placeholder="Unesite lozinku"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#C41230] hover:bg-[#9c0e26] text-white font-semibold rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Prijava...' : 'Prijava'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-400">
          Color Trgovina d.o.o. &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
