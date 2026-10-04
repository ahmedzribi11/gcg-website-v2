import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { glob } from 'astro/loaders'

/** Identifiants partagés avec l’interface et l’espace de gestion (public/admin/config.yml). */
export const SECTORS = ['residentiel', 'hotellerie', 'equipements', 'industrie'] as const
export const STATUSES = ['execution', 'etudes', 'receptionne'] as const
export const CITIES = [
  'abidjan',
  'grand-bassam',
  'assinie',
  'assouinde',
  'korhogo',
  'attingue',
  'anyama',
  'bingerville',
  'songon',
  'dabou',
  'jacqueville',
  'bonoua',
  'aboisso',
  'yamoussoukro',
  'bouake',
  'daloa',
  'man',
  'san-pedro',
  'abengourou',
] as const
export const SERVICES = ['etudes', 'architecture', 'ingenierie', 'construction', 'amenagement', 'rehabilitation', 'infrastructures', 'cle-en-main'] as const
export const TYPES = ['villas', 'residences', 'immeubles', 'hotels', 'loisirs', 'industrie', 'equipements', 'infrastructures'] as const
/** Nature d’une image : photographie réelle, perspective 3D (rendu) ou plan. */
export const IMAGE_KINDS = ['photo', 'render', 'plan'] as const
/** Autorisation de publication par le client final (MEDIA-03). « en-attente » = non publié en mode lancement. */
export const PERMISSIONS = ['obtenue', 'non-requise', 'en-attente'] as const
/** Version anglaise : publiée seulement une fois relue (CMS-10). */
export const EN_STATUSES = ['valide', 'a-traduire'] as const

/** L’espace de gestion enregistre un champ facultatif vidé en "" ou null : on le traite comme absent. */
const blank = (v: unknown) => (v === '' || v === null ? undefined : v)
const opt = <T extends z.ZodType>(schema: T) => z.preprocess(blank, schema.optional())

/**
 * Projets du portfolio GCG — un fichier JSON par projet dans src/content/projects.
 * Règle éditoriale : ne renseigner que les informations attestées par GCG.
 * Un champ absent n’est pas affiché.
 */
const projects = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/projects' }),
  schema: ({ image }) =>
    z
      .object({
        number: z.number().int().positive(),
        name: z.string(),
        name_en: opt(z.string()),
        featured: z.preprocess(blank, z.boolean().default(false)),
        featuredOrder: opt(z.number()),
        sector: z.enum(SECTORS),
        city: z.enum(CITIES),
        location: z.string(),
        location_en: opt(z.string()),
        period: z.string(),
        period_en: opt(z.string()),
        status: opt(z.enum(STATUSES)),
        surface: opt(z.string()),
        terrain: opt(z.string()),
        coveredSurface: opt(z.string()),
        composition: z.string().max(300, 'Résumé : 300 caractères maximum'),
        composition_en: opt(z.string().max(300, 'Résumé anglais : 300 caractères maximum')),
        typologies: opt(z.array(z.object({ name: z.string(), surface: z.string() }))),
        typology: opt(z.string()),
        typology_en: opt(z.string()),
        missions: z.array(z.string()).min(1),
        missions_en: opt(z.array(z.string()).min(1)),
        services: z.preprocess(blank, z.array(z.enum(SERVICES)).default([])),
        types: z.preprocess(blank, z.array(z.enum(TYPES)).default([])),
        images: z
          .array(
            z.object({
              src: image(),
              alt: z.string().min(5, 'Texte alternatif français manquant').max(140),
              alt_en: z.string().min(5, 'Texte alternatif anglais manquant').max(140),
              kind: z.preprocess(blank, z.enum(IMAGE_KINDS).default('photo')),
              focus: opt(z.string().regex(/^\d{1,3}% \d{1,3}%$/, 'Point focal : format « 50% 30% »')),
            }),
          )
          .min(1, 'Au moins une photo'),
        permission: z.preprocess(blank, z.enum(PERMISSIONS).default('en-attente')),
        en_status: z.preprocess(blank, z.enum(EN_STATUSES).default('valide')),
        seo_title: opt(z.string().max(70)),
        seo_title_en: opt(z.string().max(70)),
        seo_description: opt(z.string().max(170)),
        seo_description_en: opt(z.string().max(170)),
      })
      .superRefine((d, ctx) => {
        // La version anglaise validée doit être complète
        if (d.en_status === 'valide') {
          if (!d.composition_en)
            ctx.addIssue({ code: 'custom', path: ['composition_en'], message: 'Résumé anglais requis (ou version anglaise « à traduire »)' })
          if (!d.missions_en?.length)
            ctx.addIssue({ code: 'custom', path: ['missions_en'], message: 'Missions en anglais requises (ou version anglaise « à traduire »)' })
        }
      }),
})

export const collections = { projects }
