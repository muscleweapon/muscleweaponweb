'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MWButton,
  MWInput,
  MWSelect,
  MWFormError,
  MWToast,
} from '@/components/primitives';
import { ProductImageUploader, type UploadedProductImage } from './ProductImageUploader';
import { PRODUCT_CATEGORIES, type ProductCategory } from '@/lib/validations/product';
import { createProductAction, updateProductAction } from '@/lib/actions/products';
import { ArrowLeft, Save } from 'lucide-react';

interface ProductFormProps {
  initialData?: {
    id?: string;
    name?: string;
    slug?: string;
    category?: ProductCategory;
    price_amount?: number | null;
    mrp?: number | null;
    flavor?: string | null;
    short_description?: string | null;
    description?: string | null;
    ingredients?: string | null;
    usage_instructions?: string | null;
    is_in_stock?: boolean;
    is_visible?: boolean;
    specifications?: Record<string, unknown>;
    nutrition_facts?: Record<string, unknown>;
    images?: UploadedProductImage[];
  };
  isEdit?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, isEdit = false }) => {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [category, setCategory] = useState<ProductCategory>(
    initialData?.category || PRODUCT_CATEGORIES[0]
  );
  const [priceAmount, setPriceAmount] = useState<string>(
    initialData?.price_amount !== undefined && initialData?.price_amount !== null
      ? String(initialData.price_amount)
      : ''
  );
  const [mrp, setMrp] = useState<string>(
    initialData?.mrp !== undefined && initialData?.mrp !== null ? String(initialData.mrp) : ''
  );
  const [flavor, setFlavor] = useState(initialData?.flavor || '');
  const [shortDescription, setShortDescription] = useState(initialData?.short_description || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [ingredients, setIngredients] = useState(initialData?.ingredients || '');
  const [usageInstructions, setUsageInstructions] = useState(
    initialData?.usage_instructions || ''
  );
  const [isInStock, setIsInStock] = useState(initialData?.is_in_stock ?? true);
  const [isVisible, setIsVisible] = useState(initialData?.is_visible ?? true);
  const [showOnHero, setShowOnHero] = useState<boolean>(
    Boolean(initialData?.specifications?.show_on_hero)
  );

  // Nutrition / Spec quick fields
  const [proteinPerServing, setProteinPerServing] = useState<string>(
    String(initialData?.specifications?.protein_per_serving || '24g')
  );
  const [bcaaPerServing, setBcaaPerServing] = useState<string>(
    String(initialData?.specifications?.bcaa_per_serving || '5.5g')
  );
  const [servings, setServings] = useState<string>(
    String(initialData?.specifications?.servings || '30')
  );

  const [images, setImages] = useState<UploadedProductImage[]>(initialData?.images || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-slugify when creating new product
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!slug.trim()) {
      setError('Product slug is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        category,
        price_amount: priceAmount ? parseInt(priceAmount, 10) : null,
        price_currency: 'INR',
        mrp: mrp ? parseInt(mrp, 10) : null,
        flavor: flavor.trim() || null,
        short_description: shortDescription.trim() || null,
        description: description.trim() || '',
        ingredients: ingredients.trim() || null,
        usage_instructions: usageInstructions.trim() || null,
        is_in_stock: isInStock,
        is_visible: isVisible,
        show_on_hero: showOnHero,
        is_featured: showOnHero,
        specifications: {
          protein_per_serving: proteinPerServing,
          bcaa_per_serving: bcaaPerServing,
          servings: servings,
          show_on_hero: showOnHero,
        },
        nutrition_facts: {
          protein: proteinPerServing,
          bcaa: bcaaPerServing,
          servings: servings,
        },
        images,
      };

      if (isEdit && initialData?.id) {
        const res = await updateProductAction(initialData.id, payload);
        if (!res.success) {
          throw new Error(res.error || 'Failed to update product.');
        }
        setToastMessage('Product updated successfully!');
      } else {
        const res = await createProductAction(payload);
        if (!res.success) {
          throw new Error(res.error || 'Failed to create product.');
        }
        setToastMessage('Product created successfully!');
      }

      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 700);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while saving the product.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-4xl" noValidate>
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-[10px] border border-[#DDE5EF] text-[#667085] hover:text-[#0B1220] hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-xl font-black text-[#0B1220] uppercase tracking-tight">
              {isEdit ? `Edit: ${name || 'Product'}` : 'Create New Product'}
            </h2>
            <p className="text-xs text-[#667085]">
              Configure supplement identity, pricing, nutrition facts, and Cloudinary media.
            </p>
          </div>
        </div>

        <MWButton
          type="submit"
          size="sm"
          isLoading={isSubmitting}
          leftIcon={<Save className="w-4 h-4" />}
        >
          {isEdit ? 'Save Changes' : 'Publish Product'}
        </MWButton>
      </div>

      {error && <MWFormError message={error} />}

      {/* Section 1: Basic Identity */}
      <div className="bg-white rounded-[20px] border border-[#DDE5EF] p-6 sm:p-8 shadow-xs flex flex-col gap-5">
        <h3 className="text-sm font-black uppercase text-[#0B1220] tracking-wider border-b border-[#DDE5EF] pb-3">
          1. Identity & Classification
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MWInput
            label="Product Name"
            placeholder="e.g. 100% Pure Whey Protein"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
          />

          <MWInput
            label="URL Slug"
            placeholder="e.g. 100-pure-whey-protein"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            helperText="Lowercase alphanumeric with hyphens. Used in public URL."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MWSelect
            label="Supplement Category"
            options={PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }))}
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategory)}
          />

          <MWInput
            label="Flavor / Variant (Optional)"
            placeholder="e.g. Belgian Chocolate / Kulfi"
            value={flavor}
            onChange={(e) => setFlavor(e.target.value)}
          />
        </div>
      </div>

      {/* Section 2: Pricing & Stock */}
      <div className="bg-white rounded-[20px] border border-[#DDE5EF] p-6 sm:p-8 shadow-xs flex flex-col gap-5">
        <h3 className="text-sm font-black uppercase text-[#0B1220] tracking-wider border-b border-[#DDE5EF] pb-3">
          2. Pricing & Availability
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MWInput
            label="Selling Price (₹ INR)"
            type="number"
            placeholder="e.g. 3499"
            value={priceAmount}
            onChange={(e) => setPriceAmount(e.target.value)}
            helperText="Actual customer selling price in Indian Rupees."
          />

          <MWInput
            label="MRP (₹ INR Optional)"
            type="number"
            placeholder="e.g. 4599"
            value={mrp}
            onChange={(e) => setMrp(e.target.value)}
            helperText="Maximum Retail Price shown as strikethrough."
          />
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-2">
          <label className="flex items-center gap-2.5 text-xs text-[#0B1220] cursor-pointer font-bold select-none">
            <input
              type="checkbox"
              checked={isInStock}
              onChange={(e) => setIsInStock(e.target.checked)}
              className="rounded border-[#DDE5EF] text-[#1677FF] focus:ring-[#1677FF]"
            />
            <span>Currently In Stock</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs text-[#0B1220] cursor-pointer font-bold select-none">
            <input
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              className="rounded border-[#DDE5EF] text-[#1677FF] focus:ring-[#1677FF]"
            />
            <span className="text-[#1677FF]">Visible on Public Website</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs text-[#0B1220] cursor-pointer font-bold select-none bg-[#EAF4FF] px-3.5 py-1.5 rounded-full border border-[#BEDAFF] hover:bg-[#D5E8FF] transition-colors">
            <input
              type="checkbox"
              checked={showOnHero}
              onChange={(e) => setShowOnHero(e.target.checked)}
              className="rounded border-[#BEDAFF] text-[#1677FF] focus:ring-[#1677FF]"
            />
            <span className="text-[#0757C8] font-black uppercase tracking-wider text-[11px]">
              ★ Show On Hero Slider
            </span>
          </label>
        </div>
      </div>

      {/* Section 3: Product Media (Cloudinary) */}
      <div className="bg-white rounded-[20px] border border-[#DDE5EF] p-6 sm:p-8 shadow-xs flex flex-col gap-5">
        <h3 className="text-sm font-black uppercase text-[#0B1220] tracking-wider border-b border-[#DDE5EF] pb-3">
          3. Product Media (Cloudinary)
        </h3>

        <ProductImageUploader images={images} onChange={setImages} />
      </div>

      {/* Section 4: Specifications & Nutrition */}
      <div className="bg-white rounded-[20px] border border-[#DDE5EF] p-6 sm:p-8 shadow-xs flex flex-col gap-5">
        <h3 className="text-sm font-black uppercase text-[#0B1220] tracking-wider border-b border-[#DDE5EF] pb-3">
          4. Technical Nutrition & Specifications
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MWInput
            label="Protein Per Serving"
            placeholder="e.g. 24g"
            value={proteinPerServing}
            onChange={(e) => setProteinPerServing(e.target.value)}
          />

          <MWInput
            label="BCAA Per Serving"
            placeholder="e.g. 5.5g"
            value={bcaaPerServing}
            onChange={(e) => setBcaaPerServing(e.target.value)}
          />

          <MWInput
            label="Servings Per Tub"
            placeholder="e.g. 30"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase text-[#0B1220] tracking-wider">
            Short Description
          </label>
          <input
            type="text"
            placeholder="1-2 punchy sentences summarizing the formulation"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="w-full bg-[#F5F8FC] text-xs text-[#0B1220] rounded-[10px] px-3.5 py-2.5 border border-[#DDE5EF] focus:outline-none focus:border-[#1677FF]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase text-[#0B1220] tracking-wider">
            Full Description
          </label>
          <textarea
            rows={4}
            placeholder="Detailed supplement description, benefits, and lab certification information"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#F5F8FC] text-xs text-[#0B1220] rounded-[10px] p-3.5 border border-[#DDE5EF] focus:outline-none focus:border-[#1677FF]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase text-[#0B1220] tracking-wider">
              Ingredients
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Whey Protein Isolate, Cocoa Powder, Sunflower Lecithin..."
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="w-full bg-[#F5F8FC] text-xs text-[#0B1220] rounded-[10px] p-3.5 border border-[#DDE5EF] focus:outline-none focus:border-[#1677FF]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase text-[#0B1220] tracking-wider">
              How to Use / Directions
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Mix 1 scoop (33g) in 200ml cold water or milk post-workout..."
              value={usageInstructions}
              onChange={(e) => setUsageInstructions(e.target.value)}
              className="w-full bg-[#F5F8FC] text-xs text-[#0B1220] rounded-[10px] p-3.5 border border-[#DDE5EF] focus:outline-none focus:border-[#1677FF]"
            />
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DDE5EF]">
        <Link href="/admin/products">
          <MWButton type="button" variant="outline" size="md">
            Cancel
          </MWButton>
        </Link>
        <MWButton
          type="submit"
          size="md"
          isLoading={isSubmitting}
          leftIcon={<Save className="w-4 h-4" />}
        >
          {isEdit ? 'Save Changes' : 'Publish Product'}
        </MWButton>
      </div>

      {toastMessage && (
        <MWToast
          type="success"
          message={toastMessage}
          isOpen={Boolean(toastMessage)}
          onClose={() => setToastMessage(null)}
        />
      )}
    </form>
  );
};
