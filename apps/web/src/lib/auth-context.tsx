'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from './types';
import { api } from './api-client';

export const DEMO_USERS: Record<string, User> = {
  ADMIN: {
    id: '84e166a8-8475-4bb2-96ec-9d67b8081107',
    email: 'admin@wolaitamarketplace.et',
    phone: '+251911000001',
    role: 'ADMIN',
    fullName: 'Sodo Admin Team',
    businessName: 'Wolaita Marketplace Operations',
    idVerified: true,
  },
  BROKER: {
    id: '816bda3f-fb04-4806-bd4d-2b00fe484b75',
    email: 'broker.alemu@wolaitamarketplace.et',
    phone: '+251911000002',
    role: 'BROKER',
    fullName: 'Alemu Tadesse',
    businessName: 'Sodo Prime Properties',
    bio: 'Licensed real estate broker with 7 years serving Wolaita Sodo families, investors and businesses.',
    licenseNumber: 'WOL-RE-2023-441',
    idVerified: true,
  },
  AGENCY_ADMIN: {
    id: '649c9ee1-195a-4855-b8f3-f181753172c3',
    email: 'dealer.marta@wolaitamarketplace.et',
    phone: '+251911000003',
    role: 'AGENCY_ADMIN',
    fullName: 'Marta Haile',
    businessName: 'Wolaita Sodo Auto Hub',
    bio: 'Vehicle dealer connecting buyers with inspected cars, SUVs and commercial trucks.',
    licenseNumber: 'WOL-AUTO-2022-108',
    idVerified: true,
  },
  SELLER: {
    id: '698aafb6-204d-4541-8ac0-3419a217e8e3',
    email: 'seller.bekele@wolaitamarketplace.et',
    phone: '+251911000004',
    role: 'SELLER',
    fullName: 'Bekele Wolde',
    bio: 'Private owner selling property and vehicles in Wolaita Sodo.',
    idVerified: true,
  },
  BUYER: {
    id: '5e57de95-c505-4bc1-84a3-b201bbe57924',
    email: 'buyer.tariku@gmail.com',
    phone: '+251911000005',
    role: 'BUYER',
    fullName: 'Tariku Girmay',
    idVerified: false,
  },
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ initialUser, children }: { initialUser: User | null; children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(initialUser);

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => {});
    setUser(null);
    router.push('/');
    router.refresh();
  }, [router]);

  const value = useMemo(() => ({ user, isAuthenticated: !!user, setUser, logout }), [user, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
