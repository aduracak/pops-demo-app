import { Coupon, LoyaltyReward } from '../types/pops';

/**
 * Čist, uniforman burger placeholder (SVG Data URI) za demo prikaz bez generičkih stock slika.
 */
function createBurgerPlaceholderSvg(label: string, accentHex = '#DF3B16'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
    <rect width="240" height="240" fill="#161412"/>
    <circle cx="120" cy="112" r="72" fill="#221E1B"/>
    <!-- Top Bun -->
    <path d="M68 102 C68 68, 172 68, 172 102 Z" fill="#E6A15C"/>
    <!-- Sesame seeds -->
    <ellipse cx="102" cy="84" rx="4" ry="2" fill="#FAF8F5" transform="rotate(-15 102 84)"/>
    <ellipse cx="122" cy="79" rx="4" ry="2" fill="#FAF8F5"/>
    <ellipse cx="140" cy="85" rx="4" ry="2" fill="#FAF8F5" transform="rotate(15 140 85)"/>
    <!-- Lettuce / Sauce wave -->
    <path d="M62 107 Q76 114, 90 107 T118 107 T146 107 T178 107" fill="none" stroke="#10B981" stroke-width="6" stroke-linecap="round"/>
    <!-- Cheddar Cheese -->
    <polygon points="66,113 174,113 164,123 144,115 120,126 96,115 76,123" fill="#F59E0B"/>
    <!-- Beef Patty -->
    <rect x="64" y="120" width="112" height="18" rx="9" fill="#5C2C16"/>
    <!-- Bottom Bun -->
    <path d="M68 142 L172 142 C172 158, 158 164, 120 164 C82 164, 68 158, 68 142 Z" fill="#D9924C"/>
    <!-- Label Pill -->
    <rect x="36" y="192" width="168" height="26" rx="8" fill="${accentHex}"/>
    <text x="120" y="209" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-weight="800" font-size="11" letter-spacing="0.8">${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const BURGER_PLACEHOLDER_DEFAULT = createBurgerPlaceholderSvg("POP'S BURGER");

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cpn-grand-tasty-meni',
    title: 'Grand Tasty Burger Meni',
    subtitle: 'Juneće meso, cheddar sir, zelena salata, paradajz, luk, Tasty sos + pomfrit + Pepsi 0.33l',
    category: 'combo',
    originalPrice: 16.0,
    promoPrice: 12.5,
    discountBadge: '-3.50 KM',
    pointsReward: 20,
    cooldownHours: 24,
    imageUrl: createBurgerPlaceholderSvg('GRAND TASTY'),
    tag: 'Grand Meni',
  },
  {
    id: 'cpn-texas-burger-meni',
    title: 'Texas Burger Meni',
    subtitle: 'Juneće meso, cheddar sir, pohovani kolutići luka (onion rings), salata, Pop’s sos + pomfrit + piće',
    category: 'combo',
    originalPrice: 15.5,
    promoPrice: 11.9,
    discountBadge: '-3.60 KM',
    pointsReward: 20,
    cooldownHours: 24,
    imageUrl: createBurgerPlaceholderSvg('TEXAS MENI'),
    tag: 'Pop’s Klasik',
  },
  {
    id: 'cpn-big-pops-burger',
    title: "Big Pop's Burger",
    subtitle: 'Duplo juneće meso, dupli cheddar, svježa salata, kiseli krastavci i originalni Big Pop’s sos',
    category: 'burgeri',
    originalPrice: 11.5,
    promoPrice: 8.9,
    discountBadge: '-2.60 KM',
    pointsReward: 15,
    cooldownHours: 24,
    imageUrl: createBurgerPlaceholderSvg("BIG POP'S"),
    tag: 'Burger',
  },
  {
    id: 'cpn-maestro-pulled-beef',
    title: 'Maestro Pulled Beef Special',
    subtitle: 'Trgana junetina u brioche pecivu, topljeni cheddar sir, karamelizirani luk i BBQ sos',
    category: 'burgeri',
    originalPrice: 16.0,
    promoPrice: 12.9,
    discountBadge: '-3.10 KM',
    pointsReward: 25,
    cooldownHours: 24,
    imageUrl: createBurgerPlaceholderSvg('MAESTRO BEEF'),
    tag: 'Maestro Collection',
  },
  {
    id: 'cpn-grand-bbq-burger',
    title: 'Grand BBQ Burger',
    subtitle: 'Juneće meso, cheddar sir, hrskava goveđa slanina, prženi luk, zelena salata i dimljeni BBQ sos',
    category: 'burgeri',
    originalPrice: 11.0,
    promoPrice: 8.5,
    discountBadge: '-2.50 KM',
    pointsReward: 15,
    cooldownHours: 24,
    imageUrl: createBurgerPlaceholderSvg('GRAND BBQ'),
    tag: 'Grand serija',
  },
  {
    id: 'cpn-pops-classic-meni',
    title: "Pop's Classic Burger Meni",
    subtitle: "Pop's burger (junetina, cheddar, salata, paradajz, Pop's sos) + porcija pomfrita + Pepsi 0.33l",
    category: 'combo',
    originalPrice: 13.0,
    promoPrice: 9.9,
    discountBadge: '-3.10 KM',
    pointsReward: 15,
    cooldownHours: 24,
    imageUrl: createBurgerPlaceholderSvg('CLASSIC MENI'),
    tag: 'Meni ponuda',
  },
  {
    id: 'cpn-chicken-box',
    title: "Pop's Chicken Box + Pomfrit",
    subtitle: "Hrskavi pileći strips fileti, chicken nuggets, porcija domaćeg pomfrita i 2x Pop's sosa",
    category: 'combo',
    originalPrice: 14.0,
    promoPrice: 10.9,
    discountBadge: '-3.10 KM',
    pointsReward: 18,
    cooldownHours: 24,
    imageUrl: createBurgerPlaceholderSvg('CHICKEN BOX', '#D97706'),
    tag: 'Chicken program',
  },
  {
    id: 'cpn-sushi-palacinka',
    title: 'Sushi Palačinka Nutella & Plazma',
    subtitle: 'Rolovana Pop’s palačinka punjena Nutellom, mljevenom plazmom i prelivom od bijele čokolade',
    category: 'slatko',
    originalPrice: 7.5,
    promoPrice: 5.5,
    discountBadge: '-2.00 KM',
    pointsReward: 10,
    cooldownHours: 24,
    imageUrl: createBurgerPlaceholderSvg('PALACINKA', '#0D9464'),
    tag: 'Slatki program',
  },
];

export const LOYALTY_REWARDS: LoyaltyReward[] = [
  {
    id: 'rwd-pops-classic-burger',
    title: "Gratis Pop's Classic Burger",
    description: "Originalni Pop's juneći burger sa cheddar sirom i Pop's sosom.",
    pointsCost: 120,
    category: 'Burgeri',
  },
  {
    id: 'rwd-grand-tasty-burger',
    title: 'Gratis Grand Tasty ili Texas Burger',
    description: 'Odaberite Grand Tasty ili Texas Burger potpuno besplatno na kasi.',
    pointsCost: 180,
    category: 'Grand Burgeri',
  },
  {
    id: 'rwd-maestro-pulled-meni',
    title: 'Gratis Maestro Pulled Beef Meni',
    description: 'Maestro Pulled Beef Special + pomfrit + piće po izboru.',
    pointsCost: 250,
    category: 'Maestro Collection',
  },
];
