import { formatCurrency } from '../../utils/format';

export default function StatCard({ title, value, icon: Icon, accent = 'brand', isCurrency = true }) {
  const accents = {
    brand: 'from-brand-500 to-brand-700',
    emerald: 'from-emerald-500 to-emerald-700',
    amber: 'from-amber-500 to-amber-700',
    rose: 'from-rose-500 to-rose-700',
    violet: 'from-violet-500 to-violet-700',
    slate: 'from-slate-500 to-slate-700',
  };

  const display = isCurrency ? formatCurrency(value) : value;

  return (
    <div className="group animate-fade-in rounded-2xl border border-border-light bg-card-light p-5 shadow-sm transition hover:shadow-md dark:border-border-dark dark:bg-card-dark">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {display}
          </p>
        </div>
        {Icon && (
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${accents[accent]} text-white shadow-lg`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
