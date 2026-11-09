# Tehničke Odluke (Decisions)

## 1. Zamjena ručnog unosa računa sa "Moj Loyalty QR" (Bodovi za svaku narudžbu na kasi)
- **Zašto:** Ručni unos broja fiskalnog računa stvara gužvu i otvara prostor za zloupotrebu (uzimanje tuđih računa sa stolova). Umjesto toga, svaki registrovani gost u srednjem tabu (**Moj QR**) i na vrhu kartice ima svoj **Lični Loyalty QR kod**.
- **Kako radi:** Kada gost naruči bilo šta sa menija (čak i bez kupona), pokaže svoj **Moj QR** na kasi. Radnik ga skenira istim skenerom i unese/klikne iznos računa u KM (`1 KM = 1 PTS`). Bodovi odmah liježu na ekran gosta bez kucanja šifri računa i bez mogućnosti prevare.

## 2. UX Koncept Kupona: "Klikni -> Aktiviraj na kasi -> 24h Cooldown"
- **Zašto:** Kada gost želi iskoristiti konkretan popust, klikne na kupon -> **"Aktiviraj na kasi"** -> radnik skenira QR kod -> gost dobija trenutnu potvrdu i bodove, a kupon odlazi u 24h pauzu.

## 3. Taktilni "Paper & White" dizajn + Bubble Navbar sa udubljenjem
- **Zašto:** Čista bijela površina kartica na toploj podlozi sa crnim i crveno-narandžastim akcentima (`#DF3B16`). Donji meni je lebdeća kapsula u kojoj se aktivni tab fizički udubljuje (`bubble-tab-sunken`), a u režimu **Radnik** u sredini se nalazi veliko okruglo dugme **SKENIRAJ**.
