'use client';

import React from 'react';
import Link from 'next/link';
import { platformConfig } from '@/lib/config';
import { Button } from '@/components/ui/Button';
import { Sparkles, MapPin, ShieldCheck, PlusCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
          About the Platform
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          {platformConfig.brandName}
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          {platformConfig.tagline}
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 space-y-6 shadow-xs text-xs sm:text-sm text-slate-700 leading-relaxed">
        <h2 className="text-lg font-bold text-slate-900">Our Mission</h2>
        <p>
          Wolaita Marketplace (Sodo Market Hub) is built to provide Wolaita Sodo and surrounding regional zones with a clean, fast, and trustworthy digital marketplace for discovering, advertising, and connecting around properties and vehicles.
        </p>

        <h2 className="text-lg font-bold text-slate-900 pt-2">Local Focus with Regional Expansion</h2>
        <p>
          We start with Wolaita Sodo&apos;s key commercial and residential hubs—including Mehal Ketema, Merkato, Arada, Boditi Road, Ligaba, and Humbo Gate—with architectural readiness to scale to additional towns across the South Ethiopia regional state.
        </p>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
          <div className="font-bold text-slate-900">Configurable Identity Note</div>
          <p>
            The branding name, contact numbers, and logos are completely configurable via environment settings to support local founder finalization.
          </p>
        </div>
      </div>
    </div>
  );
}
