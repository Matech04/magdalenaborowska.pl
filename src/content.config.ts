import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/*
 * Astro czyta te same pliki JSON, które zapisuje Keystatic
 * (src/content/<kolekcja>/<slug>.json). Schematy mirrorują keystatic.config.ts.
 */

const order = z.number().default(0);

const services = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    category: z.string().default(''),
    description: z.string().default(''),
    icon: z.string().default('sparkles'),
    order,
  }),
});

const trainings = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/trainings' }),
  schema: z.object({
    title: z.string(),
    level: z.string().default(''),
    description: z.string().default(''),
    duration: z.string().optional(),
    image: z.string().nullable().optional(),
    order,
  }),
});

const team = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/team' }),
  schema: z.object({
    name: z.string(),
    role: z.string().default(''),
    bio: z.string().optional(),
    photo: z.string().nullable().optional(),
    order,
  }),
});

const gallery = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/gallery' }),
  schema: z.object({
    alt: z.string(),
    image: z.string().nullable().optional(),
    caption: z.string().optional(),
    order,
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/testimonials' }),
  schema: z.object({
    author: z.string(),
    body: z.string().default(''),
    rating: z.number().min(1).max(5).default(5),
    order,
  }),
});

export const collections = { services, trainings, team, gallery, testimonials };
