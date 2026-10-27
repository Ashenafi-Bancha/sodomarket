'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n-context';
import { ShieldCheck, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function SafetyPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
          Consumer Protection & Community Trust
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Trust & Safety Guidelines
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          Best practices for secure real estate and vehicle transactions in Wolaita Sodo, Ethiopia.
        </p>
      </div>

      <div className="bg-amber-50 rounded-3xl border border-amber-200/80 p-8 space-y-4 text-xs sm:text-sm text-amber-950">
        <div className="flex items-center gap-2 font-bold text-amber-900 text-base">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
          <span>Golden Rule: Never Transfer Money Before Physical Verification</span>
        </div>
        <p className="leading-relaxed">
          Wolaita Marketplace is a digital advertising and discovery directory. We do not operate escrow accounts or hold down payments. Always inspect the house, land, or car in person in Wolaita Sodo alongside authorized municipal officials or licensed local brokers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Real Estate Verification</h3>
          <ul className="space-y-2 text-xs text-slate-600">
            <li>• Check original title deed (sened) at Wolaita Sodo Municipal Land Registry.</li>
            <li>• Confirm boundary landmarks in Kebele records before finalizing contracts.</li>
            <li>• Verify tax receipts and water/electric utility bills are cleared.</li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Vehicle Verification</h3>
          <ul className="space-y-2 text-xs text-slate-600">
            <li>• Verify the vehicle registration card (Libre) matches the chassis number.</li>
            <li>• Inspect engine condition, gearbox, and body frame with a trusted mechanic in Sodo.</li>
            <li>• Perform ownership transfer only at official transport licensing bureaus.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
