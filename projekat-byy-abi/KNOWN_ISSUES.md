# Poznati Problemi (Known Issues)

Trenutno nema poznatih bugova u kodu (projekat je u fazi definisanja arhitekture).

## Operativni rizici identifikovani u analizi zahtjeva
1. **Ručni unos broja računa:** U stvarnom radu restorana brze hrane, ručni unos broja fiskalnog računa bez validacije formata ili jednokratnog koda otvara prostor za pogađanje brojeva računa (ili uzimanje tuđih računa sa stola). Rješenje mora uključivati validaciju jedinstvenosti računa i zaštitu od uzastopnog pogađanja (rate-limiting).
2. **Višekratno korištenje istog QR kupona (Screenshot problem):** Ako je QR kod statičan, korisnik može napraviti screenshot i poslati ga prijateljima. QR kod mora sadržavati jednokratni token (`nonce` / ID sesije kupona) koji nakon skeniranja od strane radnika postaje nevažeći.
