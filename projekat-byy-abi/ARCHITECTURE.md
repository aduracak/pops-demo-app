# Arhitektura Sistema

## Pregled Arhitekture (Mobile-First PWA)

```
src/
├── types/
│   └── pops.ts              # Tipovi za korisnika, kupone, 24h cooldown, račune i transakcije
├── data/
│   └── initialData.ts       # Autentični Pop's meni kuponi, nagrade i demo fiskalni računi
├── services/
│   └── popsStore.ts         # Centralni servis stanja, 24h cooldown logika, validacija računa i Real-Time sinhronizacija
├── components/
│   ├── AuthScreen.tsx       # Prijava i registracija + brzi demo ulaz
│   ├── HeaderPass.tsx       # Gornja Pop's Loyalty kartica sa stanjem bodova i progresom do nagrade
│   ├── CouponCard.tsx       # Kartica kupona (Dostupan vs. 24h Cooldown odbrojavanje)
│   ├── CouponModal.tsx      # "Aktiviraj na kasi" modal sa dinamičkim QR kodom i Live potvrdom aktivacije
│   ├── ReceiptView.tsx      # Unos broja fiskalnog računa sa validacijom i historijom bodova
│   ├── StaffScannerView.tsx # Radnički POS skener (prava kamera + unos/simulacija skeniranja za demo)
│   └── ProfileView.tsx      # Profil korisnika, pregled 24h pravila i odjava
└── App.tsx                  # Glavni mobilni okvir, navigacija i Demo Role Switcher (Gost / Radnik)
```

## Glavni Tok Podataka (Data Flow)
1. **Aktivacija kupona na kasi:**
   - Gost odabere kupon -> klikne **"Aktiviraj na kasi"** -> `popsStore` generiše aktivnu sesiju kupona sa jedinstvenim QR payload-om (`POPS-CPN:<userId>:<couponId>:<timestamp>`).
   - Radnik u `StaffScannerView` skenira QR kod (kamerom ili demo okidačem).
   - `popsStore.verifyCouponByStaff()` validira da kupon nije u 24h cooldownu, postavlja `lastUsedAt = now`, prebacuje kupon iz aktivnih u 24h cooldown, uvećava `points` korisnika i emituje događaj potvrde.
   - `CouponModal` na ekranu gosta hvata događaj i prikazuje ekran potvrde: **"Kupon aktiviran! +X bodova"**, nakon čega kupon nestaje iz dostupnih i dobija 24h tajmer.
2. **Unos broja računa:**
   - Gost unosi broj računa (npr. `POPS-8841`).
   - `popsStore.claimReceipt()` provjerava format, sprečava duplikate (isti račun se ne može unijeti dva puta) i dodjeljuje odgovarajuće loyalty bodove uz zapis u historiju transakcija.
