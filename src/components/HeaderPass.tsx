import React from 'react';
import { QrCode } from 'lucide-react';
import { User } from '../types/pops';
import { LOYALTY_REWARDS } from '../data/initialData';
import { AnimatedCounter } from './AnimatedCounter';

interface HeaderPassProps {
  user: User;
  onOpenMyQrTab: () => void;
}

export const HeaderPass: React.FC<HeaderPassProps> = ({
  user,
  onOpenMyQrTab,
}) => {
  const nextReward =
    LOYALTY_REWARDS.find((r) => r.pointsCost > user.points) ||
    LOYALTY_REWARDS[LOYALTY_REWARDS.length - 1];

  const progressPct = Math.min(
    100,
    Math.round((user.points / nextReward.pointsCost) * 100)
  );
  const pointsNeeded = Math.max(0, nextReward.pointsCost - user.points);

  return (
    <div className="animate-card-enter rounded-[28px] bg-white border border-[#DFD8CB] p-5 shadow-[0_8px_24px_rgba(22,20,18,0.05)]">
      {/* Top Row: Clean Member Info & Points Pill */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold text-[#7A7268]">
            Dobrodošli u Pop&apos;s
          </span>
          <h2 className="text-xl font-extrabold tracking-tight text-[#161412] leading-tight">
            {user.fullName}
          </h2>
        </div>

        <button
          type="button"
          onClick={onOpenMyQrTab}
          className="group flex items-center gap-2.5 bg-[#161412] hover:bg-[#282420] active:scale-[0.96] text-white pl-3.5 pr-3 py-2 rounded-2xl transition-all duration-200 shadow-sm"
        >
          <div className="text-right">
            <span className="block text-base font-extrabold font-mono leading-none">
              <AnimatedCounter value={user.points} />{' '}
              <span className="text-[#DF3B16] text-xs">PTS</span>
            </span>
            <span className="block text-[9px] uppercase tracking-wider text-[#A39B93] mt-0.5">
              Pokaži Moj QR
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-[#DF3B16] group-hover:scale-105 flex items-center justify-center text-white transition-transform duration-200">
            <QrCode className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* Reward Progress Bar */}
      <div className="mt-4 pt-3.5 border-t border-[#EAE4D8]">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-bold text-[#5C554E]">
            {pointsNeeded > 0
              ? `Još ${pointsNeeded} bodova do: ${nextReward.title}`
              : `Otključana nagrada: ${nextReward.title}`}
          </span>
          <span className="font-mono text-xs font-extrabold text-[#161412]">
            <AnimatedCounter value={user.points} />/{nextReward.pointsCost}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#EAE4D8] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#DF3B16] transition-all duration-700 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
};
