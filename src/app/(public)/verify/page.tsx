'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  MWButton,
  MWInput,
  MWFormError,
  StatusBadge,
} from '@/components/primitives';
import {
  ShieldCheck,
  Phone,
  KeyRound,
  Lock,
  Award,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Ban,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { verificationAttemptSchema } from '@/lib/validations/verification';

export type VerificationOutcome =
  | 'idle'
  | 'verified'
  | 'already_verified'
  | 'invalid'
  | 'disabled'
  | 'rate_limited';

export interface VerificationResultData {
  outcome: VerificationOutcome;
  productName?: string;
  batchNumber?: string;
  verifiedAt?: string;
  firstVerifiedAt?: string;
  message: string;
}

export default function VerifyPage() {
  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<VerificationResultData | null>(null);

  const handleReset = () => {
    setResult(null);
    setCode('');
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validation = verificationAttemptSchema.safeParse({
      mobile,
      code,
    });

    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      setFormError(firstIssue?.message || 'Please check your inputs.');
      return;
    }

    setIsSubmitting(true);

    try {
      // In Phase 1 & 2: Call the server API endpoint or simulate authoritative server response
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: validation.data.mobile,
          code: validation.data.code,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        setResult({
          outcome: (errData.outcome as VerificationOutcome) || 'invalid',
          message:
            errData.error ||
            'The scratch code entered is invalid or could not be verified.',
        });
      }
    } catch {
      // Fallback: graceful handling if API route not yet mounted
      setResult({
        outcome: 'invalid',
        message:
          'Unable to verify this code. Please check that you typed the 12 characters correctly or contact support.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mw-container py-12 md:py-16 max-w-5xl mx-auto flex flex-col gap-14">
      {/* Page Header (Screen 05 Specification) */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-black text-[#0B1220] uppercase tracking-tight leading-tight">
          Verify Your Product
        </h1>
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#667085] mt-3">
          Ensure authenticity. Because you deserve the real thing.
        </p>
      </div>

      {/* Main 2-Column Verification Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Product Scratch Code Mockup Card */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-sm rounded-[24px] bg-white border border-[#DDE5EF] p-6 sm:p-8 shadow-[0_20px_45px_rgba(11,18,32,0.08)] text-center flex flex-col items-center justify-center mw-float-hover">
            {/* Real 3D Scratch Tub Render */}
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-[20px] overflow-hidden mb-6 shadow-sm border border-[#DDE5EF]/50">
              <Image
                src="/images/verification/muscle-weapon-scratch-tub.jpg"
                alt="Muscle Weapon Scratch Code Verification Label"
                fill
                priority
                className="object-contain"
              />
            </div>

            {/* Specimen Code Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[12px] bg-[#F5F8FC] border border-[#DDE5EF] font-mono font-black text-sm text-[#0B1220] tracking-wider mb-3">
              <span>MW-793K-900C</span>
            </div>

            <p className="text-xs text-[#667085] max-w-xs leading-relaxed">
              Locate the silver scratch layer on your Muscle Weapon product label to reveal your 12-digit security code.
            </p>
          </div>
        </div>

        {/* Right Column: Verification Form OR Result Card (Section 8 UX) */}
        <div className="lg:col-span-7">
          {!result ? (
            <div className="bg-white rounded-[24px] border border-[#DDE5EF] p-6 sm:p-10 shadow-[0_20px_45px_rgba(11,18,32,0.08)]">
              <div className="mb-6">
                <h2 className="text-lg font-black text-[#0B1220] uppercase tracking-tight">
                  Enter 12-Digit Scratch Code
                </h2>
                <p className="text-xs text-[#667085] mt-1">
                  Enter your mobile number and scratch code to check instant authenticity.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                {formError && <MWFormError message={formError} />}

                {/* Mandatory Mobile Number */}
                <MWInput
                  label="Mobile Number"
                  type="tel"
                  placeholder="e.g. 9816090309"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4" aria-hidden="true" />}
                  helperText="10-digit Indian mobile number required for authentication audit registration."
                />

                {/* 12-Digit Scratch Code */}
                <MWInput
                  label="12-Digit Scratch Code"
                  placeholder="MW-XXXX-XXXX"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  leftIcon={<KeyRound className="w-4 h-4" aria-hidden="true" />}
                  helperText="Format: 12 alphanumeric characters (hyphens are optional)."
                />

                {/* Privacy Notice */}
                <div className="flex items-start gap-2.5 p-3.5 rounded-[14px] bg-[#F5F8FC] border border-[#DDE5EF] text-xs text-[#667085]">
                  <Lock className="w-4 h-4 text-[#1677FF] shrink-0 mt-0.5" aria-hidden="true" />
                  <p>
                    Your details are encrypted and recorded strictly for anti-counterfeit fraud prevention.
                  </p>
                </div>

                <MWButton
                  type="submit"
                  size="lg"
                  isLoading={isSubmitting}
                  className="w-full mt-2"
                >
                  Verify Product
                </MWButton>
              </form>
            </div>
          ) : (
            /* Result Card Per Section 8 Specification */
            <div className="bg-white rounded-[24px] border border-[#DDE5EF] p-6 sm:p-10 shadow-[0_20px_45px_rgba(11,18,32,0.08)] flex flex-col gap-6">
              {/* Outcome 1: Verified (Success) */}
              {result.outcome === 'verified' && (
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#E8F8EE] text-[#12A150] flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-9 h-9" aria-hidden="true" />
                  </div>
                  <div>
                    <StatusBadge status="verified" label="100% Authentic Product" size="md" />
                    <h2 className="text-2xl font-black text-[#0B1220] uppercase tracking-tight mt-2">
                      Genuine Muscle Weapon Product
                    </h2>
                    <p className="text-xs text-[#667085] mt-1 max-w-md">
                      {result.message || 'This scratch code is authentic and has been successfully registered.'}
                    </p>
                  </div>

                  {result.productName && (
                    <div className="w-full p-4 rounded-[14px] bg-[#F5F8FC] border border-[#DDE5EF] text-left text-xs flex flex-col gap-1.5">
                      <div className="font-extrabold text-[#0B1220] uppercase">
                        Product: {result.productName}
                      </div>
                      {result.batchNumber && (
                        <div className="text-[#667085]">
                          Batch: {result.batchNumber}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Outcome 2: Already Verified (Warning) */}
              {result.outcome === 'already_verified' && (
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shadow-xs">
                    <AlertTriangle className="w-9 h-9" aria-hidden="true" />
                  </div>
                  <div>
                    <StatusBadge status="pending" label="Previously Verified Code" size="md" />
                    <h2 className="text-2xl font-black text-[#0B1220] uppercase tracking-tight mt-2">
                      Code Already Verified
                    </h2>
                    <p className="text-xs text-[#667085] mt-1 max-w-md">
                      {result.message ||
                        'This code was previously authenticated. If you did not scratch and verify this code yourself, it may be a counterfeit.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Outcome 3: Invalid (Danger) */}
              {result.outcome === 'invalid' && (
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#FEE2E2] text-[#DC3545] flex items-center justify-center shadow-xs">
                    <XCircle className="w-9 h-9" aria-hidden="true" />
                  </div>
                  <div>
                    <StatusBadge status="error" label="Invalid Code" size="md" />
                    <h2 className="text-2xl font-black text-[#0B1220] uppercase tracking-tight mt-2">
                      Authentication Failed
                    </h2>
                    <p className="text-xs text-[#667085] mt-1 max-w-md">
                      {result.message ||
                        'This code does not exist in our verified database. Please check that you typed all 12 characters correctly.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Outcome 4: Disabled (Danger) */}
              {result.outcome === 'disabled' && (
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#F3F4F6] text-[#6B7280] flex items-center justify-center shadow-xs">
                    <Ban className="w-9 h-9" aria-hidden="true" />
                  </div>
                  <div>
                    <StatusBadge status="disabled" label="Code Deactivated" size="md" />
                    <h2 className="text-2xl font-black text-[#0B1220] uppercase tracking-tight mt-2">
                      Code Deactivated
                    </h2>
                    <p className="text-xs text-[#667085] mt-1 max-w-md">
                      {result.message ||
                        'This code has been deactivated by administrators. Please contact customer support for assistance.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Outcome 5: Rate Limited (Warning) */}
              {result.outcome === 'rate_limited' && (
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shadow-xs">
                    <AlertTriangle className="w-9 h-9" aria-hidden="true" />
                  </div>
                  <div>
                    <StatusBadge status="pending" label="Rate Limit Exceeded" size="md" />
                    <h2 className="text-2xl font-black text-[#0B1220] uppercase tracking-tight mt-2">
                      Too Many Attempts
                    </h2>
                    <p className="text-xs text-[#667085] mt-1 max-w-md">
                      {result.message ||
                        'Too many verification attempts from this mobile number or IP. Please wait a few minutes before trying again.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#DDE5EF] flex flex-col sm:flex-row gap-3">
                <MWButton
                  variant="secondary"
                  className="w-full"
                  onClick={handleReset}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Verify Another Code
                </MWButton>
                <a href="tel:8816090309" className="w-full">
                  <MWButton
                    variant="outline"
                    className="w-full"
                    rightIcon={<ExternalLink className="w-4 h-4 text-[#1677FF]" />}
                  >
                    Contact Helpline
                  </MWButton>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3-Step Numbered Process Flow (Screen 05 Specification) */}
      <div className="rounded-[22px] bg-white border border-[#DDE5EF] p-8 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#1677FF] text-white font-black text-lg flex items-center justify-center shadow-[0_6px_16px_rgba(22,119,255,0.35)]">
              1
            </div>
            <h3 className="text-sm font-black text-[#0B1220] uppercase tracking-wide">
              Scratch The Seal
            </h3>
            <p className="text-xs text-[#667085] max-w-xs">
              Gently scratch the silver panel on your product packaging to reveal your unique 12-digit code.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#1677FF] text-white font-black text-lg flex items-center justify-center shadow-[0_6px_16px_rgba(22,119,255,0.35)]">
              2
            </div>
            <h3 className="text-sm font-black text-[#0B1220] uppercase tracking-wide">
              Enter Details
            </h3>
            <p className="text-xs text-[#667085] max-w-xs">
              Enter your 10-digit mobile number and the 12-digit security scratch code into the verification form.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#1677FF] text-white font-black text-lg flex items-center justify-center shadow-[0_6px_16px_rgba(22,119,255,0.35)]">
              3
            </div>
            <h3 className="text-sm font-black text-[#0B1220] uppercase tracking-wide">
              Instant Authenticity
            </h3>
            <p className="text-xs text-[#667085] max-w-xs">
              Get immediate confirmation that your Muscle Weapon supplement is 100% genuine and lab-certified.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Brand Value Badges (Screen 05 Specification) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-[22px] bg-white border border-[#DDE5EF] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-[#EAF4FF] text-[#1677FF] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-black text-[#0B1220] uppercase">100% Genuine</div>
            <div className="text-[11px] text-[#667085]">Guaranteed authentic</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-[#EAF4FF] text-[#1677FF] flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-black text-[#0B1220] uppercase">Lab Tested</div>
            <div className="text-[11px] text-[#667085]">Verified purity</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-[#EAF4FF] text-[#1677FF] flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-black text-[#0B1220] uppercase">Anti-Counterfeit</div>
            <div className="text-[11px] text-[#667085]">Tamper-evident</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-[#EAF4FF] text-[#1677FF] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-black text-[#0B1220] uppercase">Athlete Choice</div>
            <div className="text-[11px] text-[#667085]">Engineered in India</div>
          </div>
        </div>
      </div>
    </div>
  );
}
