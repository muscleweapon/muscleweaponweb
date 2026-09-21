'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MuscleWeaponLogo } from '@/components/brand/MuscleWeaponLogo';
import { MWButton, MWInput, MWFormError, MWSkeleton } from '@/components/primitives';
import { Lock, Mail, Eye, EyeOff, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || 'Invalid email or password.');
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        setError('Authentication failed. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      // Verify that the user has admin or super_admin role in public.profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
        await supabase.auth.signOut();
        setError('Access denied. This account does not have administrator privileges.');
        setIsLoading(false);
        return;
      }

      const redirectTo = searchParams.get('redirectTo') || '/admin';
      router.push(redirectTo);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-[24px] border border-[#DDE5EF] p-8 sm:p-10 shadow-[0_20px_45px_rgba(11,18,32,0.10)]">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <MuscleWeaponLogo />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F8FC] border border-[#DDE5EF] text-[11px] font-bold text-[#667085] mt-4">
            <Shield className="w-3.5 h-3.5 text-[#1677FF]" aria-hidden="true" />
            <span>Authorized Personnel Only</span>
          </div>
          <h1 className="text-xl font-black text-[#0B1220] uppercase tracking-tight mt-3">
            Admin Console Sign In
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Access real-time catalog management and verification controls.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          {error && <MWFormError message={error} />}

          <MWInput
            label="Administrator Email"
            type="email"
            placeholder="admin@muscleweapon.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" aria-hidden="true" />}
          />

          <MWInput
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" aria-hidden="true" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="p-1 text-[#667085] hover:text-[#0B1220] focus:outline-none cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            }
          />

          <MWButton
            type="submit"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2"
          >
            Sign In to Console
          </MWButton>
        </form>
      </div>

      <p className="text-center text-xs text-[#667085] mt-6">
        Protected by Supabase Row-Level Security (RLS) & strict role-based access control.
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md p-8">
          <MWSkeleton className="h-96 w-full rounded-[24px]" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
