import React, { useState } from 'react';
import { KeyRound, LogOut, ShieldAlert } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AdminAccountSettings: React.FC = () => {
  const { currentAdminUsername, updateAdminCredentials, logoutAdmin } = useStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState(currentAdminUsername);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password baru tidak sama.');
      return;
    }

    const res = updateAdminCredentials(currentPassword, newUsername, newPassword);
    if (!res.ok) {
      setError(res.error || 'Gagal memperbarui akun.');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-display text-3xl uppercase tracking-wide text-[#FFF4E8]">
          Pengaturan Akun Admin
        </h2>
        <p className="text-sm text-[#A7A7A7]">
          Kelola kredensial demo lokal atau keluar dari sesi admin saat ini.
        </p>
      </div>

      <div className="bg-[#111111] border border-[#FFC247]/30 rounded-lg p-4 text-xs text-[#A7A7A7] space-y-1.5">
        <div className="flex items-center gap-2 text-[#FFC247] font-semibold">
          <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Catatan Keamanan Prototipe</span>
        </div>
        <p className="leading-relaxed">
          Perubahan akun ini hanya disimulasikan di browser lokal (menggunakan hash lokal di{' '}
          <span className="font-mono text-[#FFF4E8]">localStorage</span> dan bukan autentikasi
          produksi). Untuk deployment produksi, gunakan autentikasi server-side dengan hash
          bcrypt/scrypt serta sesi HTTP-only cookie.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[#1C1C1C] border border-white/10 rounded-lg p-6 space-y-4"
      >
        <div>
          <label htmlFor="acc-current-pass" className="block text-xs text-[#A7A7A7] mb-1">
            Password Saat Ini *
          </label>
          <input
            id="acc-current-pass"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-[#111111] border border-white/10 rounded-md px-3 py-2 text-sm text-[#FFF4E8]"
          />
        </div>

        <div>
          <label htmlFor="acc-username" className="block text-xs text-[#A7A7A7] mb-1">
            Username Baru *
          </label>
          <input
            id="acc-username"
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="w-full bg-[#111111] border border-white/10 rounded-md px-3 py-2 text-sm text-[#FFF4E8]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="acc-new-pass" className="block text-xs text-[#A7A7A7] mb-1">
              Password Baru *
            </label>
            <input
              id="acc-new-pass"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#111111] border border-white/10 rounded-md px-3 py-2 text-sm text-[#FFF4E8]"
            />
          </div>

          <div>
            <label htmlFor="acc-confirm-pass" className="block text-xs text-[#A7A7A7] mb-1">
              Konfirmasi Password Baru *
            </label>
            <input
              id="acc-confirm-pass"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#111111] border border-white/10 rounded-md px-3 py-2 text-sm text-[#FFF4E8]"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-xs text-[#D71920] font-medium">
            {error}
          </p>
        )}

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-[#D71920] hover:bg-[#B8141A] text-[#FFF4E8] px-4 py-2.5 rounded-md text-sm font-semibold"
          >
            <KeyRound className="w-4 h-4" aria-hidden="true" />
            <span>Simpan Kredensial Demo</span>
          </button>

          <button
            type="button"
            onClick={logoutAdmin}
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-[#A7A7A7] hover:text-[#FFF4E8] px-4 py-2.5 rounded-md text-sm font-medium"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </form>
    </div>
  );
};
