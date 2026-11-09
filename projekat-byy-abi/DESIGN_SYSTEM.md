# Dizajn Sistem (Design System)

## Vizuelni Identitet (Tactile Hospitality — Bez "AI Slop" elemenata)
Dizajn koristi fizički, taktilni kontrast inspirisan štampanim vaučerima i modernim ugostiteljskim brendovima:
- **Pozadina (Warm Bone Paper):** `#F4F0E8` (topla papirna podloga).
- **Površina Kartica:** Čisto bijela `#FFFFFF` sa obrubom `#DFD8CB` i perforiranim urezima sa strane.
- **Primarni Kontrast (Espresso Ink):** `#161412` za tipografiju, članske bedževe i školjku donje navigacije.
- **Akcentna Boja (Pop's Vermilion):** `#DF3B16` za akcije aktivacije na kasi, bodove i centralno dugme skenera.
- **Potvrda (POS Emerald):** `#0D9464` za verifikovane kupone i upisane bodove.

## Animacije i Mikro-interakcije
1. **Klizeće udubljenje u Bubble Navbaru (`bubble-sunken-slider` u [`BubbleNavbar.tsx`](file:///g:/Pops/src/components/BubbleNavbar.tsx)):**
   - Prilikom promjene taba (`Kuponi` ↔ `Moj QR` ↔ `Nagrade`), udubljena podloga sa unutrašnjom sjenom (`inset`) glatko klizi sa spring fizikom (`cubic-bezier(0.34, 1.45, 0.64, 1)`), a ikonica aktivnog taba radi taktilni `iconSpring` odskok.
2. **Animirani brojač bodova ([`AnimatedCounter.tsx`](file:///g:/Pops/src/components/AnimatedCounter.tsx)):**
   - Svaka promjena stanja bodova (aktivacija kupona ili skeniranje obične narudžbe) vrti brojeve na 60fps (`requestAnimationFrame`) uz kratki narandžasti puls.
3. **Kaskadni ulaz kartica (`animate-card-enter`):**
   - Prilikom promjene kategorije kupona, kartice ulaze kaskadno sa pomakom od `45ms` po kartici.
4. **3D QR Reveal, Laser Scanline i Stamp Pop (`animate-qr-reveal`, `animate-qr-laser`, `animate-stamp-pop`):**
   - Otvaranje QR koda animira 3D otvaranje kartice sa crvenom laserskom linijom koja klizi preko QR koda, a potvrda radnika na kasi okida zeleni "pečat" sa pulsirajućim prstenom.
