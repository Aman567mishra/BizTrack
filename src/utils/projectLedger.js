import { calculateProfit, calculatePending } from './calculations';

export function entryId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function sumPayments(payments = []) {
  return payments.reduce((s, p) => s + Number(p.amount || 0), 0);
}

export function sumExpenses(expenses = []) {
  return expenses.reduce((s, e) => s + Number(e.cost ?? e.amount ?? 0), 0);
}

export function sumSplits(splits = []) {
  return splits.reduce((s, sp) => s + Number(sp.amount || 0), 0);
}

export function computeTotalsFromArrays(project) {
  const dealAmount = Number(project.dealAmount || 0);
  const payments = project.payments || [];
  const expenses = project.expenses || [];
  const splits = project.splits || [];
  const totalReceived = sumPayments(payments);
  const totalExpenses = sumExpenses(expenses);
  const totalSplit = sumSplits(splits);
  return {
    totalReceived,
    totalExpenses,
    totalSplit,
    totalProfit: calculateProfit(totalReceived, totalExpenses, totalSplit),
    totalPending: calculatePending(dealAmount, totalReceived),
  };
}

export function normalizeProject(doc) {
  const payments = (doc.payments || []).map((p) => ({
    id: p.id || entryId(),
    amount: Number(p.amount || 0),
    date: p.date || '',
    notes: p.notes || '',
  }));
  const expenses = (doc.expenses || []).map((e) => ({
    id: e.id || entryId(),
    item: e.item || '',
    reason: e.reason || e.category || '',
    cost: Number(e.cost ?? e.amount ?? 0),
    date: e.date || '',
  }));
  const splits = (doc.splits || []).map((s) => ({
    id: s.id || entryId(),
    person: s.person || s.personName || '',
    amount: Number(s.amount || 0),
    date: s.date || '',
    notes: s.notes || '',
  }));
  const base = {
    ...doc,
    payments,
    expenses,
    splits,
    dealAmount: Number(doc.dealAmount || 0),
  };
  return { ...base, ...computeTotalsFromArrays(base) };
}

export function isProjectLocked(status) {
  return status === 'Completed';
}
