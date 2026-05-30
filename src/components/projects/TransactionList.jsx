import { formatCurrency, formatDate } from '../../utils/format';
import Button from '../ui/Button';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';

export default function TransactionList({
  items,
  columns,
  onEdit,
  onDelete,
  emptyMessage,
}) {
  if (!items?.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">{emptyMessage}</p>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-light bg-slate-50/50 px-4 py-3 dark:border-border-dark dark:bg-slate-800/30"
        >
          <div className="flex-1">
            {columns.map((col) => (
              <div key={col.key} className="text-sm">
                {col.label && (
                  <span className="text-slate-500">{col.label}: </span>
                )}
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {col.render ? col.render(item) : item[col.key]}
                </span>
              </div>
            ))}
            {item.timestamp && (
              <p className="mt-1 text-xs text-slate-500">
                {formatDate(item.timestamp)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-semibold text-slate-900 dark:text-white">
              {formatCurrency(item.amount)}
            </span>
            {onEdit && (
              <Button variant="ghost" className="!p-2" onClick={() => onEdit(item)}>
                <HiOutlinePencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" className="!p-2 text-red-500" onClick={() => onDelete(item)}>
                <HiOutlineTrash className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
