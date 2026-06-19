# CLAUDE.md — Strona salonu: magdalenaborowska.pl

## Cel projektu
Premium strona-wizytówka **salonu stylizacji paznokci Magdaleny Borowskiej** (Zielona Góra) na
domenie `magdalenaborowska.pl`. To **niespodzianka/prezent** dla klientki (popularny salon → darmowa
reklama) ORAZ **instancja #1 reużywalnego szablonu white-label** — projektuj tak, by sekcje i model
treści dało się przenieść na kolejnych klientów (podmiana tokenów brandu + treści).

Język strony: **polski**. Grupa docelowa: klientki rezerwujące głównie z telefonu → **mobile-first**.
Salon liczy **4 stylistki** (sekcja „Zespół").

## Stack (ustalony — nie zmieniaj bez pytania)
- **Astro** (statyczny build) + **Tailwind CSS**.
- **Keystatic** (git-based CMS — treść jako pliki w repo, commit = deploy).
- Hosting: **Cloudflare Pages** (auto-deploy z push na `main`; PR previews).
- Obrazy: **w repo** (`src/assets/images/`) + **`astro:assets`** (AVIF/WebP, responsywny
  `srcset`) — decyzja właściciela z 2026-06-19 (mało zdjęć → wygodny upload drag&drop przez
  Keystatic `fields.image`, zamiast Cloudflare Images/R2). Trzymaj galerię kuratorowaną i
  źródła ~1600 px, by repo nie puchło. Powrót do CDN możliwy (`<Img>` obsługuje też URL).

## Twarde ograniczenia
- **Prywatność do odsłony**: cała strona `noindex` (meta robots) + docelowo za hasłem
  (Cloudflare Access). To niespodzianka — nie może zostać zaindeksowana ani publiczna przed zgodą.
- Treść/zdjęcia pochodzą z publicznej obecności klientki (Instagram, Google Business). Traktuj jako
  prywatny mockup; nie zakładaj zgody na publikację — placeholdery tam, gdzie brak materiału.
- **Brak cennika na stronie** (decyzja). Strona prezentuje zakres usług, ale ceny żyją wyłącznie
  w systemie rezerwacji. CTA „Umów wizytę" prowadzi klientkę po cennik do rezerwacji.
- **CTA „Umów wizytę"** linkuje do `https://rezerwacja.magdalenaborowska.pl` (osobny system
  rezerwacji — poza tym repo). Jeśli subdomena jeszcze nie działa, strona docelowa może być „wkrótce",
  ale link/CTA już ustaw na ten adres.

## Model treści (Keystatic — zaprojektuj jako reużywalny)
- Singletony: `settings/brand` (logo, paleta, fonty, nazwa, godziny, telefon, adres, link do mapy,
  social), `hero`, `about`, `contact`.
- Kolekcje: `services` (nazwa, opis, kategoria — BEZ cen), `team` (imię, rola/specjalizacja,
  zdjęcie — 4 stylistki), `gallery` (zdjęcie, alt, opis), `testimonials` (autor, treść, ocena).
- Brand (kolory/fonty/logo) trzymaj jako **design tokeny** (`tailwind.config` + zmienne CSS), żeby
  per klient wymieniać jedno miejsce.

## Sekcje strony (komponenty zasilane treścią)
One-page scroll + osobna `/rezerwacja` (placeholder/redirect na subdomenę):
`Hero` (zdjęcie + nazwa + CTA) → `About` (o salonie) → `Services` (prezentacja oferty, BEZ cennika —
ceny tylko w rezerwacji) → `Team` (4 stylistki) → `Gallery` (realizacje/nail art) →
`Testimonials` (opinie) → `Contact` (godziny, adres, mapa, telefon) → `Footer` (CTA rezerwacji + social).

## Design
- Branża: **stylizacja paznokci** — nacisk na **detal i fotografię makro** (zdjęcia paznokci/zdobień),
  bogata galeria realizacji (nail art) jako główny dowód jakości.
- Kierunek wizualny / vibe **potwierdź z właścicielem projektu na starcie**
  (elegancki minimal / ciepły butikowy / glamour). Zaproponuj 2–3 warianty palety + pary fontów.
- Premium = dużo światła (whitespace), spójna typografia (display szeryfowy + tekst bezszeryfowy,
  np. Google Fonts / Fontshare), realna fotografia, subtelny ruch (Astro View Transitions +
  lekki scroll-reveal). Bez przeładowania.
- Ikony: Lucide lub Phosphor (`astro-icon`).

## SEO / jakość / pomiar
- **JSON-LD `NailSalon`/`HealthAndBeautyBusiness`** + `LocalBusiness` (lokalne SEO
  „stylizacja paznokci Zielona Góra"). Meta + OG tags.
- `@astrojs/sitemap` (pamiętaj o `noindex` do odsłony), **Lighthouse 95+**.
- Analytics: Cloudflare Web Analytics lub Plausible (lekkie, RODO-friendly).

## Definition of done
- [ ] Mobile-first, responsywne, Lighthouse 95+ (perf/SEO/a11y).
- [ ] Treść edytowalna przez Keystatic; brand jako tokeny.
- [ ] Sekcja `Team` z 4 stylistkami; galeria realizacji jako element pierwszoplanowy.
- [ ] Galeria w repo (`src/assets/images/`) + optymalizacja `astro:assets`; źródła ~1600 px.
- [ ] `noindex` + (docelowo) Cloudflare Access aktywne.
- [ ] CTA rezerwacji linkuje do `rezerwacja.magdalenaborowska.pl`.
- [ ] Sekcje na tyle generyczne, że da się je reużyć dla kolejnego salonu.

## Czego NIE robić
- Nie budować systemu rezerwacji tutaj (osobny projekt).
- Nie commitować zdjęć/danych osobowych klientki bez potwierdzenia zgody.
- Nie publikować/indeksować strony przed odsłoną.
