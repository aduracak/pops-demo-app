import React, { useEffect, useState } from 'react';
import { Check, Clock, QrCode, ScanLine, X } from 'lucide-react';
import { ActiveCheckoutSession, Coupon } from '../types/pops';
import {
  clearActiveCheckoutSession,
  startCouponCheckoutSession,
  verifyCouponByStaff,
} from '../services/popsStore';
import { QrCodeSvg } from './QrCodeSvg';

interface CouponModalProps {
  coupon: Coupon;
  activeSession: ActiveCheckoutSession | null;
  onClose: () => void;
  onSwitchToStaffScanner: () => void;
}

export const CouponModal: React.FC<CouponModalProps> = ({
  coupon,
  activeSession,
  onClose,
  onSwitchToStaffScanner,
}) => {
  const [step, setStep] = useState<'preview' | 'qr_active' | 'verified'>('preview');
  const [liveClock, setLiveClock] = useState<string>(
    new Date().toLocaleTimeString('bs-BA')
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      activeSession &&
      activeSession.couponId === coupon.id &&
      activeSession.status === 'verified'
    ) {
      setStep('verified');
    } else if (
      activeSession &&
      activeSession.couponId === coupon.id &&
      activeSession.status === 'waiting_for_scan'
    ) {
      setStep('qr_active');
    }
  }, [activeSession, coupon.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveClock(new Date().toLocaleTimeString('bs-BA'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleActivateAtRegister = () => {
    try {
      setError(null);
      startCouponCheckoutSession(coupon.id);
      setStep('qr_active');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri aktivaciji.');
    }
  };

  const handleSimulateStaffScan = () => {
    const result = verifyCouponByStaff(
      activeSession?.qrPayload,
      "Pop's Istočno Sarajevo — Kasa 1"
    );
    if (!result.ok) {
      setError(result.message);
    } else {
      setStep('verified');
    }
  };

  const handleCloseModal = () => {
    if (step !== 'qr_active') {
      clearActiveCheckoutSession();
    }
    onClose();
  };

  const savingsKm = Math.max(0, coupon.originalPrice - coupon.promoPrice);

  return (
    <div className="animate-backdrop-fade fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#161412]/70 backdrop-blur-xs p-0 sm:p-4">
      <div className="animate-sheet-up relative w-full max-w-md bg-[#F4F0E8] border-t sm:border border-[#D6CEC0] rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.45)] max-h-[92vh] flex flex-col text-[#161412]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2DBD0] bg-white">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#161412] text-white font-extrabold text-[10px] uppercase tracking-wider">
              {coupon.discountBadge}
            </span>
            <span className="text-xs font-mono text-[#6B635B]">
              {step === 'preview' && 'Kupon detalji'}
              {step === 'qr_active' && 'Skeniranje na kasi'}
              {step === 'verified' && 'Aktiviran kupon'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            className="w-8 h-8 rounded-full bg-[#F4F0E8] hover:bg-[#E5DEC9] active:scale-90 flex items-center justify-center text-[#161412] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {step === 'preview' && (
            <div className="animate-view-enter space-y-5">
              <div className="relative h-48 rounded-2xl overflow-hidden bg-[#161412] border border-[#D6CEC0]">
                <img
                  src={coupon.imageUrl}
                  alt={coupon.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-[#161412] text-white font-mono font-extrabold text-xs px-3 py-1 rounded-full">
                  +{coupon.pointsReward} PTS
                </div>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-[#161412] tracking-tight">
                  {coupon.title}
                </h3>
                <p className="text-sm text-[#5C554E] mt-1 leading-relaxed">
                  {coupon.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-white border border-[#DFD8CB] rounded-2xl p-3.5 text-center">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7A7268]">
                    Akcijska cijena
                  </span>
                  <span className="text-lg font-extrabold text-[#161412] font-mono">
                    {coupon.promoPrice.toFixed(2)} KM
                  </span>
                </div>
                <div className="border-x border-[#EAE4D8]">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7A7268]">
                    Ušteda
                  </span>
                  <span className="text-lg font-extrabold text-[#0D9464] font-mono">
                    -{savingsKm.toFixed(2)} KM
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7A7268]">
                    Loyalty
                  </span>
                  <span className="text-lg font-extrabold text-[#DF3B16] font-mono">
                    +{coupon.pointsReward} PTS
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white border border-[#DFD8CB] text-xs text-[#5C554E]">
                <Clock className="w-4 h-4 text-[#161412] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#161412] block mb-0.5">
                    Jednokratna aktivacija na 24h:
                  </strong>
                  Kada radnik na kasi skenira QR kod, ostvarujete popust i bodove, a ovaj kupon se zaključava na 24 sata.
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-xs text-red-800 font-semibold">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleActivateAtRegister}
                className="w-full py-4 rounded-2xl bg-[#DF3B16] hover:bg-[#C83210] active:scale-[0.97] text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_8px_20px_rgba(223,59,22,0.3)]"
              >
                <QrCode className="w-5 h-5" />
                <span>Aktiviraj na kasi</span>
              </button>
            </div>
          )}

          {step === 'qr_active' && (
            <div className="animate-qr-reveal text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161412] text-white text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                <span>AKTIVAN KOD • {liveClock}</span>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-[#161412]">
                  {coupon.title}
                </h3>
                <p className="text-xs text-[#5C554E] mt-0.5">
                  Pokažite ekran radniku na kasi ({coupon.promoPrice.toFixed(2)} KM • +{coupon.pointsReward} PTS)
                </p>
              </div>

              {/* QR Code with Live Sweeping Laser Line */}
              <div className="py-2 flex justify-center">
                <div className="relative inline-block overflow-hidden rounded-2xl">
                  <QrCodeSvg
                    value={
                      activeSession?.qrPayload ||
                      `POPS-CPN|${coupon.id}|${coupon.promoPrice}`
                    }
                    size={215}
                  />
                  <div className="animate-qr-laser absolute left-3 right-3 h-0.5 bg-[#DF3B16] shadow-[0_0_10px_#DF3B16] pointer-events-none" />
                </div>
              </div>

              <div className="bg-white border border-[#DFD8CB] rounded-2xl p-3 max-w-xs mx-auto">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-[#7A7268]">
                  Broj kupon sesije
                </span>
                <span className="font-mono text-base font-extrabold text-[#161412] tracking-wider">
                  {activeSession?.sessionId || 'SES-POPS1'}
                </span>
              </div>

              <div className="pt-3 border-t border-[#DFD8CB] grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleSimulateStaffScan}
                  className="py-3 px-3 rounded-2xl bg-[#161412] hover:bg-[#2A2521] active:scale-95 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <ScanLine className="w-4 h-4 text-[#DF3B16]" />
                  <span>Potvrdi sken (Demo)</span>
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
                  VERIFIKOVANO NA KASI
                </span>
                <h3 className="text-2xl font-extrabold text-[#161412] tracking-tight">
                  Kupon je aktiviran
                </h3>
                <p className="text-xs text-[#6B635B] mt-0.5">
                  {activeSession?.verifiedByLocation ||
                    "Pop's Istočno Sarajevo — Kasa 1"}
                </p>
              </div>

              <div className="bg-white border border-[#DFD8CB] rounded-2xl p-4 space-y-2.5 text-left">
                <div className="flex items-center justify-between text-xs border-b border-[#EAE4D8] pb-2.5">
                  <span className="text-[#6B635B]">Ponuda:</span>
                  <strong className="text-[#161412] font-bold">{coupon.title}</strong>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-[#EAE4D8] pb-2.5">
                  <span className="text-[#6B635B]">Za naplatu:</span>
                  <strong className="text-base font-mono font-extrabold text-[#161412]">
                    {coupon.promoPrice.toFixed(2)} KM
                  </strong>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6B635B]">Upisani bodovi:</span>
                  <span className="font-mono font-extrabold text-sm text-[#DF3B16]">
                    +{coupon.pointsReward} PTS
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#EAE4D8] text-xs text-[#161412] font-bold">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Ponovo dostupan za 24 sata.</span>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
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
