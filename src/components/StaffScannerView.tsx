import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Check, Gift, Plus, ScanLine } from 'lucide-react';
import {
  ActiveCheckoutSession,
  Coupon,
  CouponUsageMap,
  LoyaltyTransaction,
} from '../types/pops';
import {
  awardOrderPointsByStaff,
  startCouponCheckoutSession,
  verifyCouponByStaff,
  verifyRewardByStaff,
} from '../services/popsStore';
import { StaffTab } from './BubbleNavbar';

interface StaffScannerViewProps {
  staffTab: StaffTab;
  allCoupons: Coupon[];
  activeSession: ActiveCheckoutSession | null;
  couponUsages: CouponUsageMap;
  transactions: LoyaltyTransaction[];
  externalScanTriggerCount: number;
}

export const StaffScannerView: React.FC<StaffScannerViewProps> = ({
  staffTab,
  allCoupons,
  activeSession,
  couponUsages,
  transactions,
  externalScanTriggerCount,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState(
    "Pop's Istočno Sarajevo — Kasa 1"
  );
  const [orderAmountInput, setOrderAmountInput] = useState('15');
  const [scanResult, setScanResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      setCameraError(
        'Kamera nije dostupna na ovom uređaju. Koristite brzu potvrdu ispod.'
      );
      setCameraActive(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Triggered when the worker taps the BIG CENTER SCAN BUTTON in the Bubble Navbar
  useEffect(() => {
    if (externalScanTriggerCount === 0) return;

    if (
      activeSession &&
      activeSession.status === 'waiting_for_scan' &&
      activeSession.mode === 'coupon'
    ) {
      const res = verifyCouponByStaff(activeSession.qrPayload, selectedBranch);
      setScanResult(res);
    } else if (
      activeSession &&
      activeSession.status === 'waiting_for_scan' &&
      activeSession.mode === 'reward'
    ) {
      const res = verifyRewardByStaff(activeSession.rewardId, selectedBranch);
      setScanResult(res);
    } else if (
      activeSession &&
      activeSession.status === 'waiting_for_scan' &&
      activeSession.mode === 'loyalty_card'
    ) {
      const amt = parseFloat(orderAmountInput) || 15;
      const res = awardOrderPointsByStaff(amt, selectedBranch);
      setScanResult(res);
    } else {
      if (!cameraActive) {
        startCamera();
      }
      const firstAvail = allCoupons.find((c) => {
        const u = couponUsages[c.id];
        return !u || u.availableAgainAt <= Date.now();
      });
      if (firstAvail) {
        const session = startCouponCheckoutSession(firstAvail.id);
        const res = verifyCouponByStaff(session.qrPayload, selectedBranch);
        setScanResult(res);
      }
    }
  }, [externalScanTriggerCount]);

  const handleVerifyActiveCouponSession = () => {
    const res = verifyCouponByStaff(activeSession?.qrPayload, selectedBranch);
    setScanResult(res);
  };

  const handleVerifyActiveRewardSession = () => {
    const res = verifyRewardByStaff(activeSession?.rewardId, selectedBranch);
    setScanResult(res);
  };

  const handleAwardOrderPoints = (amountKm: number) => {
    const res = awardOrderPointsByStaff(amountKm, selectedBranch);
    setScanResult(res);
  };

  const handleQuickScanCoupon = (coupon: Coupon) => {
    try {
      const session = startCouponCheckoutSession(coupon.id);
      const res = verifyCouponByStaff(session.qrPayload, selectedBranch);
      setScanResult(res);
    } catch (err) {
      setScanResult({
        ok: false,
        message: err instanceof Error ? err.message : 'Greška pri skeniranju.',
      });
    }
  };

  if (staffTab === 'history') {
    return (
      <div className="space-y-4 pb-12">
        <div className="rounded-[24px] bg-white border border-[#DFD8CB] p-5">
          <h2 className="text-base font-extrabold text-[#161412]">
            Evidencija skeniranja u smjeni
          </h2>
          <p className="text-xs text-[#6B635B] mt-0.5">{selectedBranch}</p>

          <div className="mt-4 space-y-2.5">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 rounded-2xl bg-[#F4F0E8] border border-[#E2DBD0] flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-extrabold text-[#161412] truncate">
                    {tx.title}
                  </h4>
                  <p className="text-[11px] text-[#6B635B] truncate">
                    {tx.subtitle}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-extrabold text-xs text-[#0D9464]">
                    {tx.amountKm !== undefined
                      ? `${tx.amountKm.toFixed(2)} KM`
                      : 'POTVRĐENO'}
                  </span>
                  <span className="block font-mono text-[10px] text-[#6B635B]">
                    {tx.pointsDelta >= 0 ? `+${tx.pointsDelta}` : tx.pointsDelta} PTS
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      {/* Staff Scanner Terminal Card */}
      <div className="rounded-[28px] bg-[#161412] text-white p-5 shadow-[0_14px_30px_rgba(22,20,18,0.18)]">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#DF3B16]">
            KASA SKENER
          </span>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-[#24201D] border border-[#332D28] rounded-xl px-2.5 py-1 text-[11px] text-white outline-none"
          >
            <option value="Pop's Istočno Sarajevo — Kasa 1">
              Istočno Sarajevo — Kasa 1
            </option>
            <option value="Pop's Kiseljak — Kasa 1">Kiseljak — Kasa 1</option>
            <option value="Pop's Banja Luka — Kasa 1">
              Banja Luka — Kasa 1
            </option>
          </select>
        </div>

        {/* Camera Viewport */}
        <div className="relative rounded-2xl overflow-hidden bg-[#0B0908] border border-[#2C2622] h-48 flex flex-col items-center justify-center">
          {cameraActive ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-6 border-2 border-[#DF3B16] rounded-2xl pointer-events-none">
                <div className="w-full h-0.5 bg-[#DF3B16] animate-scanline" />
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/80 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <CameraOff className="w-3.5 h-3.5 text-red-400" />
                <span>Isključi</span>
              </button>
            </>
          ) : (
            <div className="text-center p-4 space-y-2.5">
              <div className="w-11 h-11 rounded-2xl bg-[#221E1B] flex items-center justify-center mx-auto text-white">
                <Camera className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white">
                Skeniraj Kupon, Nagrade ili Moj QR gosta
              </p>
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 rounded-xl bg-white text-[#161412] font-extrabold text-xs inline-flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                <span>Uključi kameru</span>
              </button>
            </div>
          )}
        </div>

        {cameraError && (
          <p className="text-xs text-[#F59E0B] mt-2.5">{cameraError}</p>
        )}
      </div>

      {/* Last Scan Feedback Banner */}
      {scanResult && (
        <div
          className={`animate-stamp-pop rounded-[24px] border p-4 flex items-start gap-3 ${
            scanResult.ok
              ? 'bg-[#0D9464] text-white border-[#0A7B52]'
              : 'bg-red-100 text-red-900 border-red-300'
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm">
              {scanResult.ok ? 'Uspješno potvrđeno na kasi' : 'Greška'}
            </h4>
            <p className="text-xs opacity-95 mt-0.5 leading-relaxed">
              {scanResult.message}
            </p>
          </div>
        </div>
      )}

      {/* Waiting Reward Voucher at Register */}
      {activeSession &&
        activeSession.status === 'waiting_for_scan' &&
        activeSession.mode === 'reward' && (
          <div className="animate-card-enter rounded-[24px] bg-white border-2 border-[#0D9464] p-4 shadow-md">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0D9464] flex items-center gap-1">
              <Gift className="w-3.5 h-3.5" />
              DETEKTOVAN GRATIS VAUČER NAGRADE • {activeSession.sessionId}
            </span>
            <h3 className="text-base font-extrabold text-[#161412] mt-0.5">
              {activeSession.rewardTitle}
            </h3>
            <p className="text-xs text-[#5C554E] mt-0.5">
              Za naplatu: <strong className="text-[#0D9464] font-mono">0.00 KM (GRATIS)</strong> • Skida se -{activeSession.pointsCost} PTS
            </p>

            <button
              type="button"
              onClick={handleVerifyActiveRewardSession}
              className="w-full mt-3 py-3.5 rounded-2xl bg-[#0D9464] text-white font-extrabold text-xs flex items-center justify-center gap-2"
            >
              <ScanLine className="w-4 h-4" />
              <span>POTVRDI GRATIS NAGRADU NA KASI</span>
            </button>
          </div>
        )}

      {/* Waiting Coupon at Register */}
      {activeSession &&
        activeSession.status === 'waiting_for_scan' &&
        activeSession.mode === 'coupon' && (
          <div className="animate-card-enter rounded-[24px] bg-white border-2 border-[#DF3B16] p-4 shadow-md">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#DF3B16]">
              DETEKTOVAN KUPON GOSTA • {activeSession.sessionId}
            </span>
            <h3 className="text-base font-extrabold text-[#161412] mt-0.5">
              {activeSession.couponTitle}
            </h3>
            <p className="text-xs text-[#5C554E] mt-0.5">
              Akcijska cijena:{' '}
              <strong className="text-[#161412] font-mono">
                {activeSession.promoPrice?.toFixed(2)} KM
              </strong>{' '}
              • +{activeSession.pointsReward} PTS
            </p>

            <button
              type="button"
              onClick={handleVerifyActiveCouponSession}
              className="w-full mt-3 py-3.5 rounded-2xl bg-[#DF3B16] text-white font-extrabold text-xs flex items-center justify-center gap-2"
            >
              <ScanLine className="w-4 h-4" />
              <span>POTVRDI KUPON I AKTIVIRAJ POPUST</span>
            </button>
          </div>
        )}

      {/* 1. Dodjela bodova za bilo koju narudžbu (Moj Loyalty QR) */}
      <div className="rounded-[24px] bg-white border border-[#DFD8CB] p-4 space-y-3">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#DF3B16]">
            OPCIJA 1 • OBIČNA NARUDŽBA (BEZ KUPONA)
          </span>
          <h3 className="text-sm font-extrabold text-[#161412] mt-0.5">
            Skeniran lični QR gosta → Dodijeli bodove po iznosu
          </h3>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[8, 15, 22, 35].map((km) => (
            <button
              key={km}
              type="button"
              onClick={() => handleAwardOrderPoints(km)}
              className="py-2.5 rounded-xl bg-[#F4F0E8] hover:bg-[#161412] hover:text-white active:scale-95 border border-[#D6CEC0] font-mono text-xs font-extrabold text-[#161412] transition-all"
            >
              {km} KM
              <span className="block text-[10px] text-[#DF3B16]">+{km}b</span>
            </button>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <input
            type="number"
            min="1"
            step="0.5"
            value={orderAmountInput}
            onChange={(e) => setOrderAmountInput(e.target.value)}
            placeholder="Iznos računa u KM..."
            className="flex-1 bg-[#F4F0E8] border border-[#D6CEC0] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#161412] outline-none"
          />
          <button
            type="button"
            onClick={() =>
              handleAwardOrderPoints(parseFloat(orderAmountInput) || 0)
            }
            className="px-4 py-2.5 rounded-xl bg-[#161412] active:scale-95 text-white text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-transform"
          >
            <Plus className="w-3.5 h-3.5 text-[#DF3B16]" />
            <span>Upiši bodove</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Coupon Scan */}
      <div className="rounded-[24px] bg-white border border-[#DFD8CB] p-4">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6B635B] block mb-2.5">
          OPCIJA 2 • OČITAJ KUPON SA TELEFONA GOSTA
        </span>

        <div className="space-y-2">
          {allCoupons.map((cpn) => {
            const usage = couponUsages[cpn.id];
            const isLocked = Boolean(usage && usage.availableAgainAt > Date.now());

            return (
              <div
                key={cpn.id}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#F4F0E8] border border-[#E2DBD0]"
              >
                <div className="min-w-0">
                  <span className="font-extrabold text-xs text-[#161412] block truncate">
                    {cpn.title}
                  </span>
                  <span className="text-[11px] font-mono text-[#6B635B]">
                    {cpn.promoPrice.toFixed(2)} KM • +{cpn.pointsReward} PTS
                  </span>
                </div>

                {isLocked ? (
                  <span className="px-2.5 py-1 rounded-xl bg-[#DFD8CB] text-[10px] font-mono font-bold text-[#5C554E] shrink-0">
                    Iskorišten (24h)
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleQuickScanCoupon(cpn)}
                    className="px-3.5 py-2 rounded-xl bg-[#161412] hover:bg-[#2B2622] active:scale-95 text-white font-extrabold text-xs shrink-0 flex items-center gap-1.5 transition-all"
                  >
                    <ScanLine className="w-3.5 h-3.5 text-[#DF3B16]" />
                    <span>Očitaj</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
