import React from 'react';
import { MWButton, MWInput } from '@/components/primitives';
import { Settings, Shield } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div>
        <h2 className="text-xl font-black text-[#0B1220] uppercase tracking-tight">
          Admin & Operational Settings
        </h2>
        <p className="text-xs text-[#667085] mt-0.5">
          Configure operational parameters, support contact details, and security controls.
        </p>
      </div>

      {/* Support Details Config */}
      <div className="bg-white rounded-[20px] border border-[#DDE5EF] p-6 sm:p-8 shadow-xs flex flex-col gap-5">
        <div className="flex items-center gap-2 pb-4 border-b border-[#DDE5EF]">
          <Settings className="w-4 h-4 text-[#1677FF]" aria-hidden="true" />
          <h3 className="text-sm font-extrabold uppercase text-[#0B1220] tracking-wide">
            Public Support Information
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MWInput
            label="Support Email"
            defaultValue="muscle.weapon@gmail.com"
            readOnly
            helperText="Supplied official customer support email."
          />
          <MWInput
            label="Helpline Phone"
            defaultValue="8816090309"
            readOnly
            helperText="Supplied official helpline contact number."
          />
        </div>
      </div>

      {/* Security & Access */}
      <div className="bg-white rounded-[20px] border border-[#DDE5EF] p-6 sm:p-8 shadow-xs flex flex-col gap-5">
        <div className="flex items-center gap-2 pb-4 border-b border-[#DDE5EF]">
          <Shield className="w-4 h-4 text-[#1677FF]" aria-hidden="true" />
          <h3 className="text-sm font-extrabold uppercase text-[#0B1220] tracking-wide">
            Security & Authentication
          </h3>
        </div>

        <p className="text-xs text-[#667085]">
          Authentication is enforced via Supabase Auth with Row Level Security (RLS) on all PostgreSQL tables. Multi-Factor Authentication (MFA) can be enabled for privileged administrator accounts.
        </p>

        <div className="pt-2">
          <MWButton variant="outline" size="sm">
            Configure Multi-Factor Authentication (MFA)
          </MWButton>
        </div>
      </div>
    </div>
  );
}
