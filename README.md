# magdalenaborowska.pl

Premium strona-wizytówka salonu **stylizacji paznokci i szkoleń** Magdaleny Borowskiej (Zielona Góra).
Instancja #1 reużywalnego szablonu white-label.

> ⚠️ **Prywatność do odsłony.** Cała strona jest `noindex` + `robots: Disallow: /`.
> Nie publikuj/indeksuj przed zgodą klientki. Zdjęcia z publicznych profili traktuj jako prywatny mockup.

## Stack

- **Astro 5** (statyczny build) + **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Keystatic** (git-based CMS — treść = pliki JSON w `src/content/`)
- **Cloudflare Pages** (hosting, auto-deploy z `main`) + adapter `@astrojs/cloudflare`
- Fonty self-hosted (`@fontsource`) — RODO-friendly, bez Google CDN
- Ikony: `astro-icon` + Lucide

## Uruchomienie

```bash
npm install
npm run dev        # strona: http://localhost:4321
                   # CMS:    http://localhost:4321/keystatic
npm run build      # build produkcyjny do ./dist
npm run preview
```

## Model treści (Keystatic)

Edytuj w `/keystatic` lub bezpośrednio pliki:

- **Singletony** (`src/content/settings/`): `brand`, `hero`, `about`, `contact`
- **Kolekcje** (`src/content/<kolekcja>/`): `services`, `trainings`, `team`, `gallery`, `testimonials`

`keystatic.config.ts` używa `storage: 'local'`. Na produkcji przełącz na:

```ts
storage: { kind: 'github', repo: 'owner/magdalenaborowska.pl' }
```

## Brand jako tokeny

Cały wygląd (kolory, fonty, radius) żyje w **jednym miejscu**: bloku `@theme`
w `src/styles/global.css`. Podmiana brandu per klient = edycja tych tokenów
(+ treści w Keystatic). Aktualny wariant: **„Jasny edytorial + złoto"**.

## Zdjęcia — w repo + astro:assets

Zdjęcia trzymamy **w repozytorium** (`src/assets/images/<sekcja>/`) i optymalizujemy
**przy buildzie** przez `astro:assets`. Brak zewnętrznego CDN/konta.

**Dodawanie zdjęcia (klientka, w CMS):**
1. W `/keystatic` przeciągnij plik w pole zdjęcia (hero / o-mnie / zespół / galeria).
2. Keystatic zapisuje plik w `src/assets/images/<sekcja>/` i commituje go do repo.
3. Komponent [`src/components/Img.astro`](src/components/Img.astro) (`import.meta.glob` →
   `<Image>` z `astro:assets`) generuje **AVIF/WebP + responsywny `srcset`** automatycznie.

**Dyscyplina (ważne):** Keystatic commituje plik w oryginalnej rozdzielczości i git trzyma
całą historię. Trzymaj **galerię kuratorowaną** i wrzucaj źródła **~1600 px**, żeby repo
(i czas buildów Cloudflare) nie puchło. `<Img>` obsługuje też pełny URL (`http(s)://`) —
gdyby kiedyś wrócić do zewnętrznego CDN, komponenty nie wymagają przepisywania.

## CTA / rezerwacja

„Umów wizytę" → `https://rezerwacja.magdalenaborowska.pl` (osobny system, poza tym repo).
`/rezerwacja` to pomost z przekierowaniem na tę subdomenę.

## Do odsłony (checklista)

- [ ] Podmienić placeholdery treści i zdjęcia (za zgodą klientki).
- [ ] Cloudflare Access (hasło) na całą stronę.
- [ ] Po odsłonie: poluzować `noindex` (Layout) i `robots.txt`.
- [ ] Keystatic → tryb `github`.
- [ ] Lighthouse 95+ (perf/SEO/a11y).
