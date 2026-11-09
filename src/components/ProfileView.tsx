import React, { useState } from 'react';
import {
  Check,
  Copy,
  FastForward,
  Gift,
  LogOut,
  QrCode,
  ScanLine,
  UserPlus,
} from 'lucide-react';
import { LOYALTY_REWARDS } from '../data/initialData';
import {
  addReferralFriend,
  fastForward24HoursCooldown,
  verifyReferralFirstScan,
} from '../services/popsStore';
import { LoyaltyReward, ReferralInvite, User } from '../types/pops';
import { AnimatedCounter } from './AnimatedCounter';

interface ProfileViewProps {
  user: User;
  referrals: ReferralInvite[];
  cooldownCount: number;
  onSelectRewardForQr: (reward: LoyaltyReward) => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  referrals,
  cooldownCount,
  onSelectRewardForQr,
  onLogout,
}) => {
  const [copied, setCopied] = useState(false);
  const [friendNameInput, setFriendNameInput] = useState('');
  const [message, setMessage] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const referralCode = user.referralCode || 'HARIS-POPS';

  const handleCopyReferral = () => {
    try {
      navigator.clipboard?.writeText(
        `Dođi u Pop's! Iskoristi moj kod ${referralCode} za Gratis pomfrit uz prvi burger: https://pops.ba/pass?ref=${referralCode}`
      );
    } catch {
      // Fallback
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendNameInput.trim()) return;
    const inv = addReferralFriend(friendNameInput);
    setFriendNameInput('');
    setMessage({
      ok: true,
      text: `Pozivnica poslana za: ${inv.friendName}. Bodovi (+30 PTS) liježu čim skenira prvi račun na kasi.`,
    });
  };

  const handleVerifyFriendScan = (refId: string) => {
    const res = verifyReferralFirstScan(refId);
    setMessage({ ok: res.ok, text: res.message });
  };

  const handleTimeTravel24h = () => {
    fastForward24HoursCooldown();
    setMessage({
      ok: true,
      text: 'Svi iskorišteni kuponi su ponovo otključani (simuliran prolazak 24h).',
    });
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Member Card */}
      <div className="rounded-[24px] bg-white border border-[#DFD8CB] p-5 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7A7268]">
            ČLAN #{user.memberCode}
          </span>
          <h2 className="text-lg font-extrabold text-[#161412]">
            {user.fullName}
          </h2>
          <p className="text-xs text-[#6B635B]">{user.phoneOrEmail}</p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="px-3.5 py-2 rounded-xl bg-[#F4F0E8] hover:bg-[#E5DEC9] active:scale-95 text-xs font-extrabold text-[#161412] flex items-center gap-1.5 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Odjava</span>
        </button>
      </div>

      {message && (
        <div
          className={`animate-stamp-pop p-3.5 rounded-2xl border text-xs font-bold flex items-start gap-2 ${
            message.ok
              ? 'bg-[#0D9464] text-white border-[#0A7B52]'
              : 'bg-red-100 border-red-300 text-red-800'
          }`}
        >
          <Check className="w-4 h-4 shrink-0 mt-0.5 stroke-[3]" />
          <span>{message.text}</span>
        </div>
      )}

      {/* 1. Loyalty Rewards Catalog (with Real QR Voucher Modal) */}
      <div className="rounded-[24px] bg-white border border-[#DFD8CB] p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-extrabold text-[#161412] flex items-center gap-1.5">
            <Gift className="w-4 h-4 text-[#DF3B16]" />
            <span>Preuzmi Gratis nagradu na kasi</span>
          </h3>
          <span className="font-mono text-xs font-extrabold text-[#DF3B16]">
            <AnimatedCounter value={user.points} /> PTS
          </span>
        </div>
        <p className="text-xs text-[#6B635B] mb-4">
          Odaberite nagradu da otvorite QR vaučer (0.00 KM) koji radnik skenira na kasi.
        </p>

        <div className="space-y-2.5">
          {LOYALTY_REWARDS.map((rwd) => {
            const canAfford = user.points >= rwd.pointsCost;
            return (
              <div
                key={rwd.id}
                className="p-3.5 rounded-2xl bg-[#F4F0E8] border border-[#E2DBD0] flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#DF3B16]">
                    {rwd.pointsCost} PTS • GRATIS VAUČER
                  </span>
                  <h4 className="text-xs sm:text-sm font-extrabold text-[#161412]">
                    {rwd.title}
                  </h4>
                  <p className="text-[11px] text-[#6B635B] mt-0.5">
                    {rwd.description}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!canAfford}
                  onClick={() => onSelectRewardForQr(rwd)}
                  className={`px-3.5 py-2.5 rounded-xl font-extrabold text-xs shrink-0 flex items-center gap-1.5 transition-all ${
                    canAfford
                      ? 'bg-[#161412] hover:bg-[#2B2622] active:scale-95 text-white shadow-xs'
                      : 'bg-[#E2DBD0] text-[#8E857B] cursor-not-allowed'
                  }`}
                >
                  {canAfford ? (
                    <>
                      <QrCode className="w-3.5 h-3.5 text-[#DF3B16]" />
                      <span>Prikaži QR</span>
                    </>
                  ) : (
                    <span>Još {rwd.pointsCost - user.points}b</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. "Povedi ekipu u Pop's" — Viral Anti-Fraud Referral Card */}
      <div className="rounded-[24px] bg-white border border-[#DFD8CB] p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#DF3B16]">
              POVEDI EKIPU U POP&apos;S • +30 PTS
            </span>
            <h3 className="text-base font-extrabold text-[#161412] mt-0.5">
              Pozovi prijatelja i osvoji bodove
            </h3>
            <p className="text-xs text-[#6B635B] mt-1 leading-relaxed">
              Prijatelj dobija <strong className="text-[#161412]">Gratis pomfrit uz prvi burger</strong>, a vi dobijate <strong className="text-[#DF3B16]">+30 PTS</strong> čim on fizički skenira svoj prvi račun na kasi.
            </p>
          </div>
        </div>

        {/* Personal Invite Code Box */}
        <div className="p-3.5 rounded-2xl bg-[#161412] text-white flex items-center justify-between gap-3">
          <div>
            <span className="block text-[9px] font-mono uppercase tracking-widest text-[#9E958B]">
              TVOJ POZIVNI KOD
            </span>
            <span className="font-mono text-base font-extrabold tracking-wider text-white">
              {referralCode}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyReferral}
            className="px-3.5 py-2 rounded-xl bg-[#DF3B16] hover:bg-[#C83210] active:scale-95 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Kopirano!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Podijeli kod</span>
              </>
            )}
          </button>
        </div>

        {/* Add Friend Form for Demo */}
        <form onSubmit={handleAddFriend} className="flex gap-2">
          <input
            type="text"
            value={friendNameInput}
            onChange={(e) => setFriendNameInput(e.target.value)}
            placeholder="Ime pozvanog prijatelja (npr. Emir M.)..."
            className="flex-1 bg-[#F4F0E8] border border-[#D6CEC0] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#161412] placeholder-[#8E857B] outline-none"
          />
          <button
            type="submit"
            className="px-3.5 py-2.5 rounded-xl bg-[#161412] text-white text-xs font-extrabold flex items-center gap-1 shrink-0 active:scale-95 transition-transform"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#DF3B16]" />
            <span>Pozovi</span>
          </button>
        </form>

        {/* Invited Friends Status List */}
        <div className="space-y-2 pt-1">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7A7268]">
            Status pozvanih prijatelja ({referrals.length}):
          </span>

          {referrals.map((ref) => {
            const isVerified = ref.status === 'verified_at_pos';
            return (
              <div
                key={ref.id}
                className="p-3 rounded-2xl bg-[#F4F0E8] border border-[#E2DBD0] flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-extrabold text-[#161412] truncate">
                    {ref.friendName}
                  </h4>
                  <span className="text-[11px] text-[#6B635B] block">
                    {isVerified
                      ? `Skenirao 1. račun (${ref.verifiedBranch})`
                      : 'Registrovan • Čeka 1. skeniranje na kasi'}
                  </span>
                </div>

                {isVerified ? (
                  <span className="font-mono text-xs font-extrabold text-[#0D9464] shrink-0">
                    +{ref.pointsReward} PTS ✓
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleVerifyFriendScan(ref.id)}
                    className="px-3 py-1.5 rounded-xl bg-[#DF3B16] hover:bg-[#C83210] active:scale-95 text-white font-extrabold text-[11px] shrink-0 flex items-center gap-1 transition-all"
                  >
                    <ScanLine className="w-3.5 h-3.5" />
                    <span>Potvrdi 1. sken (+30b)</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset 24h Cooldowns for Demo */}
      {cooldownCount > 0 && (
        <button
          type="button"
          onClick={handleTimeTravel24h}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#161412] active:scale-[0.98] text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-transform"
        >
          <FastForward className="w-4 h-4 text-[#DF3B16]" />
          <span>Resetuj 24h čekanje ({cooldownCount} kupona)</span>
        </button>
      )}
    </div>
  );
};
