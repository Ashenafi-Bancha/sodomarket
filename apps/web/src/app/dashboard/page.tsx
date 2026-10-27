'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useTranslation } from '@/lib/i18n-context';
import { useMarketplaceStore } from '@/lib/use-marketplace-store';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { LeadPipeline } from '@/components/dashboard/LeadPipeline';
import { AppointmentsList } from '@/components/dashboard/AppointmentsList';
import { DealsList } from '@/components/dashboard/DealsList';
import { ListingCard } from '@/components/listing/ListingCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Building2,
  Users,
  Calendar,
  Handshake,
  PlusCircle,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, role } = useAuth();
  const {
    listings,
    leads,
    appointments,
    deals,
    updateLeadStage,
    addAppointment,
  } = useMarketplaceStore();

  const [activeTab, setActiveTab] = useState<'leads' | 'appointments' | 'deals' | 'listings' | 'agency'>(
    'leads'
  );

  // Filter broker listings
  const myListings = listings.filter(
    (l) => l.author?.id === user?.id || l.author?.role === 'BROKER'
  );

  const activeCount = myListings.filter((l) => l.status === 'PUBLISHED').length;
  const pendingCount = myListings.filter((l) => l.status === 'PENDING_REVIEW').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Workspace Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="emerald" size="md" className="font-bold">
              {role === 'ADMIN' ? 'Platform Administrator' : 'Licensed Wolaita Broker'}
            </Badge>
            {user?.idVerified && (
              <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Verified License: {user?.licenseNumber || 'WOL-RE-2023-441'}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {user?.businessName || 'Sodo Prime Real Estate & Brokerage'}
          </h1>
          <p className="text-xs text-slate-500">
            Assigned Broker: <strong>{user?.fullName}</strong> • Serving Wolaita Sodo & Regional Market
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/sell">
            <Button variant="amber" size="md" className="font-bold shadow-sm">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              <span>Create New Listing</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Numerical Metrics Overview */}
      <StatsOverview
        activeCount={activeCount}
        pendingCount={pendingCount}
        leadsCount={leads.length}
        appointmentsCount={appointments.length}
      />

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto pb-px text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
            activeTab === 'leads'
              ? 'border-[#1b4332] text-[#1b4332]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t.crm.leadsTitle}</span>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full">
            {leads.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
            activeTab === 'appointments'
              ? 'border-[#1b4332] text-[#1b4332]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{t.crm.appointmentsTitle}</span>
          <span className="bg-sky-100 text-sky-800 text-[10px] px-1.5 py-0.2 rounded-full">
            {appointments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('deals')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
            activeTab === 'deals'
              ? 'border-[#1b4332] text-[#1b4332]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Handshake className="w-4 h-4" />
          <span>{t.crm.dealsTitle}</span>
          <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full">
            {deals.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
            activeTab === 'listings'
              ? 'border-[#1b4332] text-[#1b4332]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>My Listings</span>
          <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full">
            {myListings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('agency')}
          className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
            activeTab === 'agency'
              ? 'border-[#1b4332] text-[#1b4332]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Agency Profile</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'leads' && (
        <LeadPipeline
          leads={leads}
          onUpdateStage={updateLeadStage}
          onScheduleAppointment={(lead) => {
            addAppointment({
              leadId: lead.id,
              listingId: lead.listingId,
              listingTitle: lead.listingTitle,
              brokerId: user?.id || 'usr-broker-01',
              title: `Viewing for ${lead.customerName}`,
              scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
              status: 'CONFIRMED',
              locationNotes: `Meeting ${lead.customerName} in Wolaita Sodo`,
            });
            setActiveTab('appointments');
          }}
        />
      )}

      {activeTab === 'appointments' && <AppointmentsList appointments={appointments} />}

      {activeTab === 'deals' && <DealsList deals={deals} />}

      {activeTab === 'listings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Listings Managed by this Account</h3>
            <Link href="/sell">
              <Button variant="primary" size="sm">
                <PlusCircle className="w-4 h-4 mr-1.5" /> Post Another Asset
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myListings.map((lst) => (
              <div key={lst.id} className="relative group">
                <ListingCard listing={lst} />
                <div className="mt-2 flex items-center justify-between px-2 text-xs">
                  <Badge
                    variant={lst.status === 'PUBLISHED' ? 'emerald' : 'amber'}
                    size="sm"
                    className="font-bold"
                  >
                    {lst.status}
                  </Badge>
                  <span className="text-slate-400 font-mono text-[11px]">{lst.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'agency' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 max-w-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Sodo Prime Properties & Motors</h3>
              <p className="text-xs text-slate-500">Licensed Real Estate & Vehicle Brokerage Agency</p>
            </div>
            <Badge variant="emerald" size="md" className="font-bold">
              Verified Agency
            </Badge>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Mehal Ketema, Commercial Center Bldg 3rd Fl, Wolaita Sodo</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-700" />
              <span>+251 91 100 0002</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-700" />
              <span>info@sodoprime.et</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Team Members</h4>
            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">Alemu Tadesse</span>
                  <span className="text-slate-400 block text-[11px]">Agency Principal & Real Estate Lead</span>
                </div>
                <Badge variant="slate" size="sm">
                  Owner
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
