import {
  ActiveCheckoutSession,
  Coupon,
  CouponUsageMap,
  LoyaltyTransaction,
  ReferralInvite,
  User,
} from '../types/pops';
import {
  BURGER_PLACEHOLDER_DEFAULT,
  INITIAL_COUPONS,
  LOYALTY_REWARDS,
} from '../data/initialData';

const STORAGE_KEY = 'pops_loyalty_db_v5';
const CHANNEL_NAME = 'pops_realtime_sync_v5';

export interface PopsPersistedState {
  user: User | null;
  customCoupons: Coupon[];
  couponUsages: CouponUsageMap;
  activeSession: ActiveCheckoutSession | null;
  transactions: LoyaltyTransaction[];
  referrals: ReferralInvite[];
}

const DEFAULT_DEMO_USER: User = {
  id: 'usr-pops-demo-01',
  fullName: 'Haris Kovačević',
  phoneOrEmail: 'haris@pops.ba',
  memberCode: 'POPS-9482',
  referralCode: 'HARIS-POPS',
  points: 185,
  createdAt: '2026-09-15T12:00:00.000Z',
};

const INITIAL_REFERRALS: ReferralInvite[] = [
  {
    id: 'ref-1',
    friendName: 'Amar Hodžić',
    status: 'waiting_first_scan',
    pointsReward: 30,
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
  },
  {
    id: 'ref-2',
    friendName: 'Lejla Begović',
    status: 'verified_at_pos',
    pointsReward: 30,
    createdAt: Date.now() - 1000 * 60 * 60 * 36,
    verifiedBranch: "Pop's Istočno Sarajevo",
  },
];

const INITIAL_TRANSACTIONS: LoyaltyTransaction[] = [
  {
    id: 'tx-init-1',
    type: 'coupon_activated',
    title: 'Kupon: Grand Tasty Burger Meni',
    subtitle: "Skenirano na kasi • Pop's Istočno Sarajevo — Kasa 1",
    referenceCode: 'CPN-9921',
    pointsDelta: 20,
    amountKm: 12.5,
    branchName: "Pop's Istočno Sarajevo",
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
  },
  {
    id: 'tx-init-2',
    type: 'order_scan',
    title: 'Narudžba u restoranu (22.00 KM)',
    subtitle: "Skeniran Moj Loyalty QR • Pop's Kiseljak — Kasa 1",
    referenceCode: 'ORD-5510',
    pointsDelta: 22,
    amountKm: 22.0,
    branchName: "Pop's Kiseljak",
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
  },
  {
    id: 'tx-init-3',
    type: 'referral_bonus',
    title: 'Poziv prijatelja: Lejla Begović',
    subtitle: "Prvi račun skeniran na kasi • Pop's Banja Luka",
    referenceCode: 'REF-LEJLA',
    pointsDelta: 30,
    branchName: "Pop's Banja Luka",
    createdAt: Date.now() - 1000 * 60 * 60 * 36,
  },
];

function getInitialState(): PopsPersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PopsPersistedState;
      return {
        ...parsed,
        customCoupons: parsed.customCoupons || [],
        referrals: parsed.referrals || INITIAL_REFERRALS,
      };
    }
  } catch {
    // Fallback
  }

  return {
    user: DEFAULT_DEMO_USER,
    customCoupons: [],
    couponUsages: {},
    activeSession: null,
    transactions: INITIAL_TRANSACTIONS,
    referrals: INITIAL_REFERRALS,
  };
}

let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch {
  broadcastChannel = null;
}

const listeners = new Set<() => void>();

export function subscribePopsStore(listener: () => void): () => void {
  listeners.add(listener);

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      listener();
    }
  };

  const handleBroadcast = () => {
    listener();
  };

  window.addEventListener('storage', handleStorage);
  broadcastChannel?.addEventListener('message', handleBroadcast);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', handleStorage);
    broadcastChannel?.removeEventListener('message', handleBroadcast);
  };
}

export function getAllCoupons(state?: PopsPersistedState): Coupon[] {
  const s = state || loadPopsState();
  return [...(s.customCoupons || []), ...INITIAL_COUPONS];
}

export function loadPopsState(): PopsPersistedState {
  const state = getInitialState();

  const now = Date.now();
  let mutated = false;
  const cleanedUsages: CouponUsageMap = { ...state.couponUsages };

  for (const [couponId, usage] of Object.entries(cleanedUsages)) {
    if (usage.availableAgainAt <= now) {
      delete cleanedUsages[couponId];
      mutated = true;
    }
  }

  if (mutated) {
    const next = { ...state, couponUsages: cleanedUsages };
    savePopsState(next, false);
    return next;
  }

  return state;
}

export function savePopsState(nextState: PopsPersistedState, notify = true): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  } catch {
    // Ignore
  }

  if (notify) {
    listeners.forEach((l) => l());
    try {
      broadcastChannel?.postMessage({ type: 'STATE_UPDATED', ts: Date.now() });
    } catch {
      // Ignore
    }
  }
}

export function loginOrRegisterUser(fullName: string, phoneOrEmail: string): User {
  const state = loadPopsState();
  const cleanName = fullName.trim() || 'Haris Kovačević';
  const cleanContact = phoneOrEmail.trim() || 'haris@pops.ba';
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const firstNameUpper = cleanName.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '') || 'GOST';

  const newUser: User = {
    id: `usr-${Date.now()}`,
    fullName: cleanName,
    phoneOrEmail: cleanContact,
    memberCode: `POPS-${randomDigits}`,
    referralCode: `${firstNameUpper}-POPS`,
    points: state.user ? state.user.points : 185,
    createdAt: new Date().toISOString(),
  };

  savePopsState({
    ...state,
    user: newUser,
  });

  return newUser;
}

export function logoutUser(): void {
  const state = loadPopsState();
  savePopsState({
    ...state,
    user: null,
    activeSession: null,
  });
}

export function startCouponCheckoutSession(couponId: string): ActiveCheckoutSession {
  const state = loadPopsState();
  const user = state.user || DEFAULT_DEMO_USER;
  const allCoupons = getAllCoupons(state);
  const coupon = allCoupons.find((c) => c.id === couponId);
  if (!coupon) {
    throw new Error('Kupon nije pronađen.');
  }

  const existingUsage = state.couponUsages[couponId];
  if (existingUsage && existingUsage.availableAgainAt > Date.now()) {
    throw new Error('Ovaj kupon je već iskorišten danas. Dostupan je ponovo nakon 24h.');
  }

  const shortNonce = Math.random().toString(36).substring(2, 7).toUpperCase();
  const sessionId = `SES-${shortNonce}`;
  const qrPayload = `POPS-CPN|${sessionId}|${coupon.id}|${user.memberCode}|${coupon.promoPrice.toFixed(2)}KM|+${coupon.pointsReward}PTS`;

  const session: ActiveCheckoutSession = {
    sessionId,
    mode: 'coupon',
    couponId: coupon.id,
    couponTitle: coupon.title,
    promoPrice: coupon.promoPrice,
    originalPrice: coupon.originalPrice,
    pointsReward: coupon.pointsReward,
    userId: user.id,
    userName: user.fullName,
    memberCode: user.memberCode,
    qrPayload,
    createdAt: Date.now(),
    status: 'waiting_for_scan',
  };

  savePopsState({
    ...state,
    activeSession: session,
  });

  return session;
}

export function startRewardCheckoutSession(rewardId: string): ActiveCheckoutSession {
  const state = loadPopsState();
  const user = state.user || DEFAULT_DEMO_USER;
  const reward = LOYALTY_REWARDS.find((r) => r.id === rewardId);
  if (!reward) {
    throw new Error('Nagrada nije pronađena.');
  }

  if (user.points < reward.pointsCost) {
    throw new Error(
      `Nemate dovoljno bodova za ovu nagradu (potrebno ${reward.pointsCost} PTS).`
    );
  }

  const shortNonce = Math.random().toString(36).substring(2, 7).toUpperCase();
  const sessionId = `RWD-${shortNonce}`;
  const qrPayload = `POPS-RWD|${sessionId}|${reward.id}|${user.memberCode}|-${reward.pointsCost}PTS`;

  const session: ActiveCheckoutSession = {
    sessionId,
    mode: 'reward',
    rewardId: reward.id,
    rewardTitle: reward.title,
    pointsCost: reward.pointsCost,
    pointsReward: 0,
    userId: user.id,
    userName: user.fullName,
    memberCode: user.memberCode,
    qrPayload,
    createdAt: Date.now(),
    status: 'waiting_for_scan',
  };

  savePopsState({
    ...state,
    activeSession: session,
  });

  return session;
}

export function startMemberCardSession(): ActiveCheckoutSession {
  const state = loadPopsState();
  const user = state.user || DEFAULT_DEMO_USER;
  const shortNonce = Math.random().toString(36).substring(2, 7).toUpperCase();
  const sessionId = `CARD-${shortNonce}`;
  const qrPayload = `POPS-CARD|${sessionId}|${user.memberCode}|${user.fullName}`;

  const session: ActiveCheckoutSession = {
    sessionId,
    mode: 'loyalty_card',
    pointsReward: 0,
    userId: user.id,
    userName: user.fullName,
    memberCode: user.memberCode,
    qrPayload,
    createdAt: Date.now(),
    status: 'waiting_for_scan',
  };

  savePopsState({
    ...state,
    activeSession: session,
  });

  return session;
}

export function clearActiveCheckoutSession(): void {
  const state = loadPopsState();
  savePopsState({
    ...state,
    activeSession: null,
  });
}

export function verifyCouponByStaff(
  payloadOrSessionId?: string,
  staffLocation = "Pop's Istočno Sarajevo — Kasa 1"
): {
  ok: boolean;
  message: string;
  session?: ActiveCheckoutSession;
} {
  const state = loadPopsState();
  const user = state.user || DEFAULT_DEMO_USER;
  const allCoupons = getAllCoupons(state);

  let targetCouponId: string | null = null;
  const sessionToVerify: ActiveCheckoutSession | null = state.activeSession;

  if (payloadOrSessionId && payloadOrSessionId.startsWith('POPS-CPN|')) {
    const parts = payloadOrSessionId.split('|');
    const parsedCouponId = parts[2];
    if (parsedCouponId) {
      targetCouponId = parsedCouponId;
    }
  } else if (sessionToVerify && sessionToVerify.couponId) {
    targetCouponId = sessionToVerify.couponId;
  }

  if (!targetCouponId) {
    return {
      ok: false,
      message: 'Nema aktivnog QR kupona za skeniranje.',
    };
  }

  const coupon = allCoupons.find((c) => c.id === targetCouponId);
  if (!coupon) {
    return {
      ok: false,
      message: 'Nepoznat kupon u sistemu.',
    };
  }

  const existingUsage = state.couponUsages[coupon.id];
  if (existingUsage && existingUsage.availableAgainAt > Date.now()) {
    return {
      ok: false,
      message: `Kupon "${coupon.title}" je već iskorišten danas (24h pauza).`,
    };
  }

  const now = Date.now();
  const cooldownMs = coupon.cooldownHours * 60 * 60 * 1000;
  const verificationCode =
    sessionToVerify?.sessionId || `VER-${Math.floor(1000 + Math.random() * 9000)}`;
  const branchShort = staffLocation.split('—')[0].trim();

  const verifiedSession: ActiveCheckoutSession = {
    sessionId: verificationCode,
    mode: 'coupon',
    couponId: coupon.id,
    couponTitle: coupon.title,
    promoPrice: coupon.promoPrice,
    originalPrice: coupon.originalPrice,
    pointsReward: coupon.pointsReward,
    userId: user.id,
    userName: user.fullName,
    memberCode: user.memberCode,
    qrPayload: payloadOrSessionId || '',
    createdAt: now,
    status: 'verified',
    verifiedAt: now,
    verifiedByLocation: staffLocation,
  };

  const newTx: LoyaltyTransaction = {
    id: `tx-${now}`,
    type: 'coupon_activated',
    title: `Kupon: ${coupon.title}`,
    subtitle: `Skenirano na kasi • ${staffLocation}`,
    referenceCode: verificationCode,
    pointsDelta: coupon.pointsReward,
    amountKm: coupon.promoPrice,
    branchName: branchShort,
    createdAt: now,
  };

  savePopsState({
    ...state,
    user: {
      ...user,
      points: user.points + coupon.pointsReward,
    },
    activeSession: verifiedSession,
    couponUsages: {
      ...state.couponUsages,
      [coupon.id]: {
        activatedAt: now,
        availableAgainAt: now + cooldownMs,
        verificationCode,
        staffLocation,
      },
    },
    transactions: [newTx, ...state.transactions],
  });

  return {
    ok: true,
    message: `Kupon "${coupon.title}" aktiviran (${coupon.promoPrice.toFixed(2)} KM) • Dodijeljeno +${coupon.pointsReward} PTS.`,
    session: verifiedSession,
  };
}

export function verifyRewardByStaff(
  rewardId?: string,
  staffLocation = "Pop's Istočno Sarajevo — Kasa 1"
): {
  ok: boolean;
  message: string;
  session?: ActiveCheckoutSession;
} {
  const state = loadPopsState();
  const user = state.user || DEFAULT_DEMO_USER;
  const activeSession = state.activeSession;

  const targetRewardId =
    rewardId || (activeSession?.mode === 'reward' ? activeSession.rewardId : undefined);
  const reward = LOYALTY_REWARDS.find((r) => r.id === targetRewardId);

  if (!reward) {
    return {
      ok: false,
      message: 'Nagrada nije pronađena za verifikaciju na kasi.',
    };
  }

  if (user.points < reward.pointsCost) {
    return {
      ok: false,
      message: `Gost nema dovoljno bodova (${user.points}/${reward.pointsCost} PTS).`,
    };
  }

  const now = Date.now();
  const code = activeSession?.sessionId || `RWD-${Math.floor(1000 + Math.random() * 9000)}`;
  const branchShort = staffLocation.split('—')[0].trim();

  const verifiedSession: ActiveCheckoutSession = {
    sessionId: code,
    mode: 'reward',
    rewardId: reward.id,
    rewardTitle: reward.title,
    pointsCost: reward.pointsCost,
    pointsReward: 0,
    userId: user.id,
    userName: user.fullName,
    memberCode: user.memberCode,
    qrPayload: activeSession?.qrPayload || `POPS-RWD|${code}|${reward.id}`,
    createdAt: now,
    status: 'verified',
    verifiedAt: now,
    verifiedByLocation: staffLocation,
  };

  const newTx: LoyaltyTransaction = {
    id: `tx-rwd-${now}`,
    type: 'reward_redeemed',
    title: `Gratis Nagrada: ${reward.title}`,
    subtitle: `Izdato na kasi (0.00 KM) • ${staffLocation}`,
    referenceCode: code,
    pointsDelta: -reward.pointsCost,
    amountKm: 0,
    branchName: branchShort,
    createdAt: now,
  };

  savePopsState({
    ...state,
    user: {
      ...user,
      points: user.points - reward.pointsCost,
    },
    activeSession: verifiedSession,
    transactions: [newTx, ...state.transactions],
  });

  return {
    ok: true,
    message: `Gratis nagrada "${reward.title}" potvrđena na kasi (0.00 KM)! Skinuto -${reward.pointsCost} PTS.`,
    session: verifiedSession,
  };
}

export function awardOrderPointsByStaff(
  orderAmountKm: number,
  staffLocation = "Pop's Istočno Sarajevo — Kasa 1"
): {
  ok: boolean;
  message: string;
  pointsAwarded: number;
} {
  const state = loadPopsState();
  const user = state.user || DEFAULT_DEMO_USER;

  if (!orderAmountKm || orderAmountKm <= 0) {
    return {
      ok: false,
      message: 'Unesite ispravan iznos narudžbe u KM.',
      pointsAwarded: 0,
    };
  }

  const pointsAwarded = Math.max(1, Math.round(orderAmountKm));
  const now = Date.now();
  const refCode = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const branchShort = staffLocation.split('—')[0].trim();

  const verifiedCardSession: ActiveCheckoutSession = {
    sessionId: refCode,
    mode: 'loyalty_card',
    pointsReward: pointsAwarded,
    orderAmountKm,
    userId: user.id,
    userName: user.fullName,
    memberCode: user.memberCode,
    qrPayload: `POPS-CARD|${refCode}|${user.memberCode}`,
    createdAt: now,
    status: 'verified',
    verifiedAt: now,
    verifiedByLocation: staffLocation,
  };

  const newTx: LoyaltyTransaction = {
    id: `tx-ord-${now}`,
    type: 'order_scan',
    title: `Narudžba u restoranu (${orderAmountKm.toFixed(2)} KM)`,
    subtitle: `Skeniran Moj Loyalty QR • ${staffLocation}`,
    referenceCode: refCode,
    pointsDelta: pointsAwarded,
    amountKm: orderAmountKm,
    branchName: branchShort,
    createdAt: now,
  };

  savePopsState({
    ...state,
    user: {
      ...user,
      points: user.points + pointsAwarded,
    },
    activeSession: verifiedCardSession,
    transactions: [newTx, ...state.transactions],
  });

  return {
    ok: true,
    message: `Skenirana kartica gosta (${user.fullName}) • Za račun od ${orderAmountKm.toFixed(2)} KM dodijeljeno je +${pointsAwarded} PTS!`,
    pointsAwarded,
  };
}

/**
 * Vlasnik kreira novi kupon uživo i on odmah postaje dostupan svim gostima
 */
export function createOwnerCustomCoupon(input: {
  title: string;
  subtitle: string;
  category: Coupon['category'];
  originalPrice: number;
  promoPrice: number;
  pointsReward: number;
  imageUrl?: string;
}): Coupon {
  const state = loadPopsState();
  const savingsPct = Math.max(
    5,
    Math.round(((input.originalPrice - input.promoPrice) / input.originalPrice) * 100)
  );

  const newCoupon: Coupon = {
    id: `cpn-owner-${Date.now()}`,
    title: input.title.trim(),
    subtitle: input.subtitle.trim(),
    category: input.category,
    originalPrice: input.originalPrice,
    promoPrice: input.promoPrice,
    discountBadge: `-${savingsPct}% POPUST`,
    pointsReward: input.pointsReward,
    cooldownHours: 24,
    imageUrl: input.imageUrl || BURGER_PLACEHOLDER_DEFAULT,
    tag: 'Nova ponuda',
    isCustom: true,
  };

  savePopsState({
    ...state,
    customCoupons: [newCoupon, ...(state.customCoupons || [])],
  });

  return newCoupon;
}

export function deleteOwnerCustomCoupon(couponId: string): void {
  const state = loadPopsState();
  savePopsState({
    ...state,
    customCoupons: (state.customCoupons || []).filter((c) => c.id !== couponId),
  });
}

/**
 * "Povedi ekipu u Pop's" — dodavanje pozvanog prijatelja i verifikacija kada prvi put skenira na kasi
 */
export function addReferralFriend(friendName: string): ReferralInvite {
  const state = loadPopsState();
  const clean = friendName.trim() || 'Kenan Karić';
  const newInvite: ReferralInvite = {
    id: `ref-${Date.now()}`,
    friendName: clean,
    status: 'waiting_first_scan',
    pointsReward: 30,
    createdAt: Date.now(),
  };

  savePopsState({
    ...state,
    referrals: [newInvite, ...(state.referrals || [])],
  });

  return newInvite;
}

export function verifyReferralFirstScan(referralId: string): {
  ok: boolean;
  message: string;
} {
  const state = loadPopsState();
  const user = state.user || DEFAULT_DEMO_USER;
  const target = (state.referrals || []).find((r) => r.id === referralId);

  if (!target || target.status === 'verified_at_pos') {
    return {
      ok: false,
      message: 'Pozivnica je već verifikovana.',
    };
  }

  const now = Date.now();
  const updatedReferrals = (state.referrals || []).map((r) =>
    r.id === referralId
      ? {
          ...r,
          status: 'verified_at_pos' as const,
          verifiedBranch: "Pop's Istočno Sarajevo",
        }
      : r
  );

  const newTx: LoyaltyTransaction = {
    id: `tx-ref-${now}`,
    type: 'referral_bonus',
    title: `Povedi ekipu: ${target.friendName}`,
    subtitle: "Prijatelj skenirao prvi račun na kasi • Pop's Istočno Sarajevo",
    referenceCode: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
    pointsDelta: target.pointsReward,
    branchName: "Pop's Istočno Sarajevo",
    createdAt: now,
  };

  savePopsState({
    ...state,
    user: {
      ...user,
      points: user.points + target.pointsReward,
    },
    referrals: updatedReferrals,
    transactions: [newTx, ...state.transactions],
  });

  return {
    ok: true,
    message: `${target.friendName} je upravo skenirao prvi račun u Pop's-u! Dobili ste +${target.pointsReward} PTS.`,
  };
}

export function fastForward24HoursCooldown(): void {
  const state = loadPopsState();
  savePopsState({
    ...state,
    couponUsages: {},
    activeSession: null,
  });
}
