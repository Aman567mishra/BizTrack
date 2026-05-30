import { format, parseISO, isValid } from 'date-fns';

export function formatCurrency(amount, currency = 'INR') {
  const value = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value, pattern = 'dd MMM yyyy') {
  if (!value) return '—';
  try {
    const date =
      value?.toDate?.() ??
      (typeof value === 'string' ? parseISO(value) : new Date(value));
    if (!isValid(date)) return '—';
    return format(date, pattern);
  } catch {
    return '—';
  }
}

export function toInputDate(value) {
  if (!value) return '';
  try {
    const date =
      value?.toDate?.() ??
      (typeof value === 'string' ? parseISO(value) : new Date(value));
    if (!isValid(date)) return '';
    return format(date, 'yyyy-MM-dd');
  } catch {
    return '';
  }
}

export function statusColor(status) {
  const map = {
    Open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    Completed:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    'Pending Payment':
      'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    Cancelled: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  };
  return map[status] || map.Open;
}
