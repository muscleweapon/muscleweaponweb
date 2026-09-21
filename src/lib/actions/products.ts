'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { productFormSchema, type ProductFormInput } from '@/lib/validations/product';
import type { UploadedProductImage } from '@/components/admin/ProductImageUploader';

export async function createProductAction(data: ProductFormInput & { images?: UploadedProductImage[] }) {
  try {
    const admin = await requireAdminUser();
    const validated = productFormSchema.parse(data);

    const supabase = createAdminClient();

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', validated.slug)
      .maybeSingle();

    if (existing) {
      return { success: false, error: `A product with slug "${validated.slug}" already exists.` };
    }

    // Structure specifications JSONB
    const specificationsPayload = {
      flavor: validated.flavor || null,
      short_description: validated.short_description || null,
      ingredients: validated.ingredients || null,
      usage_instructions: validated.usage_instructions || null,
      is_in_stock: validated.is_in_stock,
      mrp: validated.mrp || null,
      show_on_hero: validated.show_on_hero ?? validated.showOnHero ?? validated.is_featured ?? validated.isFeatured ?? false,
      ...validated.specifications,
    };

    // 1. Insert product
    const { data: newProduct, error: insertError } = await supabase
      .from('products')
      .insert({
        name: validated.name,
        slug: validated.slug,
        category: validated.category,
        price_amount: validated.price_amount,
        price_currency: validated.price_currency || 'INR',
        description: validated.description || null,
        specifications: specificationsPayload,
        nutrition_facts: validated.nutrition_facts || {},
        is_visible: validated.is_visible,
        is_deleted: false,
        created_by: admin.userId,
        updated_by: admin.userId,
      })
      .select('id, slug')
      .single();

    if (insertError || !newProduct) {
      console.error('[Create Product Error]:', insertError);
      return { success: false, error: insertError?.message || 'Failed to create product in database.' };
    }

    // 2. Insert product images if supplied
    if (data.images && data.images.length > 0) {
      const imageRecords = data.images.map((img, idx) => ({
        product_id: newProduct.id,
        cloudinary_public_id: img.cloudinary_public_id,
        secure_url: img.secure_url,
        width: img.width || null,
        height: img.height || null,
        format: img.format || null,
        alt_text: img.alt_text || validated.name,
        sort_order: idx,
      }));

      const { error: imgError } = await supabase.from('product_images').insert(imageRecords);
      if (imgError) {
        console.error('[Create Product Images Error]:', imgError);
      }
    }

    // 3. Log audit event
    await supabase.from('admin_audit_log').insert({
      actor_id: admin.userId,
      action: 'product.created',
      entity_type: 'product',
      entity_id: newProduct.id,
      after_state: { name: validated.name, slug: validated.slug, category: validated.category },
    });

    // 4. Revalidate public and admin paths
    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath(`/products/${newProduct.slug}`);
    revalidatePath('/admin/products');
    revalidatePath('/admin');

    return { success: true, productId: newProduct.id, slug: newProduct.slug };
  } catch (err: unknown) {
    console.error('[Create Product Exception]:', err);
    const message = err instanceof Error ? err.message : 'Internal server error while creating product.';
    return { success: false, error: message };
  }
}

export async function updateProductAction(
  id: string,
  data: ProductFormInput & { images?: UploadedProductImage[] }
) {
  try {
    const admin = await requireAdminUser();
    const validated = productFormSchema.parse(data);

    const supabase = createAdminClient();

    // Check slug uniqueness across other products
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', validated.slug)
      .neq('id', id)
      .maybeSingle();

    if (existing) {
      return { success: false, error: `Another product with slug "${validated.slug}" already exists.` };
    }

    const specificationsPayload = {
      flavor: validated.flavor || null,
      short_description: validated.short_description || null,
      ingredients: validated.ingredients || null,
      usage_instructions: validated.usage_instructions || null,
      is_in_stock: validated.is_in_stock,
      mrp: validated.mrp || null,
      show_on_hero: validated.show_on_hero ?? validated.showOnHero ?? validated.is_featured ?? validated.isFeatured ?? false,
      ...validated.specifications,
    };

    // 1. Update product
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({
        name: validated.name,
        slug: validated.slug,
        category: validated.category,
        price_amount: validated.price_amount,
        price_currency: validated.price_currency || 'INR',
        description: validated.description || null,
        specifications: specificationsPayload,
        nutrition_facts: validated.nutrition_facts || {},
        is_visible: validated.is_visible,
        updated_by: admin.userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id, slug')
      .single();

    if (updateError || !updatedProduct) {
      console.error('[Update Product Error]:', updateError);
      return { success: false, error: updateError?.message || 'Failed to update product in database.' };
    }

    // 2. Sync product images: Delete existing and re-insert new
    if (data.images) {
      await supabase.from('product_images').delete().eq('product_id', id);

      if (data.images.length > 0) {
        const imageRecords = data.images.map((img, idx) => ({
          product_id: id,
          cloudinary_public_id: img.cloudinary_public_id,
          secure_url: img.secure_url,
          width: img.width || null,
          height: img.height || null,
          format: img.format || null,
          alt_text: img.alt_text || validated.name,
          sort_order: idx,
        }));

        await supabase.from('product_images').insert(imageRecords);
      }
    }

    // 3. Log audit event
    await supabase.from('admin_audit_log').insert({
      actor_id: admin.userId,
      action: 'product.updated',
      entity_type: 'product',
      entity_id: id,
      after_state: { name: validated.name, slug: validated.slug, is_visible: validated.is_visible },
    });

    // 4. Revalidate paths
    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath(`/products/${updatedProduct.slug}`);
    revalidatePath('/admin/products');
    revalidatePath('/admin');

    return { success: true, slug: updatedProduct.slug };
  } catch (err: unknown) {
    console.error('[Update Product Exception]:', err);
    const message = err instanceof Error ? err.message : 'Internal server error while updating product.';
    return { success: false, error: message };
  }
}

export async function toggleProductVisibilityAction(id: string, isVisible: boolean) {
  try {
    const admin = await requireAdminUser();
    const supabase = createAdminClient();

    const { data: updated, error } = await supabase
      .from('products')
      .update({
        is_visible: isVisible,
        updated_by: admin.userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id, slug, is_visible')
      .single();

    if (error || !updated) {
      return { success: false, error: error?.message || 'Failed to toggle visibility.' };
    }

    await supabase.from('admin_audit_log').insert({
      actor_id: admin.userId,
      action: isVisible ? 'product.published' : 'product.hidden',
      entity_type: 'product',
      entity_id: id,
      after_state: { is_visible: isVisible },
    });

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath(`/products/${updated.slug}`);
    revalidatePath('/admin/products');
    revalidatePath('/admin');

    return { success: true, isVisible: updated.is_visible };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unauthorized or server error.';
    return { success: false, error: message };
  }
}

export async function deleteProductAction(id: string) {
  try {
    const admin = await requireAdminUser();
    const supabase = createAdminClient();

    // Soft delete per PRD Section 7.1 Rule 9
    const { data: archived, error } = await supabase
      .from('products')
      .update({
        is_deleted: true,
        is_visible: false,
        updated_by: admin.userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id, slug')
      .single();

    if (error || !archived) {
      return { success: false, error: error?.message || 'Failed to delete product.' };
    }

    await supabase.from('admin_audit_log').insert({
      actor_id: admin.userId,
      action: 'product.archived',
      entity_type: 'product',
      entity_id: id,
      after_state: { is_deleted: true, is_visible: false },
    });

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath(`/products/${archived.slug}`);
    revalidatePath('/admin/products');
    revalidatePath('/admin');

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unauthorized or server error.';
    return { success: false, error: message };
  }
}
