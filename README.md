# Devize Service Auto, versiunea cu conturi

Fiecare servis își creează un cont cu email și parolă și vede doar datele lui. Datele stau online (Supabase), aplicația stă pe Vercel, iar codul pe GitHub.

## Fișierele

| Fișier | Ce face |
|---|---|
| `index.html` | Aplicația (logare, devize, TVA, tipărire, setări, import, export) |
| `config.js` | Cele două valori din Supabase, pe care le completezi tu |
| `schema.sql` | Crearea bazei de date și a regulilor de securitate |
| `README.md` | Acest ghid |

Nu ai nevoie să instalezi nimic pe laptop. Totul se face din browser.

---

## Pasul 1. Supabase (aproximativ 10 minute)

1. Intră pe **supabase.com** și autentifică-te cu GitHub.
2. **New project**. Alege un nume (de exemplu `devize-service`), o parolă pentru baza de date (**salvează-o undeva**) și regiunea **Central EU (Frankfurt)** (date în Uniunea Europeană). Așteaptă 1-2 minute până se creează.
3. În meniul din stânga: **SQL Editor** > **New query**. Deschide fișierul `schema.sql`, copiază **tot** conținutul, lipește-l în editor și apasă **Run**. Trebuie să apară `Success. No rows returned`. Dacă apare o eroare, copiază-mi-o.
4. **Authentication** > **Providers** (sau **Sign In / Providers**) > **Email**: să fie activat. Pentru testul de diseară poți dezactiva **Confirm email**, ca să intri direct după crearea contului. **Reactivează-l înainte să dai aplicația unui client.**
5. **Project Settings** > **API** (sau **API Keys**). Copiază:
   - **Project URL** (arată ca `https://abcdefgh.supabase.co`)
   - cheia **publică**: `anon` sau `publishable`

   **Nu folosi** cheia `service_role` sau `secret`. Aceea nu se pune niciodată în aplicație.
6. Deschide `config.js` într-un editor de text (Notepad merge) și înlocuiește cele două valori `COMPLETEAZA` cu cele copiate. Salvează.

## Pasul 2. Test rapid pe laptop (opțional)

Dă dublu click pe `index.html`, se deschide în browser. Apasă **Creează unul**, scrie numele service-ului, un email și o parolă de cel puțin 8 caractere. Dacă ai dezactivat confirmarea emailului, intri direct. Fă un deviz și vezi că apare „Salvat” sus.

## Pasul 3. GitHub

1. Pe **github.com**: **New repository**. Nume `devize-service`, **Private**, apoi **Create repository**.
2. În pagina repository-ului apasă **uploading an existing file**. Trage cele patru fișiere (`index.html`, `config.js`, `schema.sql`, `README.md`) și apasă **Commit changes**.

Cheia publică din `config.js` poate sta în repository. Este publică prin design, iar securitatea vine din regulile din `schema.sql`.

## Pasul 4. Vercel

1. Pe **vercel.com**: autentifică-te cu GitHub, apoi **Add New** > **Project**.
2. Alege repository-ul `devize-service` > **Import**.
3. **Framework Preset**: `Other`. Lasă goale *Build Command* și *Output Directory*. Apasă **Deploy**.
4. După un minut primești o adresă de tipul `https://devize-service-xxxx.vercel.app`. Aceasta este aplicația. O poți deschide și de pe telefon.

## Pasul 5. Spune-i lui Supabase adresa aplicației

În Supabase: **Authentication** > **URL Configuration**:
- **Site URL**: adresa de la Vercel
- **Redirect URLs**: adaugă aceeași adresă

Fără asta, linkurile din emailurile de confirmare și de resetare a parolei nu te duc la aplicație.

## Pasul 6. Verificarea de diseară

1. Creează contul A (cu un email real) și fă un deviz. Tipărește-l.
2. Într-o **fereastră privată** creează contul B. Lista trebuie să fie **goală**: contul B nu vede devizul contului A. Aceasta este verificarea cea mai importantă.
3. Închide browserul, redeschide adresa și autentifică-te: datele trebuie să fie acolo.
4. Deschide adresa de pe telefon și autentifică-te: aceleași date.
5. Încearcă **Ai uitat parola?** (necesită pasul 5).
6. Într-un cont gol: **Setări** > **Importă din fișierul vechi**, cu copia de rezervă descărcată din versiunea de pe laptopul din service.

## Cum modifici aplicația mai târziu

Pe GitHub deschizi fișierul, apeși pictograma creion, modifici și apeși **Commit changes**. Vercel publică singur noua versiune în aproximativ un minut. Modificările la baza de date se fac din **SQL Editor** din Supabase.

---

## Înainte să o dai altor servicii

- **Date personale (GDPR).** Păstrezi nume, telefoane și numere auto ale clienților altora. Servisul este „operator”, iar tu ești „persoană împuternicită”. Ai nevoie de termeni de utilizare, politică de confidențialitate și un acord de prelucrare a datelor. Cere un jurist să le verifice.
- **Documente fiscale.** Aplicația nu emite facturi sau bonuri fiscale. Spune asta clar în termeni. Facturarea rămâne în programul lor de facturare.
- **TVA.** Cota standard în România este 21% din 1 august 2025 (cea redusă este 11%, doar pentru anumite bunuri și servicii). Cota se poate schimba în **Setări** și pe fiecare deviz în parte, iar devizele vechi își păstrează cota cu care au fost făcute.
- **Copii de rezervă.** Planul gratuit Supabase poate pune proiectul în pauză după o perioadă de inactivitate și nu garantează copii de rezervă zilnice. Pentru clienți care plătesc, treci pe un plan plătit cu backup-uri. Verifică prețurile și condițiile actuale pe supabase.com.
- **Istoricul de 12 luni** este o limită de afișare setată în `config.js` (`HISTORY_MONTHS`). Datele mai vechi rămân salvate în baza de date. Nu este o limită de securitate, deci dacă vrei un pachet cu istoric limitat, trebuie impus și în baza de date.

## Limite actuale

- Un cont este un servis. Nu există încă angajați cu conturi separate.
- Nu există plată automată a abonamentului. Începe cu transfer bancar.
- Nu se trimite devizul pe WhatsApp sau email, doar se tipărește ori se salvează ca PDF.
- Aplicația funcționează numai cu internet.

## Dacă ceva nu merge

Trimite-mi textul erorii (apare în roșu în aplicație sau sus, lângă „Salvat”) și, dacă poți, ce apare la apăsarea tastei **F12** > **Console**.
