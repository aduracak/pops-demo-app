import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { loginOrRegisterUser } from '../services/popsStore';

interface AuthScreenProps {
  onSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('Haris Kovačević');
  const [contact, setContact] = useState('haris@pops.ba');
  const [password, setPassword] = useState('••••••••');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) {
      setError('Unesite broj telefona ili email adresu.');
      return;
    }
    if (mode === 'register' && !fullName.trim()) {
      setError('Unesite vaše ime i prezime.');
      return;
    }
    loginOrRegisterUser(
      mode === 'register' ? fullName : fullName || 'Haris Kovačević',
      contact
    );
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-[#F4F0E8] text-[#161412] flex flex-col justify-between px-5 py-8 max-w-md mx-auto">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#161412] flex items-center justify-center">
              <span className="font-extrabold text-sm tracking-tight text-white">
                POP&apos;S
              </span>
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight leading-none text-[#161412]">
                pops.ba
              </h1>
              <p className="text-xs text-[#6B635B] mt-1">
                Caffe &amp; Food • Kuponi i Loyalty
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-extrabold tracking-tight text-[#161412] leading-tight mb-6">
          Prijavite se za pristup kuponima i loyalty bodovima.
        </h2>

        {/* Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#E5DEC9] mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2.5 text-xs font-extrabold rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-[#161412] text-white'
                : 'text-[#5C554E] hover:text-[#161412]'
            }`}
          >
            Prijava
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2.5 text-xs font-extrabold rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-[#161412] text-white'
                : 'text-[#5C554E] hover:text-[#161412]'
            }`}
          >
            Registracija
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-[#5C554E] mb-1.5">
                Ime i prezime
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Unesite ime i prezime"
                className="w-full bg-white border border-[#D6CEC0] focus:border-[#161412] rounded-2xl px-4 py-3 text-sm font-semibold text-[#161412] outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#5C554E] mb-1.5">
              Broj telefona ili Email
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="+387 61 ... ili email@pops.ba"
              className="w-full bg-white border border-[#D6CEC0] focus:border-[#161412] rounded-2xl px-4 py-3 text-sm font-semibold text-[#161412] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5C554E] mb-1.5">
              Lozinka
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Unesite lozinku"
              className="w-full bg-white border border-[#D6CEC0] focus:border-[#161412] rounded-2xl px-4 py-3 text-sm font-semibold text-[#161412] outline-none"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-xs text-red-800 font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 bg-[#DF3B16] hover:bg-[#C83210] active:scale-[0.99] text-white font-extrabold text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            <span>{mode === 'login' ? 'Nastavi' : 'Kreiraj nalog'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-[#7A7268] pt-6">
        Pop&apos;s Caffe &amp; Food • Istočno Sarajevo • Kiseljak • Banja Luka
      </p>
    </div>
  );
};
