/** Profit = received - expenses - split */
export function calculateProfit(received, expenses, split) {
  return Number(received || 0) - Number(expenses || 0) - Number(split || 0);
}

/** Pending = deal - received */
export function calculatePending(dealAmount, received) {
  return Number(dealAmount || 0) - Number(received || 0);
}

export function computeProjectTotals(project) {
  const dealAmount = Number(project.dealAmount || 0);
  const totalReceived = Number(project.totalReceived || 0);
  const totalExpenses = Number(project.totalExpenses || 0);
  const totalSplit = Number(project.totalSplit || 0);
  return {
    totalReceived,
    totalExpenses,
    totalSplit,
    totalProfit: calculateProfit(totalReceived, totalExpenses, totalSplit),
    totalPending: calculatePending(dealAmount, totalReceived),
  };
}

export function emptyUserSummary() {
  return {
    totalProjects: 0,
    totalReceived: 0,
    totalExpenses: 0,
    totalPending: 0,
    totalProfit: 0,
    totalSplit: 0,
  };
}
