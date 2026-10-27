'use client';

import React, { useState } from 'react';
import { Flag } from 'lucide-react';
import { useTranslation } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { api, errorMessage } from '@/lib/api-client';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FormAlert, Input, Label, Select, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

const REASONS = ['FRAUD', 'DUPLICATE_LISTING', 'INCORRECT_PRICE', 'UNAVAILABLE_ASSET', 'OFFENSIVE_CONTENT', 'OTHER'] as const;

export function ReportButton({ listingId }: { listingId: string }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>('FRAUD');
  const [details, setDetails] = useState('');
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const isEmail = contact.includes('@');
      await api.post('/reports', {
        listingId,
        reason,
        details,
        reporterEmail: isEmail ? contact : undefined,
        reporterPhone: !isEmail && contact ? contact : undefined,
      });
      setOpen(false);
      setDetails('');
      toast(t.report.sent);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 text-sm font-semibold text-ink-500 hover:text-red-600">
        <Flag className="h-4 w-4" />
        {t.listingDetail.reportListing}
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title={t.report.title}>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="r-reason">{t.report.reason}</Label>
            <Select
              id="r-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              options={REASONS.map((r) => ({ value: r, label: t.report.reasons[r] }))}
            />
          </div>
          <div>
            <Label htmlFor="r-details">{t.report.details}</Label>
            <Textarea id="r-details" value={details} onChange={(e) => setDetails(e.target.value)} required minLength={10} rows={4} />
          </div>
          {!user && (
            <div>
              <Label htmlFor="r-contact">{t.report.contact}</Label>
              <Input id="r-contact" value={contact} onChange={(e) => setContact(e.target.value)} required />
            </div>
          )}
          <FormAlert>{error}</FormAlert>
          <Button type="submit" variant="danger" className="w-full" isLoading={busy}>
            {t.report.submit}
          </Button>
        </form>
      </Modal>
    </>
  );
}
