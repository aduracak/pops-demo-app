import React, { useEffect, useState } from 'react';
import { Clock, QrCode, Check } from 'lucide-react';
import { Coupon } from '../types/pops';

interface CouponCardProps {
  coupon: Coupon;
  index?: number;
  availableAgainAt?: number;
  onSelectCoupon: (coupon: Coupon) => void;
}

function formatRemainingTime(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  return [hrs, mins, secs].map((n) => String(n).padStart(2, '0')).join(':');
}

export const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  index = 0,
  availableAgainAt,
  onSelectCoupon,
}) => {
  const [now, setNow] = useState(Date.now());
  const isLocked = Boolean(availableAgainAt && availableAgainAt > now);

  useEffect(() => {
    if (!availableAgainAt) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [availableAgainAt]);

  const remainingMs = availableAgainAt ? Math.max(0, availableAgainAt - now) : 0;

  return (
    <div
      style={{ animationDelay: `${index * 45}ms` }}
      onClick={() => {
        if (!isLocked) {
          onSelectCoupon(coupon);
        }
      }}
      className={`animate-card-enter group relative overflow-hidden rounded-[24px] border transition-all duration-200 ${
        isLocked
          ? 'bg-[#EAE4D8] border-[#D8D0C2] opacity-75 cursor-not-allowed'
          : 'bg-white border-[#DFD8CB] hover:border-[#161412] hover:-translate-y-0.5 cursor-pointer active:scale-[0.975] shadow-[0_4px_14px_rgba(22,20,18,0.06)] hover:shadow-[0_10px_24px_rgba(22,20,18,0.1)]'
      }`}
    >
      {/* Main Content */}
      <div className="flex gap-3.5 p-3.5">
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-[#EAE4D8]">
          <img
            src={coupon.imageUrl}
            alt={coupon.title}
            className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
              isLocked ? 'grayscale contrast-75' : 'group-hover:scale-108'
            }`}
            loading="lazy"
          />
          <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-[#161412] text-white font-extrabold text-[10px] tracking-tight">
            {coupon.discountBadge}
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7268]">
                {coupon.tag || 'Kupon ponuda'}
              </span>
              <span className="font-mono text-[11px] font-extrabold text-[#DF3B16]">
                +{coupon.pointsReward} PTS
              </span>
            </div>

            <h3 className="font-extrabold text-[15px] text-[#161412] leading-snug mt-0.5 line-clamp-1">
              {coupon.title}
            </h3>
            <p className="text-xs text-[#6B635B] line-clamp-2 mt-0.5 leading-relaxed">
              {coupon.subtitle}
            </p>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-lg font-extrabold text-[#161412] font-mono">
              {coupon.promoPrice.toFixed(2)} KM
            </span>
            <span className="text-xs text-[#9C9388] line-through font-mono">
              {coupon.originalPrice.toFixed(2)} KM
            </span>
          </div>
        </div>
      </div>

      {/* Physical Perforated Ticket Divider */}
      <div className="relative border-t border-dashed border-[#D6CEC0] px-4 py-2.5 bg-[#FAF8F4] flex items-center justify-between">
        <div className="paper-notch-left" />
        <div className="paper-notch-right" />

        {isLocked ? (
          <>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#161412]">
              <Check className="w-4 h-4 text-[#0D9464] stroke-[2.5]" />
              <span>Iskorišteno na kasi</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#6B635B]">
              <Clock className="w-3.5 h-3.5" />
              <span>Dostupno za {formatRemainingTime(remainingMs)}</span>
            </span>
          </>
        ) : (
          <>
            <span className="text-[11px] font-semibold text-[#7A7268]">
              Može se iskoristiti jednom u 24h
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#DF3B16] group-hover:translate-x-0.5 transition-transform duration-200">
              <QrCode className="w-3.5 h-3.5" />
              <span>Aktiviraj na kasi →</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
};
