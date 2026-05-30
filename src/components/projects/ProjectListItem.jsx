import { Link } from 'react-router-dom';
import { formatCurrency, statusColor } from '../../utils/format';

export default function ProjectListItem({ project, compact }) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="block rounded-xl border border-border-light bg-white p-4 transition hover:border-brand-300 hover:shadow-sm dark:border-border-dark dark:bg-slate-800/50 dark:hover:border-brand-700"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-slate-900 dark:text-white">
            {project.projectName}
          </p>
          <p className="text-sm text-slate-500">{project.customerName}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(project.status)}`}
        >
          {project.status}
        </span>
      </div>
      {!compact && (
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400">
          <span>Deal: {formatCurrency(project.dealAmount)}</span>
          <span className="text-emerald-600">
            Received: {formatCurrency(project.totalReceived)}
          </span>
          <span className="font-semibold text-slate-800 dark:text-white">
            Profit: {formatCurrency(project.totalProfit)}
          </span>
        </div>
      )}
    </Link>
  );
}
