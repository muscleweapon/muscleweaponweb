'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MWButton,
  MWInput,
  MWFormError,
  MWToast,
} from '@/components/primitives';
import { KeyRound, Sparkles } from 'lucide-react';
import { generateCodeBatchAction } from '@/lib/actions/verification-codes';

export const BatchGeneratorForm: React.FC = () => {
  const router = useRouter();
  const [batchCount, setBatchCount] = useState('100');
  const [batchNote, setBatchNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const countNum = parseInt(batchCount, 10);
    if (isNaN(countNum) || countNum < 1 || countNum > 5000) {
      setError('Please enter a valid batch quantity between 1 and 5,000.');
      return;
    }

    setIsGenerating(true);

    try {
      const res = await generateCodeBatchAction({
        count: countNum,
        note: batchNote.trim() || undefined,
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to generate code batch.');
      }

      setToastMessage(`Successfully generated ${res.count} unique verification codes!`);
      setBatchCount('100');
      setBatchNote('');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error generating batch.';
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-[20px] border border-[#DDE5EF] p-6 sm:p-8 shadow-xs">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#DDE5EF]">
        <div className="w-8 h-8 rounded-[10px] bg-[#EAF4FF] text-[#1677FF] flex items-center justify-center">
          <KeyRound className="w-4 h-4" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold uppercase text-[#0B1220] tracking-wide">
            Batch Code Generator (1 to 5,000)
          </h3>
          <p className="text-[11px] text-[#667085]">
            Generates cryptographically secure, globally unique 12-character scratch codes.
          </p>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="flex flex-col gap-4 max-w-xl" noValidate>
        {error && <MWFormError message={error} />}

        <MWInput
          label="Quantity to Generate (1 to 5,000)"
          type="number"
          min={1}
          max={5000}
          required
          value={batchCount}
          onChange={(e) => setBatchCount(e.target.value)}
          helperText="Codes are product-independent and enforced unique by the database constraint."
        />

        <MWInput
          label="Operational Batch Note (Optional)"
          placeholder="e.g. Production Run 2026-Q1 Whey Protein"
          value={batchNote}
          onChange={(e) => setBatchNote(e.target.value)}
        />

        <div className="flex items-center gap-3 mt-2">
          <MWButton
            type="submit"
            size="md"
            isLoading={isGenerating}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            {isGenerating ? `Generating ${batchCount} Codes...` : 'Generate Unique Batch'}
          </MWButton>
        </div>
      </form>

      {toastMessage && (
        <MWToast
          type="success"
          message={toastMessage}
          isOpen={Boolean(toastMessage)}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};
