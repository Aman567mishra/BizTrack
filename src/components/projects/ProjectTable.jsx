import { Link } from 'react-router-dom';
import { formatCurrency, formatDate, statusColor } from '../../utils/format';

export default function ProjectTable({ projects }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border-light dark:border-border-dark">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50">
          <tr>
            <th className="px-4 py-3 font-semibold">Project</th>
            <th className="px-4 py-3 font-semibold">Customer</th>
            <th className="px-4 py-3 font-semibold">Deal</th>
            <th className="px-4 py-3 font-semibold">Received</th>
            <th className="px-4 py-3 font-semibold">Pending</th>
            <th className="px-4 py-3 font-semibold">Profit</th>
            <th className="px-4 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light dark:divide-border-dark">
          {projects.map((p) => (
            <tr
              key={p.id}
              className="bg-card-light transition hover:bg-slate-50 dark:bg-card-dark dark:hover:bg-slate-800/50"
            >
              <td className="px-4 py-3">
                <Link
                  to={`/projects/${p.id}`}
                  className="font-medium text-brand-600 hover:underline dark:text-brand-400"
                >
                  {p.projectName}
                </Link>
                <p className="text-xs text-slate-500">{formatDate(p.createdAt)}</p>
              </td>
              <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                {p.customerName}
              </td>
              <td className="px-4 py-3 font-mono text-sm">
                {formatCurrency(p.dealAmount)}
              </td>
              <td className="px-4 py-3 font-mono text-sm text-emerald-600 dark:text-emerald-400">
                {formatCurrency(p.totalReceived)}
              </td>
              <td className="px-4 py-3 font-mono text-sm text-amber-600 dark:text-amber-400">
                {formatCurrency(p.totalPending)}
              </td>
              <td className="px-4 py-3 font-mono text-sm font-semibold">
                {formatCurrency(p.totalProfit)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(p.status)}`}
                >
                  {p.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
