'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n-context';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, ShieldCheck, Home, Car, PhoneCall, PlusCircle } from 'lucide-react';

export default function HowItWorksPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
          Marketplace Guide
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          How Wolaita Marketplace Works
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          A transparent bridge connecting buyers, owners, and authorized brokers in Wolaita Sodo.
        </p>
      </div>

      {/* For Buyers */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-emerald-100 text-[#1b4332] flex items-center justify-center font-bold text-sm">
            1
          </span>
          <span>For Buyers and Renters</span>
        </h2>
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            <strong>Free Public Browsing:</strong> Explore houses, land plots, storefronts, cars, and trucks without mandatory registration.
          </p>
          <p>
            <strong>Transparent Pricing:</strong> Every listing displays asking prices in Ethiopian Birr (ETB) and indicates whether the seller is open to negotiation.
          </p>
          <p>
            <strong>Direct Communication:</strong> Call the broker directly, send a WhatsApp message, or submit an inquiry form. You can also schedule an on-site property inspection in Wolaita Sodo.
          </p>
        </div>
      </div>

      {/* For Property Owners & Vehicle Sellers */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
            2
          </span>
          <span>For Property Owners and Dealers</span>
        </h2>
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            <strong>Free Listing Creation:</strong> Create an account and submit your property or vehicle through our guided 6-step wizard.
          </p>
          <p>
            <strong>Moderation & Verification:</strong> Your listing enters our admin review queue where details and ownership declarations are checked before publication.
          </p>
          <p>
            <strong>Lead Management:</strong> Track customer inquiries, manage contact statuses, and schedule in-person viewings from your workspace CRM.
          </p>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link href="/sell">
          <Button variant="accent" size="lg" className="font-bold shadow-md">
            <PlusCircle className="w-5 h-5 mr-2" />
            <span>Post Your Free Listing Now</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
