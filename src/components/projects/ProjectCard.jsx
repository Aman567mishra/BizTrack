import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineEllipsisVertical } from 'react-icons/hi2';
import { formatCurrency, statusColor } from '../../utils/format';
import { isProjectLocked } from '../../utils/projectLedger';

export default function ProjectCard({ project }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const locked = isProjectLocked(project.status);

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const go = (action) => {
    setMenuOpen(false);
    if (action === 'view') {
      navigate(`/projects/${project.id}`);
      return;
    }
    navigate(`/projects/${project.id}?action=${action}`);
  };

  return (
    <div className="relative rounded-2xl border border-border-light bg-card-light p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md dark:border-border-dark dark:bg-card-dark dark:hover:border-brand-700">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-900 dark:text-white">
            {project.projectName}
          </h3>
          <p className="text-sm text-slate-500">{project.customerName}</p>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Project actions"
          >
            <HiOutlineEllipsisVertical className="h-5 w-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-10 mt-1 w-44 overflow-hidden rounded-xl border border-border-light bg-white py-1 shadow-lg dark:border-border-dark dark:bg-slate-800">
              <button
                type="button"
                className="block w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                onClick={() => go('view')}
              >
                View Details
              </button>
              <button
                type="button"
                disabled={locked}
                className="block w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-700"
                onClick={() => go('payment')}
              >
                Add Payment
              </button>
              <button
                type="button"
                disabled={locked}
                className="block w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-700"
                onClick={() => go('expense')}
              >
                Add Expense
              </button>
              <button
                type="button"
                disabled={locked}
                className="block w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-700"
                onClick={() => go('split')}
              >
                Add Split
              </button>
            </div>
          )}
        </div>
      </div>

      <span
        className={`mt-3 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(project.status)}`}
      >
        {project.status}
      </span>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-slate-500">Deal</p>
          <p className="font-semibold text-slate-800 dark:text-white">
            {formatCurrency(project.dealAmount)}
          </p>
        </div>
        <div>
          <p className="text-slate-500">Received</p>
          <p className="font-semibold text-emerald-600">
            {formatCurrency(project.totalReceived)}
          </p>
        </div>
        <div>
          <p className="text-slate-500">Pending</p>
          <p className="font-semibold text-amber-600">
            {formatCurrency(project.totalPending)}
          </p>
        </div>
        <div>
          <p className="text-slate-500">Profit</p>
          <p className="font-semibold text-brand-600">
            {formatCurrency(project.totalProfit)}
          </p>
        </div>
      </div>
    </div>
  );
}
