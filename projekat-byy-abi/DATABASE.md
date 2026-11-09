# Baza Podataka i Modeli Podataka (Database)

U PWA demo verziji podaci su perzistirani u strukturiranom lokalnom skladištu (`localStorage` pod ključem `pops_loyalty_db_v1`) sa dvosmjernom sinhronizacijom (`storage` + `BroadcastChannel`), dok je šema dizajnirana 1:1 za produkcijsku PostgreSQL / Supabase bazu.

## Tabele / Entiteti

### 1. `users` (Korisnici)
| Polje | Tip | Opis |
| :--- | :--- | :--- |
| `id` | `string (UUID)` | Primarni ključ korisnika |
| `fullName` | `string` | Ime i prezime gosta |
| `phoneOrEmail` | `string` | Broj telefona ili email za prijavu (Unique) |
| `points` | `number` | Trenutno stanje loyalty bodova |
| `role` | `'customer' \| 'staff'` | Uloga u sistemu |
| `createdAt` | `string (ISO)` | Datum registracije |

### 2. `coupons` (Kuponi)
| Polje | Tip | Opis |
| :--- | :--- | :--- |
| `id` | `string` | Jedinstveni ID kupona |
| `title` | `string` | Naziv ponude (npr. "Big Pop's Burger Combo") |
| `subtitle` | `string` | Opis sastojaka / menija |
| `category` | `'burgeri' \| 'slatko' \| 'combo' \| 'kafa'` | Kategorija iz `pops.ba` ponude |
| `originalPrice` | `number` | Redovna cijena u KM |
| `promoPrice` | `number` | Cijena sa kuponom u KM |
| `discountLabel` | `string` | Oznaka popusta (npr. "-20%" ili "UŠTEDA 3.00 KM") |
| `pointsReward` | `number` | Broj loyalty bodova koje gost dobija aktivacijom na kasi |
| `cooldownHours` | `number` | Vrijeme zaključavanja nakon korištenja (standardno `24` sata) |

### 3. `coupon_usages` (Evidencija korištenja i 24h Cooldown)
| Polje | Tip | Opis |
| :--- | :--- | :--- |
| `couponId` | `string` | ID iskorištenog kupona |
| `userId` | `string` | ID korisnika |
| `activatedAt` | `number (timestamp)` | Tačno vrijeme skeniranja od strane radnika |
| `availableAgainAt` | `number (timestamp)` | `activatedAt + 24h` (dok je `now < availableAgainAt`, kupon je zaključan) |
| `verificationCode` | `string` | Jednokratni kod sesije |

### 4. `receipt_claims` & `transactions` (Računi i Historija bodova)
| Polje | Tip | Opis |
| :--- | :--- | :--- |
| `id` | `string` | ID transakcije |
| `userId` | `string` | Korisnik koji je ostvario bodove |
| `type` | `'coupon_activated' \| 'receipt_entry' \| 'reward_redeemed'` | Tip promjene bodova |
| `referenceCode` | `string` | Broj računa (npr. `POPS-8841`) ili kod kupona |
| `title` | `string` | Opis transakcije |
| `pointsDelta` | `number` | Promjena bodova (`+15`, `+25`, `-100`) |
| `createdAt` | `number (timestamp)` | Vrijeme transakcije |

## Primarna pravila i validacije
1. **24h Cooldown pravilo:** Kupon čiji je `availableAgainAt > Date.now()` ne može generisati novi QR kod za aktivaciju niti ga radnik može ponovo skenirati dok ne istekne 24 sata.
2. **Jedinstvenost računa:** Svaki `referenceCode` kod unosa računa je unikatan na nivou cijelog sistema — isti broj fiskalnog računa ne može se unijeti više puta.
