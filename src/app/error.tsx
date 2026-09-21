'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MWButton } from '@/components/primitives';
import { AlertTriangle } from 'lucide-react';
import { generateCorrelationId } from '@/lib/correlation';
import { logger } from '@/lib/logger';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [correlationId] = useState(() => generateCorrelationId());

  useEffect(() => {
    logger.error('Application runtime error caught by boundary', error, {
      correlationId,
      digest: error.digest,
    });
  }, [error, correlationId]);

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[24px] border border-[#DDE5EF] p-8 text-center shadow-[0_16px_40px_rgba(11,18,32,0.08)]">
        <div className="w-12 h-12 rounded-full bg-[#FEE2E2] text-[#DC3545] flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" aria-hidden="true" />
        </div>

        <h1 className="text-xl font-black text-[#0B1220] uppercase tracking-tight">
          System Error Encountered
        </h1>

        <p className="text-xs text-[#667085] mt-2 leading-relaxed">
          An unexpected error occurred while rendering this view. Our engineering logs have been notified with the incident correlation ID.
        </p>

        <div className="mt-4 p-2.5 rounded-[10px] bg-[#F5F8FC] border border-[#DDE5EF] text-[11px] font-mono text-[#667085] select-all">
          Ref: {correlationId}
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <MWButton size="sm" onClick={() => reset()}>
            Retry Action
          </MWButton>
          <MWButton
            variant="outline"
            size="sm"
            onClick={() => router.push('/')}
          >
            Return Home
          </MWButton>
        </div>
      </div>
    </div>
  );
}
