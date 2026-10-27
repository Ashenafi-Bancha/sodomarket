'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { useMarketplaceStore } from '@/lib/use-marketplace-store';
import { ReviewQueue } from '@/components/admin/ReviewQueue';
import { UserManagement } from '@/components/admin/UserManagement';
import { AuditLogView } from '@/components/admin/AuditLogView';
import { ReportsQueue } from '@/components/admin/ReportsQueue';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  ShieldAlert,
  Inbox,
  Users,
  AlertTriangle,
  History,
  CheckCircle2,
  Sliders,
  Sparkles,
} from 'lucide-react';

export default function AdminPage() {
  const { t } = useTranslation();
  const { role } = useAuth();
  const {
    listings,
    pendingListings,
    reports,
    auditLogs,
    approveListing,
    rejectListing,
  } = useMarketplaceStore();

  const [activeTab, setActiveTab] = useState<'queue' | 'users' | 'reports' | 'audit' | 'settings'>('queue');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              Supervision & Trust Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{t.admin.centerTitle}</h1>
          <p className="text-xs text-slate-400 max-w-xl">{t.admin.centerSubtitle}</p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 p-3 rounded-xl border border-white/10 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold text-white block">Moderation Protocol</span>
            <span className="text-slate-300">Wolaita Sodo Municipal Standards</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto pb-px text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
            activeTab === 'queue'
              ? 'border-rose-600 text-rose-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>{t.admin.reviewQueue}</span>
          {pendingListings.length > 0 && (
            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {pendingListings.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
            activeTab === 'users'
              ? 'border-rose-600 text-rose-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t.admin.userManagement}</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
            activeTab === 'reports'
              ? 'border-rose-600 text-rose-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>{t.admin.reports}</span>
          {reports.length > 0 && (
            <span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {reports.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
            activeTab === 'audit'
              ? 'border-rose-600 text-rose-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{t.admin.auditLogs}</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'queue' && (
        <ReviewQueue
          pendingListings={pendingListings}
          allListings={listings}
          onApprove={approveListing}
          onReject={rejectListing}
        />
      )}

      {activeTab === 'users' && <UserManagement />}

      {activeTab === 'reports' && <ReportsQueue reports={reports} />}

      {activeTab === 'audit' && <AuditLogView logs={auditLogs} />}
    </div>
  );
}
