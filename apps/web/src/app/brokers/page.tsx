'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n-context';
import { DEMO_USERS } from '@/lib/auth-context';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, Phone, Mail, MapPin, Building2, User } from 'lucide-react';

export default function BrokersPage() {
  const { t } = useTranslation();

  const brokers = [
    DEMO_USERS.BROKER,
    DEMO_USERS.AGENCY_ADMIN,
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Local Real Estate & Vehicle Professionals</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {t.nav.brokers} in Wolaita Sodo
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Connect directly with licensed local brokers and established agencies who know the Wolaita market, land registries, and vehicle standards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {brokers.map((broker) => (
          <div
            key={broker.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#1b4332] flex items-center justify-center font-black text-base shrink-0">
                    {broker.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{broker.fullName}</span>
                      {broker.idVerified && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">{broker.businessName}</p>
                  </div>
                </div>
                <Badge variant="emerald" size="sm" className="font-bold">
                  Verified Broker
                </Badge>
              </div>

              {broker.bio && <p className="text-xs text-slate-600 leading-relaxed">{broker.bio}</p>}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">License:</span>
                  <span className="font-mono font-bold text-emerald-800">{broker.licenseNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Wolaita Sodo, Central Business District</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">{broker.phone}</span>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${broker.phone}`}
                  className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1b4332] font-bold text-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Broker</span>
                </a>
                <Link href={`/properties`}>
                  <Button variant="outline" size="sm">
                    View Listings
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
