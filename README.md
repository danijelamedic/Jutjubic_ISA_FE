# Jutjubić ISA – Frontend (Angular)

Ovaj repozitorijum sadrži **frontend deo** projekta **Jutjubić**, rađenog u okviru predmeta *Internet softverske arhitekture (ISA)*.

Frontend aplikacija je implementirana kao **Single Page Application (SPA)** korišćenjem **Angular** frameworka i komunicira sa backend servisom putem REST API-ja i WebSocket konekcije (STOMP).

Cilj frontend aplikacije je da obezbedi:
- jasan i funkcionalan korisnički interfejs
- klijentsku zaštitu pristupa funkcionalnostima
- real-time interakcije (Watch Party)
- potpunu podršku za sve implementirane ISA tačke

---
## Implementacija po tačkama

---

### 3.1 Prikaz informacija neautentifikovanim korisnicima (Frontend)

#### Šta je implementirano

- Neautentifikovanim korisnicima je omogućen pristup sledećim delovima aplikacije:
  - početnoj stranici sa listom video objava (feed)
  - stranici za pregled pojedinačnog videa
  - stranici za pregled javnog profila korisnika (autora videa ili komentara)
  - stranicama za registraciju i prijavu na sistem

- Video objave na početnoj stranici su prikazane **sortirane po vremenu nastanka**, sa najnovijim objavama na vrhu.

#### Ograničenja za neautentifikovane korisnike

- Neautentifikovani korisnici **nemaju mogućnost** da:
  - lajkuju video objave
  - ostavljaju komentare
  - postavljaju nove video objave
  - pristupe Watch Party funkcionalnosti

- Pri pokušaju izvršavanja zabranjene akcije (lajk ili komentar), korisniku se prikazuje **informativna poruka** da je potrebno da se prijavi na sistem, uz mogućnost preusmeravanja na login stranicu.

#### Klijentska zaštita pristupa

- Frontend aplikacija koristi **globalni auth state** za praćenje stanja autentifikacije korisnika.
- Vidljivost UI elemenata (dugmad za lajkovanje, komentarisanje, postavljanje videa, Watch Party) je uslovljena stanjem autentifikacije korisnika.
- Zaštićene rute su obezbeđene pomoću **route guard-a**, čime se sprečava pristup funkcionalnostima sistema bez validne autentifikacije.


### 3.2 Registracija korisnika i prijava na sistem (Frontend)

#### Šta je implementirano

- Frontend aplikacija sadrži posebne stranice za:
  - registraciju korisnika
  - prijavu korisnika na sistem

- Stranice za registraciju i prijavu su **uvek dostupne neautentifikovanim korisnicima**.

#### Registracija korisnika

- Forma za registraciju omogućava unos sledećih podataka:
  - email adresa
  - korisničko ime
  - lozinka
  - potvrda lozinke
  - ime
  - prezime
  - adresa

- Implementirane su **klijentske validacije** koje obuhvataju:
  - obavezan unos svih polja
  - validaciju formata email adrese
  - proveru poklapanja lozinke i potvrde lozinke

- U slučaju greške prilikom registracije, korisniku se prikazuju **odgovarajuće poruke o grešci** dobijene sa backend-a.

#### Prijava na sistem (Login)

- Forma za prijavu omogućava prijavu pomoću:
  - email adrese
  - lozinke

- Nakon uspešne prijave:
  - JWT token dobijen sa backend-a se čuva na klijentskoj strani
  - stanje autentifikacije se ažurira u okviru globalnog auth state-a
  - korisnik se preusmerava na početnu stranicu aplikacije

- Neuspešni pokušaji prijave rezultuju prikazom poruke o grešci, uključujući slučajeve:
  - neaktiviranog naloga
  - pogrešnih kredencijala
  - prekoračenja dozvoljenog broja pokušaja prijave

#### Upravljanje stanjem autentifikacije

### 3.3 Kreiranje video objave (Frontend)

#### Šta je implementirano

- Frontend aplikacija omogućava **samo autentifikovanim korisnicima** da postavljaju nove video objave.
- Funkcionalnost za kreiranje video objave dostupna je isključivo kroz **zaštićenu rutu**, kojoj neautentifikovani korisnici nemaju pristup.

#### Forma za kreiranje video objave

- Forma za kreiranje video objave omogućava unos sledećih podataka:
  - naslov videa
  - opis videa
  - izbor thumbnail slike
  - izbor video fajla (mp4 format)
  - opciono unos geografske lokacije

- Video fajl i thumbnail se biraju **sa lokalnog računara korisnika**, u skladu sa specifikacijom projekta.

#### Klijentske validacije

- Na klijentskoj strani su implementirane osnovne validacije:
  - obavezan unos naslova i opisa
  - provera da li je izabran video fajl
  - provera da li je izabran thumbnail
  - provera formata video fajla (mp4)

- U slučaju nevalidnih podataka ili greške tokom slanja zahteva, korisniku se prikazuje **odgovarajuća poruka o grešci**.

#### Slanje podataka ka backend-u

- Podaci se backend-u prosleđuju korišćenjem **multipart/form-data** zahteva.
- Metapodaci o video objavi šalju se kao JSON deo zahteva, dok se video i thumbnail šalju kao fajl delovi zahteva.

#### Ponašanje nakon uspešnog kreiranja

- Nakon uspešnog kreiranja video objave:
  - korisnik se automatski preusmerava na stranicu svog profila
  - novokreirana video objava je odmah vidljiva u korisničkom interfejsu


- Frontend koristi centralizovano upravljanje stanjem autentifikacije:
  - proverava se da li postoji validan JWT token
  - omogućava se dinamičko prilagođavanje korisničkog interfejsa u zavisnosti od stanja prijave
  - obezbeđuje se pravilno ponašanje zaštićenih ruta i funkcionalnosti
 
### 3.6 Postupak komentarisanja videa (Frontend)

#### Šta je implementirano

- Frontend aplikacija omogućava **samo autentifikovanim korisnicima** da ostavljaju komentare na video objavama.
- Neautentifikovani korisnici mogu da **čitaju komentare**, ali nemaju mogućnost njihovog pisanja.

#### Prikaz i unos komentara

- Na stranici za pregled videa prikazana je lista komentara:
  - sortirana **od najnovijeg ka najstarijem**
  - uz prikaz autora komentara i vremena kreiranja

- Autentifikovanim korisnicima je dostupna forma za unos novog komentara koja prihvata:
  - isključivo tekstualni sadržaj

#### Paginacija komentara

- U slučaju većeg broja komentara, frontend koristi **paginaciju**:
  - komentari se učitavaju stranica po stranica
  - korisniku je omogućena navigacija kroz strane komentara

- Paginacija je vizuelno i funkcionalno usklađena sa ostatkom aplikacije.

#### Ograničenja i poruke korisniku

- Ukoliko neautentifikovani korisnik pokuša da ostavi komentar:
  - prikazuje se informativna poruka da je potrebna prijava
  - korisniku se nudi preusmeravanje na login stranicu

- U slučaju da backend odbije zahtev (npr. prekoračen limit komentara):
  - frontend prikazuje poruku o grešci dobijenu sa servera


### 3.7 Brojač pregleda video objava (Frontend)

#### Šta je implementirano

- Frontend aplikacija automatski inicira uvećavanje broja pregleda svaki put kada korisnik otvori stranicu za pregled video objave.
- Inkrement broja pregleda se vrši kroz poziv odgovarajućeg backend endpointa prilikom učitavanja video stranice.

#### Prikaz broja pregleda

- Ukupan broj pregleda videa je vidljiv korisnicima:
  - na stranici za pregled pojedinačnog videa
  - u okviru korisničkog interfejsa, zajedno sa ostalim informacijama o video objavi

- Broj pregleda se ažurira dinamički u skladu sa podacima dobijenim sa backend-a.

#### Uloga frontenda

- Frontend nema logiku za samostalno računanje pregleda, već se u potpunosti oslanja na backend implementaciju radi obezbeđivanja konzistentnosti broja pregleda.
- Frontend služi isključivo kao klijent koji:
  - inicira zahtev za uvećanje pregleda
  - prikazuje aktuelnu vrednost broja pregleda korisniku


### 3.15 Watch Party (Frontend)

#### Šta je implementirano

- Frontend aplikacija omogućava **autentifikovanim korisnicima** korišćenje Watch Party funkcionalnosti.
- Korisnici mogu da:
  - vide listu aktivnih Watch Party soba
  - kreiraju novu Watch Party sobu za izabrani video
  - pridruže se postojećoj Watch Party sobi

#### Kreiranje i prikaz Watch Party sobe

- Prilikom kreiranja Watch Party sobe, korisnik bira video za koji se soba kreira.
- Nakon uspešnog kreiranja, korisnik se preusmerava na stranicu Watch Party sobe.
- Interfejs Watch Party sobe se prilagođava u zavisnosti od uloge korisnika:
  - vlasnik sobe ima mogućnost da pokrene video
  - gosti vide status sobe i čekaju pokretanje videa od strane vlasnika

#### Real-time komunikacija

- Za real-time komunikaciju koristi se **WebSocket** veza uz **STOMP** protokol.
- Frontend uspostavlja WebSocket konekciju ka backend-u i pretplaćuje se na odgovarajuće teme (topics) za Watch Party događaje.
- Događaji se obrađuju u realnom vremenu, uključujući:
  - ulazak korisnika u sobu
  - pokretanje videa od strane vlasnika sobe

#### Pokretanje videa i ponašanje klijenta

- Kada vlasnik sobe pokrene video:
  - frontend svih članova Watch Party sobe automatski dobija događaj
  - korisnici se preusmeravaju na stranicu za pregled istog videa

- Frontend **ne implementira sinhronizaciju play/pause kontrola niti trenutne pozicije videa**, u skladu sa zahtevima specifikacije.

#### Zaštita pristupa

- Watch Party funkcionalnost je dostupna isključivo autentifikovanim korisnicima.
- Pristup Watch Party rutama je zaštićen korišćenjem **route guard-a**.

## Pokretanje frontend aplikacije

### Preduslovi

Za pokretanje frontend aplikacije potrebno je imati instalirano:
- **Node.js** (preporučena verzija 18 ili novija)
- **npm** (dolazi uz Node.js)
- **Angular CLI**

Angular CLI se može instalirati globalno sledećom komandom:
```
npm install -g @angular/cli
```
### Instalacija zavisnosti

U root direktorijumu frontend projekta pokrenuti:
```npm install```

### Pokretanje aplikacije

Frontend aplikacija se pokreće sledećom komandom:```ng serve```


Nakon pokretanja, aplikacija je dostupna na adresi:

```http://localhost:4200```

Napomena

- Frontend aplikacija komunicira sa backend servisom putem REST API-ja i WebSocket konekcije.
Za ispravan rad aplikacije potrebno je da backend servis bude pokrenut i dostupan.

