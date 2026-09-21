'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleCodeStatusAction, deleteCodeAction } from '@/lib/actions/verification-codes';
import { CheckCircle2, Ban, Trash2, Loader2 } from 'lucide-react';

interface CodeRowActionsProps {
  codeId: string;
  currentStatus: string;
}

export const CodeRowActions: React.FC<CodeRowActionsProps> = ({ codeId, currentStatus }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggle = (newStatus: 'active' | 'disabled') => {
    startTransition(async () => {
      await toggleCodeStatusAction(codeId, newStatus);
      router.refresh();
    });
  };

  const handleRevoke = () => {
    if (!window.confirm('Are you sure you want to revoke/deactivate this scratch code?')) return;
    startTransition(async () => {
      await deleteCodeAction(codeId);
      router.refresh();
    });
  };

  if (currentStatus === 'verified') {
    return (
      <span className="text-[10px] text-[#667085] italic">
        Verified (Locked)
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      {currentStatus === 'active' ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleToggle('disabled')}
          className="p-1.5 rounded-[8px] border border-[#DDE5EF] text-[#667085] hover:text-[#DC3545] hover:border-[#DC3545] hover:bg-[#FEE2E2] transition-colors disabled:opacity-50"
          title="Disable Code"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
        </button>
      ) : (
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleToggle('active')}
          className="p-1.5 rounded-[8px] border border-[#DDE5EF] text-[#667085] hover:text-[#12A150] hover:border-[#12A150] hover:bg-[#E8F8EE] transition-colors disabled:opacity-50"
          title="Activate Code"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
        </button>
      )}

      <button
        type="button"
        disabled={isPending}
        onClick={handleRevoke}
        className="p-1.5 rounded-[8px] border border-[#DDE5EF] text-[#DC3545] hover:border-[#DC3545] hover:bg-[#FEE2E2] transition-colors disabled:opacity-50"
        title="Revoke / Delete Code"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
