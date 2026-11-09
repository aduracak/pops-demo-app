import React, { useEffect, useMemo, useState } from 'react';
import { Clock, FastForward } from 'lucide-react';
import { AppRole, Coupon, CouponCategory, LoyaltyReward } from './types/pops';
import {
  fastForward24HoursCooldown,
  getAllCoupons,
  loadPopsState,
  logoutUser,
  PopsPersistedState,
  subscribePopsStore,
} from './services/popsStore';
import { AuthScreen } from './components/AuthScreen';
import { HeaderPass } from './components/HeaderPass';
import { CouponCard } from './components/CouponCard';
import { CouponModal } from './components/CouponModal';
import { RewardModal } from './components/RewardModal';
import { ReceiptView } from './components/ReceiptView';
import { StaffScannerView } from './components/StaffScannerView';
import { ProfileView } from './components/ProfileView';
import { OwnerDashboardView, OwnerTab } from './components/OwnerDashboardView';
import { BubbleNavbar, CustomerTab, StaffTab } from './components/BubbleNavbar';

const CATEGORIES: { id: CouponCategory; label: string }[] = [
  { id: 'sve', label: 'Sve ponude' },
  { id: 'combo', label: 'Burger Meni' },
  { id: 'burgeri', label: 'Burgeri' },
  { id: 'slatko', label: 'Slatki program' },
];

export const App: React.FC = () => {
  const [state, setState] = useState<PopsPersistedState>(() => loadPopsState());
  const [role, setRole] = useState<AppRole>('customer');
  const [customerTab, setCustomerTab] = useState<CustomerTab>('coupons');
  const [staffTab, setStaffTab] = useState<StaffTab>('scanner');
  const [ownerTab, setOwnerTab] = useState<OwnerTab>('overview');
  const [selectedCategory, setSelectedCategory] = useState<CouponCategory>('sve');
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(null);
  const [staffScanTrigger, setStaffScanTrigger] = useState(0);

  useEffect(() => {
    return subscribePopsStore(() => {
      setState(loadPopsState());
    });
  }, []);

  const now = Date.now();
  const allCoupons = useMemo(() => getAllCoupons(state), [state]);

  const { availableCoupons, cooldownCoupons } = useMemo(() => {
    const filtered =
      selectedCategory === 'sve'
        ? allCoupons
        : allCoupons.filter((c) => c.category === selectedCategory);

    const avail: Coupon[] = [];
    const cooldown: Coupon[] = [];

    for (const c of filtered) {
      const usage = state.couponUsages[c.id];
      if (usage && usage.availableAgainAt > now) {
        cooldown.push(c);
      } else {
        avail.push(c);
      }
    }

    return { availableCoupons: avail, cooldownCoupons: cooldown };
  }, [selectedCategory, allCoupons, state.couponUsages, now]);

  const totalAvailableCount = useMemo(
    () =>
      allCoupons.filter((c) => {
        const u = state.couponUsages[c.id];
        return !u || u.availableAgainAt <= now;
      }).length,
    [allCoupons, state.couponUsages, now]
  );

  const totalCooldownCount = allCoupons.length - totalAvailableCount;

  if (!state.user) {
    return <AuthScreen onSuccess={() => setState(loadPopsState())} />;
  }

  return (
    <div className="min-h-screen bg-[#E5DEC9] text-[#161412] flex justify-center">
      {/* Mobile App Container */}
      <div className="w-full max-w-md min-h-screen bg-[#F4F0E8] border-x border-[#D8D0C2] flex flex-col justify-between relative shadow-[0_0_50px_rgba(22,20,18,0.12)]">
        {/* Clean Minimal Editorial Top Bar with 3-Role Switcher (Gost | Radnik | Vlasnik) */}
        <header className="px-4 pt-5 pb-2 flex items-center justify-between gap-2">
          <div
            onClick={() => {
              setRole('customer');
              setCustomerTab('coupons');
            }}
            className="flex items-baseline gap-1 cursor-pointer select-none active:scale-95 transition-transform shrink-0"
          >
            <span className="font-extrabold text-2xl tracking-tighter text-[#161412]">
              POP&apos;S
            </span>
            <span className="w-2 h-2 rounded-full bg-[#DF3B16]" />
          </div>

          {/* Right Controls: 24h Reset + Sleek 3-Role Pill Switcher */}
          <div className="flex items-center gap-1.5">
            {totalCooldownCount > 0 && (
              <button
                type="button"
                onClick={() => fastForward24HoursCooldown()}
                title="Simuliraj +24h i otključaj kupone"
                className="px-2 py-1.5 rounded-full bg-white border border-[#DFD8CB] active:scale-95 text-[#161412] font-extrabold text-[10px] flex items-center gap-0.5 shadow-2xs transition-transform"
              >
                <FastForward className="w-3 h-3 text-[#DF3B16]" />
                <span>+24h</span>
              </button>
            )}

            <div className="inline-flex p-1 rounded-full bg-white border border-[#DFD8CB] shadow-2xs">
              {(
                [
                  { id: 'customer', label: 'Gost' },
                  { id: 'staff', label: 'Radnik' },
                  { id: 'owner', label: 'Vlasnik' },
                ] as const
              ).map((r) => {
                const isActive = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-all duration-200 ${
                      isActive
                        ? r.id === 'customer'
                          ? 'bg-[#161412] text-white'
                          : 'bg-[#DF3B16] text-white'
                        : 'text-[#6B635B] hover:text-[#161412]'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 px-4 pt-2 pb-28 space-y-4">
          {role === 'owner' ? (
            <OwnerDashboardView
              ownerTab={ownerTab}
              allCoupons={allCoupons}
              transactions={state.transactions}
              onSwitchToCustomerView={() => {
                setRole('customer');
                setCustomerTab('coupons');
              }}
            />
          ) : role === 'staff' ? (
            <div className="animate-view-enter">
              <StaffScannerView
                staffTab={staffTab}
                allCoupons={allCoupons}
                activeSession={state.activeSession}
                couponUsages={state.couponUsages}
                transactions={state.transactions}
                externalScanTriggerCount={staffScanTrigger}
              />
            </div>
          ) : (
            <>
              {customerTab === 'coupons' && (
                <div className="animate-view-enter space-y-4">
                  <HeaderPass
                    user={state.user}
                    onOpenMyQrTab={() => setCustomerTab('my_qr')}
                  />

                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {CATEGORIES.map((cat) => {
                      const active = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap active:scale-95 transition-all duration-200 ${
                            active
                              ? 'bg-[#161412] text-white shadow-xs'
                              : 'bg-white text-[#5C554E] hover:text-[#161412] border border-[#DFD8CB]'
                          }`}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Coupons */}
                  <section className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <h2 className="text-sm font-extrabold text-[#161412]">
                        Dostupni kuponi
                      </h2>
                      <span className="text-xs font-mono font-bold text-[#6B635B]">
                        {availableCoupons.length} aktivno
                      </span>
                    </div>

                    {availableCoupons.length === 0 ? (
                      <div className="animate-card-enter rounded-[24px] bg-white border border-[#DFD8CB] p-6 text-center space-y-3">
                        <Clock className="w-7 h-7 text-[#161412] mx-auto" />
                        <div>
                          <h3 className="text-sm font-extrabold text-[#161412]">
                            Svi kuponi u ovoj kategoriji su iskorišteni danas
                          </h3>
                          <p className="text-xs text-[#6B635B] mt-1">
                            Ponovo se otključavaju nakon 24 sata.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => fastForward24HoursCooldown()}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#161412] active:scale-95 text-white text-xs font-extrabold transition-transform"
                        >
                          <FastForward className="w-3.5 h-3.5 text-[#DF3B16]" />
                          <span>Otključaj odmah (+24h)</span>
                        </button>
                      </div>
                    ) : (
                      <div key={selectedCategory} className="space-y-3">
                        {availableCoupons.map((coupon, idx) => (
                          <CouponCard
                            key={coupon.id}
                            index={idx}
                            coupon={coupon}
                            onSelectCoupon={(c) => setSelectedCoupon(c)}
                          />
                        ))}
                      </div>
                    )}
                  </section>

                  {/* 24h Locked Coupons */}
                  {cooldownCoupons.length > 0 && (
                    <section className="space-y-3 pt-3 border-t border-[#E2DBD0]">
                      <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#6B635B]">
                          Iskorišteni danas (24h pauza)
                        </h3>
                        <button
                          type="button"
                          onClick={() => fastForward24HoursCooldown()}
                          className="text-[11px] font-extrabold text-[#DF3B16] underline"
                        >
                          Resetuj 24h
                        </button>
                      </div>

                      <div className="space-y-3">
                        {cooldownCoupons.map((coupon, idx) => (
                          <CouponCard
                            key={coupon.id}
                            index={idx}
                            coupon={coupon}
                            availableAgainAt={
                              state.couponUsages[coupon.id]?.availableAgainAt
                            }
                            onSelectCoupon={() => {}}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {customerTab === 'my_qr' && (
                <ReceiptView
                  user={state.user}
                  activeSession={state.activeSession}
                  transactions={state.transactions}
                  onSwitchToStaff={() => {
                    setRole('staff');
                    setStaffTab('scanner');
                  }}
                />
              )}

              {customerTab === 'profile' && (
                <div className="animate-view-enter">
                  <ProfileView
                    user={state.user}
                    referrals={state.referrals}
                    cooldownCount={totalCooldownCount}
                    onSelectRewardForQr={(rwd) => setSelectedReward(rwd)}
                    onLogout={() => logoutUser()}
                  />
                </div>
              )}
            </>
          )}
        </main>

        {/* Tactile Floating Bubble Navbar */}
        <BubbleNavbar
          role={role}
          customerTab={customerTab}
          staffTab={staffTab}
          ownerTab={ownerTab}
          points={state.user.points}
          hasWaitingCustomerQr={
            state.activeSession?.status === 'waiting_for_scan'
          }
          onSelectCustomerTab={(tab) => setCustomerTab(tab)}
          onSelectStaffTab={(tab) => setStaffTab(tab)}
          onSelectOwnerTab={(tab) => setOwnerTab(tab)}
          onTriggerInstantStaffScan={() => {
            setStaffTab('scanner');
            setStaffScanTrigger((prev) => prev + 1);
          }}
        />

        {/* Coupon Modal */}
        {selectedCoupon && (
          <CouponModal
            coupon={selectedCoupon}
            activeSession={state.activeSession}
            onClose={() => setSelectedCoupon(null)}
            onSwitchToStaffScanner={() => {
              setSelectedCoupon(null);
              setRole('staff');
              setStaffTab('scanner');
            }}
          />
        )}

        {/* Gratis Reward QR Voucher Modal */}
        {selectedReward && (
          <RewardModal
            reward={selectedReward}
            activeSession={state.activeSession}
            onClose={() => setSelectedReward(null)}
            onSwitchToStaffScanner={() => {
              setSelectedReward(null);
              setRole('staff');
              setStaffTab('scanner');
            }}
          />
        )}
      </div>
    </div>
  );
};
