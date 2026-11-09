import React, { useEffect, useState } from 'react';
import { Check, QrCode, ScanLine, ShoppingBag } from 'lucide-react';
import {
  ActiveCheckoutSession,
  LoyaltyTransaction,
  User,
} from '../types/pops';
import {
  awardOrderPointsByStaff,
  startMemberCardSession,
} from '../services/popsStore';
import { QrCodeSvg } from './QrCodeSvg';
import { AnimatedCounter } from './AnimatedCounter';

interface LoyaltyQrViewProps {
  user: User;
  activeSession: ActiveCheckoutSession | null;
  transactions: LoyaltyTransaction[];
  onSwitchToStaff: () => void;
}

export const ReceiptView: React.FC<LoyaltyQrViewProps> = ({
  user,
  activeSession,
  transactions,
  onSwitchToStaff,
}) => {
  const [liveTime, setLiveTime] = useState(() =>
    new Date().toLocaleTimeString('bs-BA')
  );
  const [quickDemoFeedback, setQuickDemoFeedback] = useState<string | null>(
    null
  );

  useEffect(() => {
    startMemberCardSession();
    const timer = setInterval(() => {
      setLiveTime(new Date().toLocaleTimeString('bs-BA'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickDemoOrderScan = (amountKm: number) => {
    const res = awardOrderPointsByStaff(
      amountKm,
      "Pop's Istočno Sarajevo — Kasa 1"
    );
    if (res.ok) {
      setQuickDemoFeedback(res.message);
    }
  };

  const isRecentlyVerifiedCard =
    activeSession?.mode === 'loyalty_card' &&
    activeSession.status === 'verified';

  return (
    <div className="animate-view-enter space-y-5 pb-12">
      {/* Personal Member QR Card for ANY Order */}
      <div className="rounded-[28px] bg-white border border-[#DFD8CB] p-6 text-center shadow-[0_6px_24px_rgba(22,20,18,0.05)]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F0E8] border border-[#E2DBD0] text-[11px] font-mono font-bold text-[#161412] mb-3">
          <span className="w-2 h-2 rounded-full bg-[#0D9464] animate-ping" />
          <span>LIČNI LOYALTY QR • {liveTime}</span>
        </div>

        <h2 className="text-xl font-extrabold text-[#161412] tracking-tight">
          Bodovi za svaku narudžbu
        </h2>
        <p className="text-xs text-[#6B635B] mt-1 max-w-xs mx-auto leading-relaxed">
          Naručujete bez kupona? Pokažite ovaj QR kod radniku pri plaćanju i ostvarite{' '}
          <strong className="text-[#161412]">1 PTS za svaku 1 KM</strong> računa.
        </p>

        {/* QR Code with Live Sweeping Laser */}
        <div className="my-5 flex justify-center">
          <div className="animate-qr-reveal relative inline-block overflow-hidden rounded-2xl">
            <QrCodeSvg
              value={`POPS-CARD|${user.memberCode}|${user.fullName}`}
              size={210}
            />
            <div className="animate-qr-laser absolute left-3 right-3 h-0.5 bg-[#DF3B16] shadow-[0_0_10px_#DF3B16] pointer-events-none" />
          </div>
        </div>

        {/* Member Code & Points Balance */}
        <div className="grid grid-cols-2 gap-2.5 bg-[#F4F0E8] rounded-2xl p-3.5 text-left border border-[#E2DBD0]">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7A7268]">
              Članski broj
            </span>
            <span className="font-mono text-sm font-extrabold text-[#161412]">
              #{user.memberCode}
            </span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7A7268]">
              Trenutno stanje
            </span>
            <span className="font-mono text-sm font-extrabold text-[#DF3B16]">
              <AnimatedCounter value={user.points} /> PTS
            </span>
          </div>
        </div>

        {/* Live Confirmation Banner when Cashier Scans */}
        {(isRecentlyVerifiedCard || quickDemoFeedback) && (
          <div className="animate-stamp-pop mt-4 p-3.5 rounded-2xl bg-[#0D9464] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm">
            <Check className="w-4 h-4 shrink-0 stroke-[3]" />
            <span>
              {quickDemoFeedback ||
                `Upisano +${activeSession?.pointsReward} PTS za račun od ${activeSession?.orderAmountKm?.toFixed(2)} KM!`}
            </span>
          </div>
        )}

        {/* Quick Demo Triggers for Client Presentation */}
        <div className="mt-5 pt-4 border-t border-dashed border-[#DFD8CB]">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7A7268] mb-2.5">
            Probaj kako radnik skenira običnu narudžbu na kasi:
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[10, 18, 25].map((km) => (
              <button
                key={km}
                type="button"
                onClick={() => handleQuickDemoOrderScan(km)}
                className="py-2.5 px-2 rounded-xl bg-[#F4F0E8] hover:bg-[#161412] hover:text-white active:scale-95 border border-[#D6CEC0] text-xs font-extrabold text-[#161412] transition-all font-mono"
              >
                Račun {km} KM (+{km}b)
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onSwitchToStaff}
            className="w-full mt-2.5 py-2.5 rounded-xl bg-[#161412] active:scale-[0.98] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-transform"
          >
            <ScanLine className="w-3.5 h-3.5 text-[#DF3B16]" />
            <span>Otvori skener radnika na kasi</span>
          </button>
        </div>
      </div>

      {/* Points History */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-extrabold text-[#161412]">
            Historija osvojenih bodova
          </h3>
          <span className="text-xs font-mono text-[#6B635B]">
            {transactions.length} stavki
          </span>
        </div>

        <div className="space-y-2">
          {transactions.map((tx, idx) => {
            const isPositive = tx.pointsDelta > 0;
            return (
              <div
                key={tx.id}
                style={{ animationDelay: `${idx * 35}ms` }}
                className="animate-card-enter p-3.5 rounded-2xl bg-white border border-[#DFD8CB] flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#F4F0E8] flex items-center justify-center shrink-0 mt-0.5 text-[#161412]">
                    {tx.type === 'coupon_activated' ? (
                      <QrCode className="w-4 h-4" />
                    ) : (
                      <ShoppingBag className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-extrabold text-[#161412] truncate">
                      {tx.title}
                    </h4>
                    <p className="text-[11px] text-[#6B635B] truncate mt-0.5">
                      {tx.subtitle}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`font-mono font-extrabold text-sm ${
                      isPositive ? 'text-[#0D9464]' : 'text-[#DF3B16]'
                    }`}
                  >
                    {isPositive ? `+${tx.pointsDelta}` : tx.pointsDelta} PTS
                  </span>
                  {tx.amountKm !== undefined && (
                    <span className="block text-[10px] font-mono text-[#6B635B]">
                      {tx.amountKm.toFixed(2)} KM
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
