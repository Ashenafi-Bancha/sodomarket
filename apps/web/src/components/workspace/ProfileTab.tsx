'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { useTranslation } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { api, errorMessage } from '@/lib/api-client';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { FormAlert, Input, Label, Textarea } from '@/components/ui/Input';
import { LanguageSelector } from '@/components/layout/LanguageSelector';
import { Panel } from './shared';

export function ProfileTab({ user }: { user: User }) {
  const { t } = useTranslation();
  const { setUser } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const isPro = user.role === 'BROKER' || user.role === 'AGENCY_ADMIN';

  const [profile, setProfile] = useState({
    fullName: user.fullName,
    phone: user.phone.replace(/^\+251/, '0'),
    bio: user.bio ?? '',
    businessName: user.businessName ?? '',
    licenseNumber: user.licenseNumber ?? '',
  });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const [pwError, setPwError] = useState('');
  const [busy, setBusy] = useState<'profile' | 'pw' | null>(null);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy('profile');
    setError('');
    try {
      const updated = await api.patch<User>('/account', profile);
      setUser(updated);
      toast(t.common.saved);
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy('pw');
    setPwError('');
    try {
      await api.patch('/account', pw);
      setPw({ currentPassword: '', newPassword: '' });
      toast(t.common.saved);
    } catch (err) {
      setPwError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title={t.crm.profile}>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <Label htmlFor="p-name">{t.auth.fullName}</Label>
            <Input id="p-name" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="p-phone">{t.auth.phone}</Label>
              <Input id="p-phone" type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="p-email">{t.auth.email}</Label>
              <Input id="p-email" value={user.email} disabled />
            </div>
          </div>
          {isPro && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="p-biz">{t.auth.businessName}</Label>
                <Input id="p-biz" value={profile.businessName} onChange={(e) => setProfile({ ...profile, businessName: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="p-lic">{t.auth.licenseNumber}</Label>
                <Input id="p-lic" value={profile.licenseNumber} onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })} />
              </div>
            </div>
          )}
          <div>
            <Label htmlFor="p-bio" optional={t.common.optional}>
              Bio
            </Label>
            <Textarea id="p-bio" rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
          </div>
          <FormAlert>{error}</FormAlert>
          <Button type="submit" isLoading={busy === 'profile'}>
            {t.common.save}
          </Button>
        </form>
      </Panel>

      <div className="space-y-6">
        <Panel title="Language">
          <LanguageSelector variant="list" />
        </Panel>
        <Panel title={t.auth.password}>
          <form onSubmit={savePassword} className="space-y-4">
            <div>
              <Label htmlFor="pw-cur">Current password</Label>
              <Input id="pw-cur" type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="pw-new">New password</Label>
              <Input id="pw-new" type="password" autoComplete="new-password" minLength={8} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required />
              <p className="mt-1 text-xs text-ink-400">{t.auth.passwordHint}</p>
            </div>
            <FormAlert>{pwError}</FormAlert>
            <Button type="submit" variant="outline" isLoading={busy === 'pw'}>
              {t.common.save}
            </Button>
          </form>
        </Panel>
      </div>
    </div>
  );
}
