import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

const fieldBase =
  'w-full rounded-xl border border-ink-200 bg-white px-3.5 text-[15px] text-ink-900 placeholder:text-ink-400 transition-colors hover:border-ink-300 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 disabled:bg-ink-50 disabled:text-ink-500';

export function Label({ className, children, optional, ...props }: React.LabelHTMLAttributes<HTMLLabelElement> & { optional?: string }) {
  return (
    <label className={cn('mb-1.5 block text-sm font-semibold text-ink-800', className)} {...props}>
      {children}
      {optional && <span className="ml-1 font-normal text-ink-400">({optional})</span>}
    </label>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(fieldBase, 'h-11', className)} {...props} />
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(fieldBase, 'min-h-28 py-3 leading-relaxed', className)} {...props} />
  )
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, ...props }, ref) => (
    <div className="relative">
      <select ref={ref} className={cn(fieldBase, 'h-11 cursor-pointer appearance-none pr-10', className)} {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
    </div>
  )
);
Select.displayName = 'Select';

export function Checkbox({
  label,
  description,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode; description?: string }) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-3', className)}>
      <input
        type="checkbox"
        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded-md border-ink-300 accent-brand-700"
        {...props}
      />
      <span>
        <span className="block text-sm font-medium text-ink-800">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-ink-500">{description}</span>}
      </span>
    </label>
  );
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-1.5 text-sm font-medium text-red-600">
      {children}
    </p>
  );
}

export function FormAlert({ children, tone = 'error' }: { children?: React.ReactNode; tone?: 'error' | 'success' }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl px-4 py-3 text-sm font-medium',
        tone === 'error' ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : 'bg-brand-50 text-brand-800 ring-1 ring-brand-200'
      )}
    >
      {children}
    </div>
  );
}
