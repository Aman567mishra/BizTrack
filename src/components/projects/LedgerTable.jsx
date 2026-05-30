import { formatCurrency, formatDate } from '../../utils/format';
import Button from '../ui/Button';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';

export default function LedgerTable({
  columns,
  rows,
  totalLabel,
  totalValue,
  onEdit,
  onDelete,
  emptyMessage,
  readOnly = false,
}) {
  if (!rows?.length) {
    return <p className="py-6 text-center text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <div className="w-full min-w-0 space-y-4">
      {/* Mobile: card list (no horizontal page scroll) */}
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-xl border border-border-light bg-slate-50/50 p-4 dark:border-border-dark dark:bg-slate-800/30"
          >
            {columns.map((col) => (
              <div
                key={col.key}
                className="flex justify-between gap-2 border-b border-border-light py-2 last:border-0 dark:border-border-dark"
              >
                <span className="shrink-0 text-xs text-slate-500">{col.label}</span>
                <span className="min-w-0 text-right text-sm font-medium text-slate-800 dark:text-slate-200">
                  {col.render ? col.render(row) : row[col.key]}
                </span>
              </div>
            ))}
            {!readOnly && (onEdit || onDelete) && (
              <div className="mt-3 flex justify-end gap-2">
                {onEdit && (
                  <Button variant="ghost" className="!p-2" onClick={() => onEdit(row)}>
                    <HiOutlinePencil className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    className="!p-2 text-red-500"
                    onClick={() => onDelete(row)}
                  >
                    <HiOutlineTrash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: table scrolls inside its box only */}
      <div className="hidden w-full min-w-0 md:block">
        <div className="overflow-x-auto rounded-xl border border-border-light dark:border-border-dark">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 font-semibold whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
                {!readOnly && (
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {rows.map((row) => (
                <tr key={row.id} className="bg-card-light dark:bg-card-dark">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="max-w-[200px] truncate px-4 py-3 text-slate-700 dark:text-slate-300"
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {!readOnly && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-1">
                        {onEdit && (
                          <Button variant="ghost" className="!p-2" onClick={() => onEdit(row)}>
                            <HiOutlinePencil className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            className="!p-2 text-red-500"
                            onClick={() => onDelete(row)}
                          >
                            <HiOutlineTrash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalLabel && (
        <p className="text-right text-sm font-semibold text-slate-800 dark:text-white">
          {totalLabel}: {formatCurrency(totalValue)}
        </p>
      )}
    </div>
  );
}

export function formatLedgerDate(dateStr) {
  if (!dateStr) return '—';
  return formatDate(dateStr);
}
