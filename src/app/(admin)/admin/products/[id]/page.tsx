import React from 'react';
import { notFound } from 'next/navigation';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { ProductForm } from '@/components/admin/ProductForm';
import type { Database } from '@/lib/supabase/types';

type ProductWithImages = Database['public']['Tables']['products']['Row'] & {
  product_images?: Database['public']['Tables']['product_images']['Row'][];
  flavor?: string;
  is_in_stock?: boolean;
};

export const dynamic = 'force-dynamic';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminUser();
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const { data: rawProduct } = await supabase
    .from('products')
    .select(`
      *,
      product_images (
        id,
        cloudinary_public_id,
        secure_url,
        width,
        height,
        format,
        alt_text,
        sort_order
      )
    `)
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  const product = rawProduct as unknown as ProductWithImages | null;

  if (!product) {
    notFound();
  }

  const specs = (typeof product.specifications === 'object' && product.specifications !== null
    ? product.specifications
    : {}) as Record<string, unknown>;

  const initialData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    price_amount: product.price_amount,
    mrp: (specs.mrp as number) || null,
    flavor: product.flavor || (specs.flavor as string) || null,
    short_description: (specs.short_description as string) || null,
    description: product.description || '',
    ingredients: (specs.ingredients as string) || null,
    usage_instructions: (specs.usage_instructions as string) || null,
    is_in_stock: product.is_in_stock ?? (specs.is_in_stock as boolean) ?? true,
    is_visible: product.is_visible,
    specifications: specs,
    nutrition_facts: (typeof product.nutrition_facts === 'object' && product.nutrition_facts !== null ? product.nutrition_facts : {}) as Record<string, unknown>,
    images: (product.product_images || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({
        id: img.id,
        cloudinary_public_id: img.cloudinary_public_id,
        secure_url: img.secure_url,
        width: img.width || undefined,
        height: img.height || undefined,
        format: img.format || undefined,
        alt_text: img.alt_text || undefined,
        sort_order: img.sort_order,
      })),
  };

  return <ProductForm initialData={initialData} isEdit={true} />;
}
