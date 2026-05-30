import { getUserProfile } from './userService';
import { queryUserProjects } from './projectService';
import { format, subMonths, startOfMonth } from 'date-fns';

function getMonthKey(dateStr) {
  try {
    const d = new Date(dateStr);
    return format(d, 'yyyy-MM');
  } catch {
    return '';
  }
}

function getMonthLabel(key) {
  if (!key) return '';
  const [y, m] = key.split('-');
  return format(new Date(Number(y), Number(m) - 1, 1), 'MMM yy');
}

export function buildMonthlyChartDataFromProjects(projects) {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    months.push(format(subMonths(new Date(), i), 'yyyy-MM'));
  }

  const received = Object.fromEntries(months.map((m) => [m, 0]));
  const investment = Object.fromEntries(months.map((m) => [m, 0]));
  const splitAmt = Object.fromEntries(months.map((m) => [m, 0]));
  const profit = Object.fromEntries(months.map((m) => [m, 0]));
  const pending = Object.fromEntries(months.map((m) => [m, 0]));

  projects.forEach((p) => {
    (p.payments || []).forEach((pay) => {
      const key = getMonthKey(pay.date);
      if (received[key] !== undefined) received[key] += Number(pay.amount || 0);
    });
    (p.expenses || []).forEach((exp) => {
      const key = getMonthKey(exp.date);
      if (investment[key] !== undefined) investment[key] += Number(exp.cost || 0);
    });
    (p.splits || []).forEach((s) => {
      const key = getMonthKey(s.date);
      if (splitAmt[key] !== undefined) splitAmt[key] += Number(s.amount || 0);
    });
    const createdKey = p.createdAt?.toDate
      ? format(p.createdAt.toDate(), 'yyyy-MM')
      : getMonthKey(p.startDate);
    if (pending[createdKey] !== undefined) {
      pending[createdKey] += Number(p.totalPending || 0);
    }
  });

  months.forEach((key) => {
    profit[key] = received[key] - investment[key] - splitAmt[key];
  });

  return months.map((key) => ({
    month: getMonthLabel(key),
    profit: profit[key],
    investment: investment[key],
    split: splitAmt[key],
    received: received[key],
    pending: pending[key],
  }));
}

export async function fetchDashboardData(userId) {
  const [summary, allProjects] = await Promise.all([
    getUserProfile(userId),
    queryUserProjects(userId),
  ]);

  const recent = allProjects.slice(0, 5);
  const open = allProjects.filter((p) => p.status === 'Open').slice(0, 5);
  const completed = allProjects.filter((p) => p.status === 'Completed').slice(0, 5);

  const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));
  const recentForCharts = allProjects.filter((p) => {
    const created = p.createdAt?.toDate?.() ?? new Date(0);
    return created >= sixMonthsAgo;
  });

  const chartData = buildMonthlyChartDataFromProjects(
    recentForCharts.length ? recentForCharts : allProjects
  );

  const totalsFromProjects = allProjects.reduce(
    (acc, p) => {
      acc.totalProjects += 1;
      acc.totalReceived += Number(p.totalReceived || 0);
      acc.totalExpenses += Number(p.totalExpenses || 0);
      acc.totalPending += Number(p.totalPending || 0);
      acc.totalProfit += Number(p.totalProfit || 0);
      acc.totalSplit += Number(p.totalSplit || 0);
      return acc;
    },
    {
      totalProjects: 0,
      totalReceived: 0,
      totalExpenses: 0,
      totalPending: 0,
      totalProfit: 0,
      totalSplit: 0,
    }
  );

  return {
    summary: {
      totalProjects: totalsFromProjects.totalProjects || summary?.totalProjects || 0,
      totalReceived: totalsFromProjects.totalReceived || summary?.totalReceived || 0,
      totalExpenses: totalsFromProjects.totalExpenses || summary?.totalExpenses || 0,
      totalPending: totalsFromProjects.totalPending || summary?.totalPending || 0,
      totalProfit: totalsFromProjects.totalProfit || summary?.totalProfit || 0,
      totalSplit: totalsFromProjects.totalSplit || summary?.totalSplit || 0,
    },
    recent,
    open,
    completed,
    chartData,
    allProjects,
  };
}
