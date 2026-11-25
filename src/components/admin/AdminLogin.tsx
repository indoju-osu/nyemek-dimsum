import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock, ShieldAlert } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface AdminLoginProps {
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToStore }) => {
  const { loginAdmin, settings } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = loginAdmin(username, password);
    if (!res.ok) {
      setError(res.error || 'Gagal masuk ke dashboard.');
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-[#FFF4E8] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={onBackToStore}
          className="inline-flex items-center gap-2 text-sm text-[#A7A7A7] hover:text-[#FFF4E8] mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Kembali ke Toko {settings.brandName}</span>
        </button>

        <div className="bg-[#1C1C1C] border border-white/10 rounded-xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-[#D71920]/15 text-[#D71920]">
              <Lock className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-display text-2xl uppercase tracking-wide">
                Admin Dashboard
              </h1>
              <p className="text-xs text-[#A7A7A7]">{settings.brandName} Management Console</p>
            </div>
          </div>

          <div className="mt-4 mb-6 bg-[#111111] border border-[#FFC247]/30 rounded-lg p-3.5 text-xs text-[#A7A7A7] space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#FFC247] font-semibold">
              <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Mode Prototipe Lokal (Demo)</span>
            </div>
            <p>
              Kredensial demo bawaan: <strong className="text-[#FFF4E8] font-mono">admin</strong>{' '}
              / <strong className="text-[#FFF4E8] font-mono">admin</strong>.
            </p>
            <p className="text-[11px] leading-relaxed">
              Autentikasi frontend-only ini hanya untuk demonstrasi lokal. Untuk produksi, wajib
              menggunakan backend authentication dengan password hash dan HTTP-only cookie.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-username" className="block text-xs text-[#A7A7A7] mb-1.5">
                Username
              </label>
              <input
                id="admin-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-[#111111] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md px-3.5 py-2.5 text-sm text-[#FFF4E8]"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs text-[#A7A7A7] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#111111] border border-white/10 focus:border-[#D71920] focus:outline-none rounded-md pl-3.5 pr-10 py-2.5 text-sm text-[#FFF4E8]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A7A7A7] hover:text-[#FFF4E8] p-1"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-xs font-medium text-[#D71920] bg-[#D71920]/10 border border-[#D71920]/30 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-[#D71920] hover:bg-[#B8141A] text-[#FFF4E8] font-semibold py-2.5 px-4 rounded-md transition-colors cursor-pointer"
            >
              Masuk ke Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
