import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Building2,
  Check,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { Coupon, LoyaltyTransaction } from '../types/pops';
import {
  createOwnerCustomCoupon,
  deleteOwnerCustomCoupon,
} from '../services/popsStore';
import { AnimatedCounter } from './AnimatedCounter';

export type OwnerTab = 'overview' | 'create_coupon' | 'audit_log';

interface OwnerDashboardViewProps {
  ownerTab: OwnerTab;
  allCoupons: Coupon[];
  transactions: LoyaltyTransaction[];
  onSwitchToCustomerView: () => void;
}

const QUICK_COUPON_TEMPLATES = [
  {
    title: 'Hot Burger Meni',
    subtitle: 'Juneće meso, cheddar, jalapeno papričice, Hot sos + pomfrit + Pepsi',
    category: 'combo' as const,
    originalPrice: 14.5,
    promoPrice: 10.9,
    pointsReward: 20,
  },
  {
    title: 'Grand Jalapeño Burger',
    subtitle: 'Juneće meso, topljeni cheddar, jalapeno, salata i Pop’s sos',
    category: 'burgeri' as const,
    originalPrice: 11.0,
    promoPrice: 8.5,
    pointsReward: 15,
  },
];

export const OwnerDashboardView: React.FC<OwnerDashboardViewProps> = ({
  ownerTab,
  allCoupons,
  transactions,
  onSwitchToCustomerView,
}) => {
  const [title, setTitle] = useState('Hot Burger Meni');
  const [subtitle, setSubtitle] = useState(
    'Juneće meso, cheddar, jalapeno papričice, Hot sos + pomfrit + Pepsi'
  );
  const [category, setCategory] = useState<Coupon['category']>('combo');
  const [originalPrice, setOriginalPrice] = useState('14.50');
  const [promoPrice, setPromoPrice] = useState('10.90');
  const [pointsReward, setPointsReward] = useState('20');
  const [createdBanner, setCreatedBanner] = useState<string | null>(null);

  // Compute live metrics + baseline realistic numbers for Pop's branches
  const metrics = useMemo(() => {
    const liveRevenue = transactions.reduce(
      (acc, tx) => acc + (tx.amountKm || 0),
      0
    );
    const liveCouponsCount = transactions.filter(
      (t) => t.type === 'coupon_activated'
    ).length;
    const liveOrderScansCount = transactions.filter(
      (t) => t.type === 'order_scan'
    ).length;

    const totalTodayKm = 1840 + liveRevenue;
    const totalScansToday = 142 + transactions.length;

    const branches = [
      {
        name: "Pop's Istočno Sarajevo",
        cashier: 'Kasa 1 & Kasa 2',
        revenueKm:
          920 +
          transactions
            .filter(
              (t) => !t.branchName || t.branchName.includes('Istočno Sarajevo')
            )
            .reduce((s, t) => s + (t.amountKm || 0), 0),
        scans:
          74 +
          transactions.filter(
            (t) => !t.branchName || t.branchName.includes('Istočno Sarajevo')
          ).length,
      },
      {
        name: "Pop's Kiseljak",
        cashier: 'Kasa 1',
        revenueKm:
          540 +
          transactions
            .filter((t) => t.branchName?.includes('Kiseljak'))
            .reduce((s, t) => s + (t.amountKm || 0), 0),
        scans:
          41 +
          transactions.filter((t) => t.branchName?.includes('Kiseljak')).length,
      },
      {
        name: "Pop's Banja Luka",
        cashier: 'Kasa 1',
        revenueKm:
          380 +
          transactions
            .filter((t) => t.branchName?.includes('Banja Luka'))
            .reduce((s, t) => s + (t.amountKm || 0), 0),
        scans:
          27 +
          transactions.filter((t) => t.branchName?.includes('Banja Luka'))
            .length,
      },
    ];

    return {
      totalTodayKm,
      totalScansToday,
      liveCouponsCount: 86 + liveCouponsCount,
      liveOrderScansCount: 56 + liveOrderScansCount,
      branches,
    };
  }, [transactions]);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const orig = parseFloat(originalPrice) || 14.5;
    const promo = parseFloat(promoPrice) || 10.9;
    const pts = parseInt(pointsReward, 10) || 20;

    if (!title.trim()) return;

    const created = createOwnerCustomCoupon({
      title,
      subtitle,
      category,
      originalPrice: orig,
      promoPrice: promo,
      pointsReward: pts,
    });

    setCreatedBanner(
      `Kupon "${created.title}" (${created.promoPrice.toFixed(2)} KM) je objavljen i odmah vidljiv svim gostima!`
    );
  };

  const applyTemplate = (tpl: (typeof QUICK_COUPON_TEMPLATES)[number]) => {
    setTitle(tpl.title);
    setSubtitle(tpl.subtitle);
    setCategory(tpl.category);
    setOriginalPrice(tpl.originalPrice.toFixed(2));
    setPromoPrice(tpl.promoPrice.toFixed(2));
    setPointsReward(String(tpl.pointsReward));
    setCreatedBanner(null);
  };

  if (ownerTab === 'create_coupon') {
    return (
      <div className="animate-view-enter space-y-5 pb-12">
        <div className="rounded-[28px] bg-white border border-[#DFD8CB] p-5 shadow-[0_6px_24px_rgba(22,20,18,0.05)]">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#DF3B16]">
            UPRAVLJANJE PONUDOM • LIVE OBJAVA
          </span>
          <h2 className="text-lg font-extrabold text-[#161412] mt-0.5">
            Objavi novi kupon za 10 sekundi
          </h2>
          <p className="text-xs text-[#6B635B] mt-0.5">
            Svaki kupon koji ovdje objavite pojavljuje se na telefonima gostiju u realnom vremenu.
          </p>

          {/* Quick Templates */}
          <div className="mt-4 pt-3 border-t border-[#EAE4D8]">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7A7268] mb-2">
              Brzi predlošci za prezentaciju (1 klik):
            </span>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_COUPON_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.title}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className="p-2.5 rounded-xl bg-[#F4F0E8] hover:bg-[#161412] hover:text-white text-left border border-[#D6CEC0] transition-colors"
                >
                  <span className="block text-[11px] font-extrabold truncate">
                    {tpl.title}
                  </span>
                  <span className="block font-mono text-[10px] text-[#DF3B16] mt-0.5">
                    {tpl.promoPrice.toFixed(2)} KM • +{tpl.pointsReward} PTS
                  </span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleCreateCoupon} className="mt-4 space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-[#5C554E] mb-1">
                Naziv kupona
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#F4F0E8] border border-[#D6CEC0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#161412] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#5C554E] mb-1">
                Kratak opis sastojaka / ponude
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-[#F4F0E8] border border-[#D6CEC0] rounded-xl px-3.5 py-2.5 text-xs text-[#161412] outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-[#5C554E] mb-1">
                  Redovna (KM)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="w-full bg-[#F4F0E8] border border-[#D6CEC0] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#161412] outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#5C554E] mb-1">
                  Akcijska (KM)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={promoPrice}
                  onChange={(e) => setPromoPrice(e.target.value)}
                  className="w-full bg-[#F4F0E8] border border-[#D6CEC0] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#DF3B16] outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#5C554E] mb-1">
                  Bodovi (+PTS)
                </label>
                <input
                  type="number"
                  value={pointsReward}
                  onChange={(e) => setPointsReward(e.target.value)}
                  className="w-full bg-[#F4F0E8] border border-[#D6CEC0] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#161412] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#DF3B16] hover:bg-[#C83210] active:scale-[0.98] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_8px_20px_rgba(223,59,22,0.28)]"
            >
              <Plus className="w-4 h-4" />
              <span>Objavi kupon svim gostima</span>
            </button>
          </form>

          {createdBanner && (
            <div className="animate-stamp-pop mt-4 p-3.5 rounded-2xl bg-[#0D9464] text-white text-xs font-bold space-y-2">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 stroke-[3]" />
                <span>{createdBanner}</span>
              </div>
              <button
                type="button"
                onClick={onSwitchToCustomerView}
                className="w-full py-2 rounded-xl bg-white text-[#161412] font-extrabold text-xs"
              >
                Pogledaj odmah na ekranu Gosta →
              </button>
            </div>
          )}
        </div>

        {/* Active Coupons Management List */}
        <div className="rounded-[24px] bg-white border border-[#DFD8CB] p-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#6B635B] mb-3">
            Aktivni kuponi u aplikaciji ({allCoupons.length})
          </h3>
          <div className="space-y-2">
            {allCoupons.map((cpn) => (
              <div
                key={cpn.id}
                className="p-3 rounded-2xl bg-[#F4F0E8] border border-[#E2DBD0] flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {cpn.isCustom && (
                      <span className="px-1.5 py-0.5 rounded bg-[#DF3B16] text-white text-[9px] font-extrabold uppercase">
                        NOVO
                      </span>
                    )}
                    <span className="text-xs font-extrabold text-[#161412] truncate">
                      {cpn.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#6B635B]">
                    {cpn.promoPrice.toFixed(2)} KM (Redovno {cpn.originalPrice.toFixed(2)} KM) • +{cpn.pointsReward} PTS
                  </span>
                </div>

                {cpn.isCustom && (
                  <button
                    type="button"
                    onClick={() => deleteOwnerCustomCoupon(cpn.id)}
                    className="p-2 rounded-xl bg-white hover:bg-red-100 text-red-600 border border-[#DFD8CB]"
                    title="Ukloni kupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (ownerTab === 'audit_log') {
    return (
      <div className="animate-view-enter space-y-4 pb-12">
        <div className="rounded-[28px] bg-[#161412] text-white p-5">
          <div className="flex items-center gap-2 text-[#10B981] text-xs font-mono font-bold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>ANTI-FRAUD KONTROLA KASE</span>
          </div>
          <h2 className="text-lg font-extrabold">
            Evidencija svih skeniranja radnika
          </h2>
          <p className="text-xs text-[#9E958B] mt-1">
            Svaki popust, kupon ili gratis nagrada ima tačan kod sesije, vrijeme i kasu na kojoj je skeniran.
          </p>
        </div>

        <div className="space-y-2.5">
          {transactions.map((tx, idx) => (
            <div
              key={tx.id}
              style={{ animationDelay: `${idx * 35}ms` }}
              className="animate-card-enter p-4 rounded-2xl bg-white border border-[#DFD8CB] flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#F4F0E8] border border-[#D6CEC0] font-mono text-[10px] font-bold text-[#161412]">
                    #{tx.referenceCode}
                  </span>
                  <span className="text-[11px] font-mono text-[#6B635B]">
                    {new Date(tx.createdAt).toLocaleTimeString('bs-BA', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-[#161412] mt-1 truncate">
                  {tx.title}
                </h4>
                <p className="text-[11px] text-[#6B635B] truncate">
                  {tx.subtitle}
                </p>
              </div>

              <div className="text-right shrink-0">
                {tx.amountKm !== undefined && (
                  <span className="block font-mono font-extrabold text-sm text-[#161412]">
                    {tx.amountKm.toFixed(2)} KM
                  </span>
                )}
                <span
                  className={`font-mono text-xs font-bold ${
                    tx.pointsDelta >= 0 ? 'text-[#0D9464]' : 'text-[#DF3B16]'
                  }`}
                >
                  {tx.pointsDelta >= 0 ? `+${tx.pointsDelta}` : tx.pointsDelta} PTS
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default Owner Tab: Overview & Live ROI by Branch
  return (
    <div className="animate-view-enter space-y-4 pb-12">
      {/* Main Hero Revenue Card */}
      <div className="rounded-[28px] bg-[#161412] text-white p-5 shadow-[0_14px_30px_rgba(22,20,18,0.18)]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#DF3B16]">
            DANAS U POP&apos;S MREŽI • UŽIVO
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#10B981]">
            <ArrowUpRight className="w-3.5 h-3.5" />
            +24% vs. prošli utorak
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-mono tracking-tight">
            <AnimatedCounter value={Math.round(metrics.totalTodayKm)} />.00 KM
          </span>
          <span className="text-xs text-[#9E958B]">
            promet preko aplikacije
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[#2A2521] text-center">
          <div>
            <span className="block font-mono text-lg font-extrabold text-white">
              <AnimatedCounter value={metrics.totalScansToday} />
            </span>
            <span className="text-[10px] text-[#9E958B] uppercase">
              Ukupno skeniranja
            </span>
          </div>
          <div className="border-x border-[#2A2521]">
            <span className="block font-mono text-lg font-extrabold text-[#DF3B16]">
              <AnimatedCounter value={metrics.liveCouponsCount} />
            </span>
            <span className="text-[10px] text-[#9E958B] uppercase">
              Kupona na kasi
            </span>
          </div>
          <div>
            <span className="block font-mono text-lg font-extrabold text-[#10B981]">
              <AnimatedCounter value={metrics.liveOrderScansCount} />
            </span>
            <span className="text-[10px] text-[#9E958B] uppercase">
              Moj QR narudžbi
            </span>
          </div>
        </div>
      </div>

      {/* Branches Breakdown */}
      <div className="rounded-[24px] bg-white border border-[#DFD8CB] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#161412] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#DF3B16]" />
            <span>Promet po poslovnicama danas</span>
          </h3>
          <span className="text-[11px] font-mono text-[#6B635B]">3 lokacije</span>
        </div>

        <div className="space-y-2.5">
          {metrics.branches.map((b) => {
            const pct = Math.min(
              100,
              Math.round((b.revenueKm / metrics.totalTodayKm) * 100)
            );
            return (
              <div
                key={b.name}
                className="p-3.5 rounded-2xl bg-[#F4F0E8] border border-[#E2DBD0] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-[#161412]">
                      {b.name}
                    </h4>
                    <span className="text-[10px] text-[#6B635B]">
                      Aktivno: {b.cashier} • {b.scans} skeniranja danas
                    </span>
                  </div>
                  <span className="font-mono text-sm font-extrabold text-[#161412]">
                    {b.revenueKm.toFixed(2)} KM
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#DFD8CB] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#161412] transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
