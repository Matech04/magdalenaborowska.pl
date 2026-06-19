import { config, fields, collection, singleton } from '@keystatic/core';

/*
 * ============================================================
 *  Keystatic — git-based CMS (treść = pliki w repo, commit = deploy)
 *
 *  Model treści zaprojektowany jako REUŻYWALNY szablon white-label:
 *  - singletony: brand, hero, about, contact  (per-instancja)
 *  - kolekcje:   services, team, gallery, testimonials, trainings
 *
 *  Storage: 'local' do pracy lokalnej. Na produkcji (Cloudflare Pages)
 *  przełącz na { kind: 'github', repo: 'owner/magdalenaborowska.pl' }.
 *
 *  Zdjęcia galerii: NIE trzymamy w gicie — pole to URL do Cloudflare
 *  Images / R2 (zgodnie z CLAUDE.md).
 * ============================================================
 */

// Zdjęcia trzymamy w repo (git) i optymalizujemy przez astro:assets przy buildzie.
// Pliki lądują w src/assets/images/<dir>/, a w treści zapisywana jest ścieżka.
const imageField = (label: string, dir: string, hint: string) =>
  fields.image({
    label,
    description: `${hint}. Wrzuć plik (drag & drop). Zalecane ~1600 px — zostanie zoptymalizowany (AVIF/WebP) przy buildzie.`,
    directory: `src/assets/images/${dir}`,
    publicPath: `/src/assets/images/${dir}/`,
  });

// Local podczas dev, GitHub na produkcji (commit = deploy przez Cloudflare Pages).
// Ustaw owner repozytorium poniżej po utworzeniu repo na GitHubie.
const GITHUB_REPO = 'Matech04/magdalenaborowska.pl';

export default config({
  storage:
    process.env.NODE_ENV === 'development'
      ? { kind: 'local' }
      : { kind: 'github', repo: GITHUB_REPO },
  ui: {
    brand: { name: 'Magdalena Borowska' },
    navigation: {
      Marka: ['brand', 'hero', 'about', 'contact'],
      Oferta: ['services', 'trainings'],
      'Dowód jakości': ['gallery', 'team', 'testimonials'],
    },
  },

  singletons: {
    // ---- Ustawienia marki (tokeny do podmiany per klient) ----
    brand: singleton({
      label: 'Marka i ustawienia',
      path: 'src/content/settings/brand',
      format: { data: 'json' },
      schema: {
        name: fields.text({ label: 'Nazwa', defaultValue: 'Magdalena Borowska' }),
        tagline: fields.text({
          label: 'Tagline',
          defaultValue: 'stylizacja paznokci & szkolenia',
        }),
        city: fields.text({ label: 'Miasto', defaultValue: 'Zielona Góra' }),
        logo: imageField('Logo', 'brand', 'Logotyp marki'),
        phone: fields.text({ label: 'Telefon', validation: { isRequired: false } }),
        email: fields.text({ label: 'E-mail', validation: { isRequired: false } }),
        address: fields.text({ label: 'Adres', multiline: true, validation: { isRequired: false } }),
        mapUrl: fields.url({ label: 'Link do mapy (wizytówka Google)', validation: { isRequired: false } }),
        geo: fields.text({
          label: 'Współrzędne mapy (lat, lng)',
          description: 'Z Google Maps: prawy klik na pinezkę → kliknij współrzędne. Format: 51.938, 15.503',
          validation: { isRequired: false },
        }),
        bookingUrl: fields.url({
          label: 'Link rezerwacji (CTA „Umów wizytę")',
          description: 'Osobny system rezerwacji',
        }),
        hours: fields.array(
          fields.object({
            day: fields.text({ label: 'Dzień / zakres' }),
            value: fields.text({ label: 'Godziny' }),
          }),
          { label: 'Godziny otwarcia', itemLabel: (p) => `${p.fields.day.value}: ${p.fields.value.value}` },
        ),
        social: fields.array(
          fields.object({
            label: fields.text({ label: 'Nazwa (np. Instagram)' }),
            url: fields.url({ label: 'URL' }),
          }),
          { label: 'Social media', itemLabel: (p) => p.fields.label.value },
        ),
      },
    }),

    hero: singleton({
      label: 'Hero',
      path: 'src/content/settings/hero',
      format: { data: 'json' },
      schema: {
        eyebrow: fields.text({ label: 'Nadtytuł (eyebrow)' }),
        heading: fields.text({ label: 'Nagłówek', multiline: true }),
        subheading: fields.text({ label: 'Podtytuł', multiline: true }),
        ctaLabel: fields.text({ label: 'Tekst CTA', defaultValue: 'Umów wizytę' }),
        image: imageField('Zdjęcie hero', 'hero', 'Główne zdjęcie (najlepiej B&W portret)'),
      },
    }),

    about: singleton({
      label: 'O salonie',
      path: 'src/content/settings/about',
      format: { data: 'json' },
      schema: {
        eyebrow: fields.text({ label: 'Nadtytuł', defaultValue: 'O mnie' }),
        heading: fields.text({ label: 'Nagłówek' }),
        body: fields.text({ label: 'Treść', multiline: true }),
        image: imageField('Zdjęcie', 'about', 'Portret / wnętrze salonu'),
        stats: fields.array(
          fields.object({
            value: fields.text({ label: 'Wartość (np. 4)' }),
            label: fields.text({ label: 'Opis (np. stylistki)' }),
          }),
          { label: 'Liczby', itemLabel: (p) => `${p.fields.value.value} ${p.fields.label.value}` },
        ),
      },
    }),

    contact: singleton({
      label: 'Kontakt',
      path: 'src/content/settings/contact',
      format: { data: 'json' },
      schema: {
        eyebrow: fields.text({ label: 'Nadtytuł', defaultValue: 'Kontakt' }),
        heading: fields.text({ label: 'Nagłówek' }),
        note: fields.text({ label: 'Notka', multiline: true }),
      },
    }),
  },

  collections: {
    // ---- Usługi (BEZ cen — ceny tylko w systemie rezerwacji) ----
    services: collection({
      label: 'Usługi',
      path: 'src/content/services/*',
      slugField: 'title',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Nazwa usługi' } }),
        category: fields.text({ label: 'Kategoria' }),
        description: fields.text({ label: 'Opis', multiline: true }),
        icon: fields.text({ label: 'Ikona (lucide, np. „sparkles")', defaultValue: 'sparkles' }),
        order: fields.integer({ label: 'Kolejność', defaultValue: 0 }),
      },
    }),

    // ---- Szkolenia (osobny filar oferty) ----
    trainings: collection({
      label: 'Szkolenia',
      path: 'src/content/trainings/*',
      slugField: 'title',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Nazwa szkolenia' } }),
        level: fields.text({ label: 'Poziom (np. podstawowy)' }),
        description: fields.text({ label: 'Opis', multiline: true }),
        duration: fields.text({ label: 'Czas trwania', validation: { isRequired: false } }),
        image: imageField('Zdjęcie', 'trainings', 'Zdjęcie szkolenia'),
        order: fields.integer({ label: 'Kolejność', defaultValue: 0 }),
      },
    }),

    // ---- Zespół (4 stylistki) ----
    team: collection({
      label: 'Zespół',
      path: 'src/content/team/*',
      slugField: 'name',
      format: { data: 'json' },
      schema: {
        name: fields.slug({ name: { label: 'Imię' } }),
        role: fields.text({ label: 'Rola / specjalizacja' }),
        bio: fields.text({ label: 'Krótki opis', multiline: true, validation: { isRequired: false } }),
        photo: imageField('Zdjęcie', 'team', 'Portret stylistki'),
        order: fields.integer({ label: 'Kolejność', defaultValue: 0 }),
      },
    }),

    // ---- Galeria realizacji (zdjęcia przez Cloudflare Images/R2) ----
    gallery: collection({
      label: 'Galeria',
      path: 'src/content/gallery/*',
      slugField: 'alt',
      format: { data: 'json' },
      schema: {
        alt: fields.slug({ name: { label: 'Opis alternatywny (alt)' } }),
        image: imageField('Zdjęcie', 'gallery', 'Realizacja / nail art'),
        caption: fields.text({ label: 'Podpis', validation: { isRequired: false } }),
        order: fields.integer({ label: 'Kolejność', defaultValue: 0 }),
      },
    }),

    // ---- Opinie ----
    testimonials: collection({
      label: 'Opinie',
      path: 'src/content/testimonials/*',
      slugField: 'author',
      format: { data: 'json' },
      schema: {
        author: fields.slug({ name: { label: 'Autor(ka)' } }),
        body: fields.text({ label: 'Treść opinii', multiline: true }),
        rating: fields.integer({ label: 'Ocena (1–5)', defaultValue: 5 }),
        order: fields.integer({ label: 'Kolejność', defaultValue: 0 }),
      },
    }),
  },
});
