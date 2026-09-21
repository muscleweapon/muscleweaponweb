import { z } from 'zod';

export const PRODUCT_CATEGORIES = [
  'Protein',
  'Mass gainer',
  'Multivitamins',
  'Calcium',
  'Omega gold fish oil',
  'Creatine',
  'Pre-workout',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const productFormSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(120),
  slug: z
    .string()
    .min(2)
    .max(140)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  category: z.enum(PRODUCT_CATEGORIES, {
    error: 'Category must be one of the 7 approved categories',
  }),
  price_amount: z.number().int().nonnegative('Price must be a non-negative integer').optional().nullable(),
  priceAmount: z.number().int().nonnegative('Price must be a non-negative integer').optional().nullable(),
  price_currency: z.string().default('INR'),
  priceCurrency: z.string().optional(),
  mrp: z.number().int().nonnegative('MRP must be a non-negative integer').optional().nullable(),
  description: z.string().max(5000).optional().default(''),
  flavor: z.string().max(100).optional().nullable(),
  short_description: z.string().max(300).optional().nullable(),
  ingredients: z.string().max(2000).optional().nullable(),
  usage_instructions: z.string().max(2000).optional().nullable(),
  specifications: z.record(z.string(), z.any()).optional().default({}),
  nutrition_facts: z.record(z.string(), z.any()).optional().default({}),
  is_in_stock: z.boolean().default(true),
  isInStock: z.boolean().optional(),
  is_visible: z.boolean().default(false),
  isVisible: z.boolean().optional(),
  show_on_hero: z.boolean().optional().default(false),
  showOnHero: z.boolean().optional(),
  is_featured: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional(),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;

// Alias for backwards compatibility
export const productSchema = productFormSchema;
export type ProductInput = ProductFormInput;
