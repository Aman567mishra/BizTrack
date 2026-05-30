import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi2';
import { useAuth } from '../hooks/useAuth';
import { useProjectDetail } from '../hooks/useDataCache';
import {
  updateProjectMeta,
  deleteProject,
  addPayment,
  updatePayment,
  deletePayment,
  addExpense,
  updateExpense,
  deleteExpense,
  addSplit,
  updateSplit,
  deleteSplit,
} from '../services/projectService';
import { syncAfterMutation } from '../utils/mutationSync';
import { isProjectLocked } from '../utils/projectLedger';
import { formatCurrency, formatDate, statusColor } from '../utils/format';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ProjectForm from '../components/projects/ProjectForm';
import PaymentForm from '../components/projects/PaymentForm';
import ExpenseForm from '../components/projects/ExpenseForm';
import SplitForm from '../components/projects/SplitForm';
import LedgerTable, { formatLedgerDate } from '../components/projects/LedgerTable';

function SummaryCard({ label, value, accent }) {
  return (
    <div className="min-w-0 rounded-xl border border-border-light bg-slate-50/80 p-3 sm:p-4 dark:border-border-dark dark:bg-slate-800/40">
      <p className="truncate text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
        {label}
      </p>
      <p
        className={`mt-1 truncate text-sm font-bold sm:text-lg ${accent || 'text-slate-900 dark:text-white'}`}
      >
        {value}
      </p>
    </div>
  );
}

export default function ProjectDetails() {
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { project, payments, expenses, splits, loading, refresh, setCachedProject } =
    useProjectDetail(projectId);
  const [modal, setModal] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const locked = project ? isProjectLocked(project.status) : false;

  useEffect(() => {
    const action = searchParams.get('action');
    if (!action || !project || locked) return;
    if (['payment', 'expense', 'split'].includes(action)) {
      setEditingItem(null);
      setModal(action);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, project, locked, setSearchParams]);

  const afterSave = async (updated) => {
    setCachedProject(updated);
    await syncAfterMutation(projectId);
    await refresh();
  };

  if (loading && !project) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500">Project not found.</p>
        <Link to="/projects" className="mt-4 inline-block text-brand-600">
          Back to projects
        </Link>
      </div>
    );
  }

  const handleUpdateProject = async (form) => {
    setSaving(true);
    try {
      const updated = await updateProjectMeta(user.uid, project.id, form, project);
      setModal(null);
      await afterSave(updated);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project and all records?')) return;
    await deleteProject(user.uid, project);
    await syncAfterMutation();
    navigate('/projects');
  };

  const handlePayment = async (form) => {
    setSaving(true);
    try {
      const updated = editingItem
        ? await updatePayment(user.uid, project, editingItem.id, form)
        : await addPayment(user.uid, project, form);
      closeModal();
      await afterSave(updated);
    } finally {
      setSaving(false);
    }
  };

  const handleExpense = async (form) => {
    setSaving(true);
    try {
      const updated = editingItem
        ? await updateExpense(user.uid, project, editingItem.id, form)
        : await addExpense(user.uid, project, form);
      closeModal();
      await afterSave(updated);
    } finally {
      setSaving(false);
    }
  };

  const handleSplit = async (form) => {
    setSaving(true);
    try {
      const updated = editingItem
        ? await updateSplit(user.uid, project, editingItem.id, form)
        : await addSplit(user.uid, project, form);
      closeModal();
      await afterSave(updated);
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setModal(null);
    setEditingItem(null);
  };

  const openAdd = (type) => {
    if (locked) return;
    setEditingItem(null);
    setModal(type);
  };

  return (
    <div className="animate-fade-in w-full min-w-0 max-w-full space-y-6 overflow-x-hidden sm:space-y-8">
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <Link
            to="/projects"
            className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"
          >
            <HiOutlineArrowLeft className="h-4 w-4" />
            Projects
          </Link>
          <h1 className="break-words text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
            {project.projectName}
          </h1>
          <p className="text-slate-500">Complete project ledger</p>
          <span
            className={`mt-2 inline-flex rounded-full px-3 py-0.5 text-xs font-medium ${statusColor(project.status)}`}
          >
            {project.status}
          </span>
        </div>
        <div className="grid w-full min-w-0 grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:w-auto lg:shrink-0">
          {!locked && (
            <>
              <Button variant="outline" className="!px-3 !text-xs sm:!text-sm" onClick={() => openAdd('payment')}>
                Add Payment
              </Button>
              <Button variant="outline" className="!px-3 !text-xs sm:!text-sm" onClick={() => openAdd('expense')}>
                Add Expense
              </Button>
              <Button variant="outline" className="!px-3 !text-xs sm:!text-sm" onClick={() => openAdd('split')}>
                Add Split
              </Button>
            </>
          )}
          <Button variant="outline" className="!px-3 !text-xs sm:!text-sm" onClick={() => setModal('edit')}>
            Edit
          </Button>
          <Button variant="danger" className="!px-3 !text-xs sm:!text-sm" onClick={handleDeleteProject}>
            Delete
          </Button>
        </div>
      </div>

      {/* Project information */}
      <section className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-border-light bg-card-light p-4 sm:p-6 dark:border-border-dark dark:bg-card-dark">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Project Information
        </h2>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <div>
            <dt className="text-slate-500">Customer</dt>
            <dd className="font-medium text-slate-900 dark:text-white">{project.customerName}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Work Type</dt>
            <dd className="font-medium">{project.workType}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Start Date</dt>
            <dd className="font-medium">{formatDate(project.startDate)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Completion Date</dt>
            <dd className="font-medium">{formatDate(project.completionDate)}</dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-slate-500">Notes</dt>
            <dd className="font-medium">{project.notes || '—'}</dd>
          </div>
        </dl>
      </section>

      {/* Project summary + profit */}
      <section className="w-full min-w-0 max-w-full">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Project Summary & Profit
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <SummaryCard label="Deal Amount" value={formatCurrency(project.dealAmount)} />
          <SummaryCard
            label="Total Received"
            value={formatCurrency(project.totalReceived)}
            accent="text-emerald-600"
          />
          <SummaryCard
            label="Pending"
            value={formatCurrency(project.totalPending)}
            accent="text-amber-600"
          />
          <SummaryCard
            label="Total Expenses"
            value={formatCurrency(project.totalExpenses)}
            accent="text-orange-600"
          />
          <SummaryCard
            label="Total Split"
            value={formatCurrency(project.totalSplit)}
            accent="text-violet-600"
          />
          <SummaryCard
            label="Final Profit"
            value={formatCurrency(project.totalProfit)}
            accent="text-brand-600"
          />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Profit = Received − Expenses − Split · Pending = Deal − Received
        </p>
      </section>

      {/* Payments */}
      <section className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-border-light bg-card-light p-4 sm:p-6 dark:border-border-dark dark:bg-card-dark">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Payment History</h2>
          {!locked && (
            <Button variant="outline" className="!py-1.5 !text-xs" onClick={() => openAdd('payment')}>
              + Add Payment
            </Button>
          )}
        </div>
        <LedgerTable
          columns={[
            { key: 'date', label: 'Date', render: (r) => formatLedgerDate(r.date) },
            { key: 'amount', label: 'Amount', render: (r) => formatCurrency(r.amount) },
            { key: 'notes', label: 'Notes' },
          ]}
          rows={payments}
          totalLabel="Total Received"
          totalValue={project.totalReceived}
          emptyMessage="No payments recorded."
          readOnly={locked}
          onEdit={
            locked
              ? undefined
              : (row) => {
                  setEditingItem(row);
                  setModal('payment');
                }
          }
          onDelete={
            locked
              ? undefined
              : async (row) => {
                  if (!confirm('Delete this payment?')) return;
                  const updated = await deletePayment(user.uid, project, row.id);
                  await afterSave(updated);
                }
          }
        />
      </section>

      {/* Expenses */}
      <section className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-border-light bg-card-light p-4 sm:p-6 dark:border-border-dark dark:bg-card-dark">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Expense History</h2>
          {!locked && (
            <Button variant="outline" className="!py-1.5 !text-xs" onClick={() => openAdd('expense')}>
              + Add Expense
            </Button>
          )}
        </div>
        <LedgerTable
          columns={[
            { key: 'date', label: 'Date', render: (r) => formatLedgerDate(r.date) },
            { key: 'item', label: 'Item' },
            { key: 'reason', label: 'Reason' },
            { key: 'cost', label: 'Cost', render: (r) => formatCurrency(r.cost) },
          ]}
          rows={expenses}
          totalLabel="Total Expenses"
          totalValue={project.totalExpenses}
          emptyMessage="No expenses recorded."
          readOnly={locked}
          onEdit={
            locked
              ? undefined
              : (row) => {
                  setEditingItem(row);
                  setModal('expense');
                }
          }
          onDelete={
            locked
              ? undefined
              : async (row) => {
                  if (!confirm('Delete this expense?')) return;
                  const updated = await deleteExpense(user.uid, project, row.id);
                  await afterSave(updated);
                }
          }
        />
      </section>

      {/* Splits */}
      <section className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-border-light bg-card-light p-4 sm:p-6 dark:border-border-dark dark:bg-card-dark">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Split History</h2>
          {!locked && (
            <Button variant="outline" className="!py-1.5 !text-xs" onClick={() => openAdd('split')}>
              + Add Split
            </Button>
          )}
        </div>
        <LedgerTable
          columns={[
            { key: 'date', label: 'Date', render: (r) => formatLedgerDate(r.date) },
            { key: 'person', label: 'Person' },
            { key: 'amount', label: 'Amount', render: (r) => formatCurrency(r.amount) },
            { key: 'notes', label: 'Notes' },
          ]}
          rows={splits}
          totalLabel="Total Split"
          totalValue={project.totalSplit}
          emptyMessage="No split entries."
          readOnly={locked}
          onEdit={
            locked
              ? undefined
              : (row) => {
                  setEditingItem(row);
                  setModal('split');
                }
          }
          onDelete={
            locked
              ? undefined
              : async (row) => {
                  if (!confirm('Delete this split entry?')) return;
                  const updated = await deleteSplit(user.uid, project, row.id);
                  await afterSave(updated);
                }
          }
        />
      </section>

      <Modal open={modal === 'edit'} onClose={closeModal} title="Edit Project" size="lg">
        <ProjectForm
          isEdit
          initial={{
            projectName: project.projectName,
            customerName: project.customerName,
            workType: project.workType,
            dealAmount: project.dealAmount,
            status: project.status,
            startDate: project.startDate || '',
            completionDate: project.completionDate || '',
            notes: project.notes,
          }}
          onSubmit={handleUpdateProject}
          onCancel={closeModal}
          loading={saving}
        />
      </Modal>

      <Modal open={modal === 'payment'} onClose={closeModal} title={editingItem ? 'Edit Payment' : 'Add Payment'}>
        <PaymentForm initial={editingItem} onSubmit={handlePayment} onCancel={closeModal} loading={saving} />
      </Modal>

      <Modal open={modal === 'expense'} onClose={closeModal} title={editingItem ? 'Edit Expense' : 'Add Expense'}>
        <ExpenseForm initial={editingItem} onSubmit={handleExpense} onCancel={closeModal} loading={saving} />
      </Modal>

      <Modal open={modal === 'split'} onClose={closeModal} title={editingItem ? 'Edit Split' : 'Add Split'}>
        <SplitForm initial={editingItem} onSubmit={handleSplit} onCancel={closeModal} loading={saving} />
      </Modal>
    </div>
  );
}
