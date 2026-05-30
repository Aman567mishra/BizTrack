import { useState } from 'react';
import { HiOutlineArrowDownTray } from 'react-icons/hi2';
import { useAnalyticsData } from '../hooks/useDataCache';
import { formatCurrency } from '../utils/format';
import {
  exportProjectsToExcel,
  exportRowsToExcel,
  buildPaymentRows,
  buildExpenseRows,
  buildSplitRows,
  exportFullReport,
  scopeProjectsForExport,
} from '../utils/exportExcel';
import AnalyticsCharts from '../components/charts/AnalyticsCharts';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { Input, Select } from '../components/ui/FormFields';
import { PROJECT_STATUSES } from '../utils/constants';
import { format, subMonths } from 'date-fns';

const defaultFilters = {
  fromDate: format(subMonths(new Date(), 6), 'yyyy-MM-dd'),
  toDate: format(new Date(), 'yyyy-MM-dd'),
  projectId: 'all',
  customer: '',
  status: 'All',
};

export default function Analytics() {
  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const { data, loading, applyFilters } = useAnalyticsData(appliedFilters);

  const handleApply = async () => {
    setAppliedFilters(filters);
    await applyFilters(filters);
  };

  const projects = data?.projects || [];
  const scopedProjects = scopeProjectsForExport(projects, appliedFilters);

  const exportHandlers = {
    fullReport: () =>
      exportFullReport({
        projects,
        filters: appliedFilters,
        totals: data?.totals,
        chartData: data?.chartData,
      }),
    projects: () => exportProjectsToExcel(projects, 'biztrack-projects'),
    profit: () =>
      exportProjectsToExcel(
        projects.filter((p) => Number(p.totalProfit) !== 0),
        'biztrack-profit-report'
      ),
    payments: () =>
      exportRowsToExcel(
        buildPaymentRows(scopedProjects),
        'Payments',
        'biztrack-payments'
      ),
    expenses: () =>
      exportRowsToExcel(
        buildExpenseRows(scopedProjects),
        'Expenses',
        'biztrack-expenses'
      ),
    splits: () =>
      exportRowsToExcel(buildSplitRows(scopedProjects), 'Splits', 'biztrack-splits'),
    monthly: () => {
      const rows = (data?.chartData || []).map((row) => ({
        Month: row.month,
        Profit: row.profit,
        Received: row.received,
        Expenses: row.investment,
        Split: row.split,
        Pending: row.pending,
      }));
      exportRowsToExcel(rows, 'Monthly', 'biztrack-monthly');
    },
    customers: () => {
      const byCustomer = {};
      (data?.projects || []).forEach((p) => {
        const c = p.customerName || 'Unknown';
        if (!byCustomer[c]) {
          byCustomer[c] = {
            Customer: c,
            Projects: 0,
            'Deal Amount': 0,
            'Received Amount': 0,
            'Pending Amount': 0,
            Expenses: 0,
            'Split Amount': 0,
            Profit: 0,
          };
        }
        byCustomer[c].Projects += 1;
        byCustomer[c]['Deal Amount'] += Number(p.dealAmount || 0);
        byCustomer[c]['Received Amount'] += Number(p.totalReceived || 0);
        byCustomer[c]['Pending Amount'] += Number(p.totalPending || 0);
        byCustomer[c].Expenses += Number(p.totalExpenses || 0);
        byCustomer[c]['Split Amount'] += Number(p.totalSplit || 0);
        byCustomer[c].Profit += Number(p.totalProfit || 0);
      });
      exportRowsToExcel(Object.values(byCustomer), 'Customers', 'biztrack-customers');
    },
    datewise: () => exportProjectsToExcel(scopedProjects, 'biztrack-datewise'),
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Analytics & Export
        </h1>
        <p className="text-slate-500">Reports, charts, and Excel exports</p>
      </div>

      <div className="rounded-2xl border border-border-light bg-card-light p-5 dark:border-border-dark dark:bg-card-dark">
        <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">Filters</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Input
            label="From Date"
            type="date"
            value={filters.fromDate}
            onChange={(e) => setFilters((f) => ({ ...f, fromDate: e.target.value }))}
          />
          <Input
            label="To Date"
            type="date"
            value={filters.toDate}
            onChange={(e) => setFilters((f) => ({ ...f, toDate: e.target.value }))}
          />
          <Select
            label="Project"
            value={filters.projectId}
            onChange={(e) => setFilters((f) => ({ ...f, projectId: e.target.value }))}
          >
            <option value="all">All Projects</option>
            {(data?.projects || []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectName}
              </option>
            ))}
          </Select>
          <Input
            label="Customer"
            value={filters.customer}
            onChange={(e) => setFilters((f) => ({ ...f, customer: e.target.value }))}
            placeholder="Filter by name"
          />
          <Select
            label="Status"
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="All">All</option>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-4">
          <Button onClick={handleApply} loading={loading}>
            Apply Filters
          </Button>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Total Profit', value: data?.totals?.profit },
              { label: 'Received', value: data?.totals?.received },
              { label: 'Expenses', value: data?.totals?.expenses },
              { label: 'Pending', value: data?.totals?.pending },
              { label: 'Split', value: data?.totals?.split },
              { label: 'Projects', value: data?.totals?.projectCount, currency: false },
              { label: 'Completed', value: data?.totals?.completed, currency: false },
              { label: 'Deal Value', value: data?.totals?.dealAmount },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-border-light bg-card-light p-4 dark:border-border-dark dark:bg-card-dark"
              >
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {item.currency === false
                    ? item.value ?? 0
                    : formatCurrency(item.value)}
                </p>
              </div>
            ))}
          </div>

          <AnalyticsCharts
            chartData={data?.chartData}
            statusBreakdown={data?.statusBreakdown}
            categoryBreakdown={data?.categoryBreakdown}
            workTypeBreakdown={data?.workTypeBreakdown}
          />

          <div className="rounded-2xl border border-border-light bg-card-light p-5 dark:border-border-dark dark:bg-card-dark">
            <h2 className="mb-2 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
              <HiOutlineArrowDownTray className="h-5 w-5" />
              Excel Export
            </h2>
            <p className="mb-4 text-sm text-slate-500">
              Uses applied date filters ({appliedFilters.fromDate} → {appliedFilters.toDate}).
              Full report includes all sheets: projects, payments, expenses, and splits.
            </p>
            <div className="mb-4">
              <Button onClick={exportHandlers.fullReport} className="w-full sm:w-auto">
                <HiOutlineArrowDownTray className="h-5 w-5" />
                Download Full Report (All Details)
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ['projects', 'Project Report'],
                ['profit', 'Profit Report'],
                ['payments', 'Payment Report'],
                ['expenses', 'Expense Report'],
                ['splits', 'Split Report'],
                ['monthly', 'Monthly Report'],
                ['customers', 'Customer Report'],
                ['datewise', 'Date-wise Report'],
              ].map(([key, label]) => (
                <Button key={key} variant="outline" onClick={exportHandlers[key]}>
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
