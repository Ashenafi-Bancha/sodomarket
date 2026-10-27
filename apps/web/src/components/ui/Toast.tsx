'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type ToastTone = 'success' | 'error';
interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

const ToastContext = createContext<(message: string, tone?: ToastTone) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), []);

  const show = useCallback(
    (message: string, tone: ToastTone = 'success') => {
      const id = Date.now() + Math.random();
      setToasts((all) => [...all.slice(-2), { id, message, tone }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex flex-col items-center gap-2 px-4 md:bottom-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm animate-fade-up items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium shadow-lift ring-1',
              t.tone === 'success' ? 'bg-ink-900 text-white ring-white/10' : 'bg-red-600 text-white ring-red-700'
            )}
          >
            {t.tone === 'success' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-300" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0" />
            )}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="rounded-full p-1 opacity-70 hover:opacity-100" aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
