import { fetchAllProjects } from './projectService';
import { buildMonthlyChartDataFromProjects } from './dashboardService';

function inDateRange(dateStr, fromDate, toDate) {
  if (!dateStr) return true;
  const d = new Date(dateStr);
  if (fromDate && d < fromDate) return false;
  if (toDate && d > toDate) return false;
  return true;
}

function filterProjectTransactions(project, fromDate, toDate) {
  return {
    ...project,
    payments: (project.payments || []).filter((p) =>
      inDateRange(p.date, fromDate, toDate)
    ),
    expenses: (project.expenses || []).filter((e) =>
      inDateRange(e.date, fromDate, toDate)
    ),
    splits: (project.splits || []).filter((s) =>
      inDateRange(s.date, fromDate, toDate)
    ),
  };
}

export async function fetchAnalyticsData(userId, filters = {}) {
  const { fromDate, toDate, projectId, customer, status } = filters;

  let projects = await fetchAllProjects(userId);

  if (status && status !== 'All') {
    projects = projects.filter((p) => p.status === status);
  }
  if (projectId && projectId !== 'all') {
    projects = projects.filter((p) => p.id === projectId);
  }
  if (customer?.trim()) {
    const term = customer.toLowerCase();
    projects = projects.filter((p) =>
      p.customerName?.toLowerCase().includes(term)
    );
  }

  const filtered = projects.map((p) => filterProjectTransactions(p, fromDate, toDate));

  const totals = projects.reduce(
    (acc, p) => {
      acc.dealAmount += Number(p.dealAmount || 0);
      acc.received += Number(p.totalReceived || 0);
      acc.expenses += Number(p.totalExpenses || 0);
      acc.split += Number(p.totalSplit || 0);
      acc.profit += Number(p.totalProfit || 0);
      acc.pending += Number(p.totalPending || 0);
      if (p.status === 'Completed') acc.completed += 1;
      return acc;
    },
    {
      dealAmount: 0,
      received: 0,
      expenses: 0,
      split: 0,
      profit: 0,
      pending: 0,
      completed: 0,
      projectCount: projects.length,
    }
  );

  const chartData = buildMonthlyChartDataFromProjects(filtered);

  const statusBreakdown = projects.reduce((acc, p) => {
    const s = p.status || 'Open';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const categoryBreakdown = filtered.reduce((acc, p) => {
    (p.expenses || []).forEach((e) => {
      const c = e.reason || 'Other';
      acc[c] = (acc[c] || 0) + Number(e.cost || 0);
    });
    return acc;
  }, {});

  const workTypeBreakdown = projects.reduce((acc, p) => {
    const w = p.workType || 'Other';
    acc[w] = (acc[w] || 0) + 1;
    return acc;
  }, {});

  const allPayments = filtered.flatMap((p) =>
    (p.payments || []).map((pay) => ({ ...pay, projectId: p.id }))
  );
  const allExpenses = filtered.flatMap((p) =>
    (p.expenses || []).map((e) => ({ ...e, projectId: p.id }))
  );
  const allSplits = filtered.flatMap((p) =>
    (p.splits || []).map((s) => ({ ...s, projectId: p.id }))
  );

  return {
    projects,
    totals,
    chartData,
    statusBreakdown,
    categoryBreakdown,
    workTypeBreakdown,
    payments: allPayments,
    expenses: allExpenses,
    splits: allSplits,
  };
}
