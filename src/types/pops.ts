export type CouponCategory = 'sve' | 'burgeri' | 'combo' | 'slatko' | 'kafa';
export type AppRole = 'customer' | 'staff' | 'owner';

export interface User {
  id: string;
  fullName: string;
  phoneOrEmail: string;
  memberCode: string;
  referralCode: string;
  points: number;
  createdAt: string;
}

export interface Coupon {
  id: string;
  title: string;
  subtitle: string;
  category: Exclude<CouponCategory, 'sve'>;
  originalPrice: number;
  promoPrice: number;
  discountBadge: string;
  pointsReward: number;
  cooldownHours: number;
  imageUrl: string;
  tag?: string;
  isCustom?: boolean;
}

export interface CouponUsageMap {
  [couponId: string]: {
    activatedAt: number;
    availableAgainAt: number;
    verificationCode: string;
    staffLocation: string;
  };
}

export interface ActiveCheckoutSession {
  sessionId: string;
  mode: 'coupon' | 'loyalty_card' | 'reward';
  couponId?: string;
  couponTitle?: string;
  rewardId?: string;
  rewardTitle?: string;
  pointsCost?: number;
  promoPrice?: number;
  originalPrice?: number;
  pointsReward: number;
  orderAmountKm?: number;
  userId: string;
  userName: string;
  memberCode: string;
  qrPayload: string;
  createdAt: number;
  status: 'waiting_for_scan' | 'verified';
  verifiedAt?: number;
  verifiedByLocation?: string;
}

export interface LoyaltyTransaction {
  id: string;
  type: 'coupon_activated' | 'order_scan' | 'reward_redeemed' | 'referral_bonus';
  title: string;
  subtitle: string;
  referenceCode: string;
  pointsDelta: number;
  amountKm?: number;
  branchName?: string;
  createdAt: number;
}

export interface LoyaltyReward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: string;
}

export interface ReferralInvite {
  id: string;
  friendName: string;
  status: 'waiting_first_scan' | 'verified_at_pos';
  pointsReward: number;
  createdAt: number;
  verifiedBranch?: string;
}
