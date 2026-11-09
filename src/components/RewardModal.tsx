import React, { useEffect, useState } from 'react';
import { Check, Gift, QrCode, ScanLine, X } from 'lucide-react';
import { ActiveCheckoutSession, LoyaltyReward } from '../types/pops';
import {
  clearActiveCheckoutSession,
  startRewardCheckoutSession,
  verifyRewardByStaff,
} from '../services/popsStore';
import { QrCodeSvg } from './QrCodeSvg';

interface RewardModalProps {
  reward: LoyaltyReward;
  activeSession: ActiveCheckoutSession | null;
  onClose: () => void;
  onSwitchToStaffScanner: () => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  reward,
  activeSession,
  onClose,
  onSwitchToStaffScanner,
}) => {
  const [step, setStep] = useState<'qr_active' | 'verified'>('qr_active');
  const [liveClock, setLiveClock] = useState<string>(
    new Date().toLocaleTimeString('bs-BA')
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      startRewardCheckoutSession(reward.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri kreiranju QR vaučera.');
    }
  }, [reward.id]);

  useEffect(() => {
    if (
      activeSession &&
      activeSession.mode === 'reward' &&
      activeSession.rewardId === reward.id &&
      activeSession.status === 'verified'
    ) {
      setStep('verified');
    }
  }, [activeSession, reward.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveClock(new Date().toLocaleTimeString('bs-BA'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSimulateStaffScan = () => {
    const res = verifyRewardByStaff(
      reward.id,
      "Pop's Istočno Sarajevo — Kasa 1"
    );
    if (!res.ok) {
      setError(res.message);
    } else {
      setStep('verified');
    }
  };

  const handleClose = () => {
    if (step !== 'qr_active') {
      clearActiveCheckoutSession();
    }
    onClose();
  };

  return (
    <div className="animate-backdrop-fade fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#161412]/70 backdrop-blur-xs p-0 sm:p-4">
      <div className="animate-sheet-up relative w-full max-w-md bg-[#F4F0E8] border-t sm:border border-[#D6CEC0] rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.45)] max-h-[92vh] flex flex-col text-[#161412]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2DBD0] bg-white">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#DF3B16] text-white font-extrabold text-[10px] uppercase tracking-wider">
              GRATIS NAGRADA • 0.00 KM
            </span>
            <span className="text-xs font-mono text-[#6B635B]">
              -{reward.pointsCost} PTS
            </span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#F4F0E8] hover:bg-[#E5DEC9] active:scale-90 flex items-center justify-center text-[#161412] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {step === 'qr_active' && (
            <div className="animate-qr-reveal text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161412] text-white text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                <span>VAUČER ZA KASU • {liveClock}</span>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-[#161412]">
                  {reward.title}
                </h3>
                <p className="text-xs text-[#5C554E] mt-1 max-w-xs mx-auto">
                  Pokažite ovaj QR vaučer radniku na kasi za preuzimanje besplatne nagrade ({reward.pointsCost} PTS).
                </p>
              </div>

              {/* QR Code with Laser Sweep */}
              <div className="py-2 flex justify-center">
                <div className="relative inline-block overflow-hidden rounded-2xl">
                  <QrCodeSvg
                    value={
                      activeSession?.qrPayload ||
                      `POPS-RWD|${reward.id}|-${reward.pointsCost}PTS`
                    }
                    size={215}
                  />
                  <div className="animate-qr-laser absolute left-3 right-3 h-0.5 bg-[#DF3B16] shadow-[0_0_10px_#DF3B16] pointer-events-none" />
                </div>
              </div>

              <div className="bg-white border border-[#DFD8CB] rounded-2xl p-3 max-w-xs mx-auto flex items-center justify-between px-4">
                <div className="text-left">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-[#7A7268]">
                    Kod vaučera
                  </span>
                  <span className="font-mono text-sm font-extrabold text-[#161412]">
                    {activeSession?.sessionId || 'RWD-POPS'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-[#7A7268]">
                    Za naplatu
                  </span>
                  <span className="font-mono text-sm font-extrabold text-[#0D9464]">
                    0.00 KM (GRATIS)
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-xs text-red-800 font-semibold">
                  {error}
                </div>
              )}

              <div className="pt-3 border-t border-[#DFD8CB] grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleSimulateStaffScan}
                  className="py-3 px-3 rounded-2xl bg-[#161412] hover:bg-[#2A2521] active:scale-95 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <ScanLine className="w-4 h-4 text-[#DF3B16]" />
                  <span>Potvrdi na kasi (Demo)</span>
                </button>

                <button
                  type="button"
                  onClick={onSwitchToStaffScanner}
                  className="py-3 px-3 rounded-2xl bg-white hover:bg-[#EAE4D8] active:scale-95 border border-[#D6CEC0] text-xs font-extrabold text-[#161412] flex items-center justify-center gap-1.5 transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Radnik mod</span>
                </button>
              </div>
            </div>
          )}

          {step === 'verified' && (
            <div className="animate-view-enter text-center py-2 space-y-5">
              <div className="relative w-16 h-16 mx-auto">
                <span className="absolute inset-0 rounded-full bg-[#0D9464]/30 animate-ping" />
                <div className="animate-stamp-pop relative w-16 h-16 rounded-full bg-[#0D9464] flex items-center justify-center text-white shadow-md">
                  <Check className="w-9 h-9 stroke-[3]" />
                </div>
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-md bg-[#0D9464]/15 text-[#0D9464] font-extrabold text-[11px] uppercase tracking-wider mb-1.5">
                  NAGRADA PREUZETA NA KASI
                </span>
                <h3 className="text-2xl font-extrabold text-[#161412] tracking-tight">
                  Uživajte u nagradi!
                </h3>
                <p className="text-xs text-[#6B635B] mt-0.5">
                  {activeSession?.verifiedByLocation ||
                    "Pop's Istočno Sarajevo — Kasa 1"}
                </p>
              </div>

              <div className="bg-white border border-[#DFD8CB] rounded-2xl p-4 space-y-2.5 text-left">
                <div className="flex items-center justify-between text-xs border-b border-[#EAE4D8] pb-2.5">
                  <span className="text-[#6B635B]">Gratis proizvod:</span>
                  <strong className="text-[#161412] font-bold flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5 text-[#DF3B16]" />
                    {reward.title}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-[#EAE4D8] pb-2.5">
                  <span className="text-[#6B635B]">Iznos za naplatu:</span>
                  <strong className="text-base font-mono font-extrabold text-[#0D9464]">
                    0.00 KM
                  </strong>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6B635B]">Iskorišteno bodova:</span>
                  <span className="font-mono font-extrabold text-sm text-[#DF3B16]">
                    -{reward.pointsCost} PTS
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3.5 rounded-2xl bg-[#161412] active:scale-[0.98] text-white font-extrabold text-sm transition-transform"
              >
                Zatvori
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
