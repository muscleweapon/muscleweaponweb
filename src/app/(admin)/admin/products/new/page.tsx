import React from 'react';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { ProductForm } from '@/components/admin/ProductForm';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  await requireAdminUser();
  return <ProductForm isEdit={false} />;
}
