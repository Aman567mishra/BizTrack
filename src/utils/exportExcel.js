import * as XLSX from 'xlsx';
import { formatDate } from './format';
import { format } from 'date-fns';

function parseFilterDates(filters = {}) {
  const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
  const toDate = filters.toDate
    ? new Date(`${filters.toDate}T23:59:59.999`)
    : null;
  return { fromDate, toDate };
}

function inDateRange(dateStr, fromDate, toDate) {
  if (!dateStr) return !fromDate && !toDate;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  if (fromDate && d < fromDate) return false;
  if (toDate && d > toDate) return false;
  return true;
}

/** Projects with payments/expenses/splits limited to date range */
export function scopeProjectsForExport(projects, filters = {}) {
  const { fromDate, toDate } = parseFilterDates(filters);
  return (projects || []).map((p) => ({
    ...p,
    payments: (p.payments || []).filter((pay) =>
      inDateRange(pay.date, fromDate, toDate)
    ),
    expenses: (p.expenses || []).filter((exp) =>
      inDateRange(exp.date, fromDate, toDate)
    ),
    splits: (p.splits || []).filter((s) => inDateRange(s.date, fromDate, toDate)),
  }));
}

function projectContext(project) {
  return {
    'Project Name': project.projectName || '',
    Customer: project.customerName || '',
    'Work Type': project.workType || '',
    Status: project.status || '',
    'Deal Amount': Number(project.dealAmount || 0),
    'Total Received': Number(project.totalReceived || 0),
    'Total Pending': Number(project.totalPending || 0),
    'Total Expenses': Number(project.totalExpenses || 0),
    'Total Split': Number(project.totalSplit || 0),
    'Total Profit': Number(project.totalProfit || 0),
    'Start Date': formatDate(project.startDate),
    'Completion Date': formatDate(project.completionDate),
  };
}

export function projectToRow(p) {
  return {
    ...projectContext(p),
    Notes: p.notes || '',
    'Payment Count': (p.payments || []).length,
    'Expense Count': (p.expenses || []).length,
    'Split Count': (p.splits || []).length,
  };
}

export function buildPaymentRows(projects) {
  const rows = [];
  projects.forEach((project) => {
    (project.payments || []).forEach((pay) => {
      rows.push({
        ...projectContext(project),
        'Payment Amount': Number(pay.amount || 0),
        'Payment Date': formatDate(pay.date),
        'Payment Notes': pay.notes || '',
      });
    });
  });
  return rows;
}

export function buildExpenseRows(projects) {
  const rows = [];
  projects.forEach((project) => {
    (project.expenses || []).forEach((exp) => {
      rows.push({
        ...projectContext(project),
        Item: exp.item || '',
        Reason: exp.reason || '',
        Cost: Number(exp.cost || 0),
        'Expense Date': formatDate(exp.date),
      });
    });
  });
  return rows;
}

export function buildSplitRows(projects) {
  const rows = [];
  projects.forEach((project) => {
    (project.splits || []).forEach((s) => {
      rows.push({
        ...projectContext(project),
        Person: s.person || '',
        'Split Amount': Number(s.amount || 0),
        'Split Date': formatDate(s.date),
        'Split Notes': s.notes || '',
      });
    });
  });
  return rows;
}

function computePeriodTotals(scopedProjects) {
  let received = 0;
  let expenses = 0;
  let split = 0;
  let paymentCount = 0;
  let expenseCount = 0;
  let splitCount = 0;

  scopedProjects.forEach((p) => {
    (p.payments || []).forEach((pay) => {
      received += Number(pay.amount || 0);
      paymentCount += 1;
    });
    (p.expenses || []).forEach((exp) => {
      expenses += Number(exp.cost || 0);
      expenseCount += 1;
    });
    (p.splits || []).forEach((s) => {
      split += Number(s.amount || 0);
      splitCount += 1;
    });
  });

  return {
    received,
    expenses,
    split,
    profit: received - expenses - split,
    paymentCount,
    expenseCount,
    splitCount,
    projectCount: scopedProjects.length,
  };
}

function buildSummaryRows(filters, totals, scopedTotals, projects) {
  const { fromDate, toDate } = parseFilterDates(filters);
  return [
    { Field: 'Report Generated', Value: format(new Date(), 'dd MMM yyyy HH:mm') },
    { Field: 'From Date', Value: filters.fromDate || 'All' },
    { Field: 'To Date', Value: filters.toDate || 'All' },
    { Field: 'Project Filter', Value: filters.projectId === 'all' ? 'All' : filters.projectId },
    { Field: 'Customer Filter', Value: filters.customer || 'All' },
    { Field: 'Status Filter', Value: filters.status || 'All' },
    { Field: '---', Value: '---' },
    { Field: 'Projects in Report', Value: projects.length },
    { Field: 'Payments in Period', Value: scopedTotals.paymentCount },
    { Field: 'Expenses in Period', Value: scopedTotals.expenseCount },
    { Field: 'Splits in Period', Value: scopedTotals.splitCount },
    { Field: 'Received (Period)', Value: scopedTotals.received },
    { Field: 'Expenses (Period)', Value: scopedTotals.expenses },
    { Field: 'Split (Period)', Value: scopedTotals.split },
    { Field: 'Profit (Period)', Value: scopedTotals.profit },
    { Field: '---', Value: '---' },
    { Field: 'All-Time Deal Value', Value: totals?.dealAmount ?? 0 },
    { Field: 'All-Time Received', Value: totals?.received ?? 0 },
    { Field: 'All-Time Pending', Value: totals?.pending ?? 0 },
    { Field: 'All-Time Profit', Value: totals?.profit ?? 0 },
  ];
}

export function exportProjectsToExcel(projects, filename = 'biztrack-report') {
  const rows = projects.map(projectToRow);
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Projects');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportRowsToExcel(rows, sheetName, filename) {
  const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Info: 'No data' }]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Multi-sheet workbook: summary + projects + payments + expenses + splits (+ monthly)
 * Transaction sheets respect from/to date on applied filters.
 */
export function exportFullReport({
  projects = [],
  filters = {},
  totals = {},
  chartData = [],
}) {
  const scoped = scopeProjectsForExport(projects, filters);
  const scopedTotals = computePeriodTotals(scoped);

  const wb = XLSX.utils.book_new();

  const appendSheet = (rows, name) => {
    const ws = XLSX.utils.json_to_sheet(
      rows.length ? rows : [{ Message: 'No records for selected filters' }]
    );
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
  };

  appendSheet(buildSummaryRows(filters, totals, scopedTotals, projects), 'Summary');
  appendSheet(projects.map(projectToRow), 'Projects');
  appendSheet(buildPaymentRows(scoped), 'Payments');
  appendSheet(buildExpenseRows(scoped), 'Expenses');
  appendSheet(buildSplitRows(scoped), 'Splits');

  if (chartData?.length) {
    appendSheet(
      chartData.map((row) => ({
        Month: row.month,
        Profit: row.profit,
        Received: row.received,
        Expenses: row.investment,
        Split: row.split,
        Pending: row.pending,
      })),
      'Monthly'
    );
  }

  const from = filters.fromDate || 'all';
  const to = filters.toDate || 'all';
  XLSX.writeFile(wb, `biztrack-full-report-${from}-to-${to}.xlsx`);
}
