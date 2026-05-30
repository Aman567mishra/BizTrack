import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS, PAGE_SIZE } from '../utils/constants';
import {
  entryId,
  normalizeProject,
  computeTotalsFromArrays,
} from '../utils/projectLedger';
import { adjustUserSummary } from './userService';
import { firestoreCall } from '../utils/network';

function summaryDelta(oldProject, newProject) {
  return {
    totalProjects: 0,
    totalReceived:
      Number(newProject.totalReceived || 0) - Number(oldProject?.totalReceived || 0),
    totalExpenses:
      Number(newProject.totalExpenses || 0) - Number(oldProject?.totalExpenses || 0),
    totalPending:
      Number(newProject.totalPending || 0) - Number(oldProject?.totalPending || 0),
    totalProfit:
      Number(newProject.totalProfit || 0) - Number(oldProject?.totalProfit || 0),
    totalSplit:
      Number(newProject.totalSplit || 0) - Number(oldProject?.totalSplit || 0),
  };
}

async function saveProject(userId, projectId, data, previous = null) {
  const normalized = normalizeProject({ ...data });
  const { id: _omit, ...fields } = normalized;
  const payload = {
    ...fields,
    updatedAt: serverTimestamp(),
  };
  await firestoreCall(
    () => updateDoc(doc(db, COLLECTIONS.PROJECTS, projectId), payload),
    'save project'
  );
  if (previous) {
    await adjustUserSummary(userId, summaryDelta(previous, normalized));
  }
  return { id: projectId, ...normalized };
}

export async function createProject(userId, data) {
  const payments = [];
  const initialAmount = Number(data.initialReceived || 0);
  if (initialAmount > 0) {
    payments.push({
      id: entryId(),
      amount: initialAmount,
      date: data.initialPaymentDate || new Date().toISOString().slice(0, 10),
      notes: data.initialPaymentNotes || 'Advance Payment',
    });
  }

  const draft = normalizeProject({
    userId,
    projectName: data.projectName,
    customerName: data.customerName,
    workType: data.workType,
    dealAmount: Number(data.dealAmount || 0),
    status: data.status || 'Open',
    notes: data.notes || '',
    startDate: data.startDate || '',
    completionDate: data.completionDate || '',
    payments,
    expenses: [],
    splits: [],
  });

  const payload = {
    ...draft,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await firestoreCall(
    () => addDoc(collection(db, COLLECTIONS.PROJECTS), payload),
    'create project'
  );
  const created = { id: ref.id, ...draft };
  await adjustUserSummary(userId, {
    totalProjects: 1,
    totalReceived: created.totalReceived,
    totalExpenses: created.totalExpenses,
    totalPending: created.totalPending,
    totalProfit: created.totalProfit,
    totalSplit: created.totalSplit,
  });
  return created;
}

export async function getProject(projectId) {
  const snap = await firestoreCall(
    () => getDoc(doc(db, COLLECTIONS.PROJECTS, projectId)),
    'project'
  );
  if (!snap.exists()) return null;
  return normalizeProject({ id: snap.id, ...snap.data() });
}

export async function updateProjectMeta(userId, projectId, data, previous) {
  const merged = normalizeProject({
    ...previous,
    projectName: data.projectName,
    customerName: data.customerName,
    workType: data.workType,
    dealAmount: Number(data.dealAmount ?? previous.dealAmount),
    status: data.status,
    notes: data.notes,
    startDate: data.startDate ?? previous.startDate,
    completionDate: data.completionDate ?? previous.completionDate,
    payments: previous.payments,
    expenses: previous.expenses,
    splits: previous.splits,
  });
  return saveProject(userId, projectId, merged, previous);
}

export async function deleteProject(userId, project) {
  await firestoreCall(
    () => deleteDoc(doc(db, COLLECTIONS.PROJECTS, project.id)),
    'delete project'
  );
  await adjustUserSummary(userId, {
    totalProjects: -1,
    totalReceived: -Number(project.totalReceived || 0),
    totalExpenses: -Number(project.totalExpenses || 0),
    totalPending: -Number(project.totalPending || 0),
    totalProfit: -Number(project.totalProfit || 0),
    totalSplit: -Number(project.totalSplit || 0),
  });
}

/* ——— Payments ——— */

export async function addPayment(userId, project, { amount, date, notes }) {
  const payments = [
    ...(project.payments || []),
    {
      id: entryId(),
      amount: Number(amount || 0),
      date: date || new Date().toISOString().slice(0, 10),
      notes: notes || '',
    },
  ];
  return saveProject(userId, project.id, { ...project, payments }, project);
}

export async function updatePayment(userId, project, paymentId, data) {
  const payments = (project.payments || []).map((p) =>
    p.id === paymentId
      ? {
          ...p,
          amount: Number(data.amount ?? p.amount),
          date: data.date ?? p.date,
          notes: data.notes ?? p.notes,
        }
      : p
  );
  return saveProject(userId, project.id, { ...project, payments }, project);
}

export async function deletePayment(userId, project, paymentId) {
  const payments = (project.payments || []).filter((p) => p.id !== paymentId);
  return saveProject(userId, project.id, { ...project, payments }, project);
}

/* ——— Expenses ——— */

export async function addExpense(userId, project, { item, reason, cost, date }) {
  const expenses = [
    ...(project.expenses || []),
    {
      id: entryId(),
      item: item || '',
      reason: reason || '',
      cost: Number(cost || 0),
      date: date || new Date().toISOString().slice(0, 10),
    },
  ];
  return saveProject(userId, project.id, { ...project, expenses }, project);
}

export async function updateExpense(userId, project, expenseId, data) {
  const expenses = (project.expenses || []).map((e) =>
    e.id === expenseId
      ? {
          ...e,
          item: data.item ?? e.item,
          reason: data.reason ?? e.reason,
          cost: Number(data.cost ?? e.cost),
          date: data.date ?? e.date,
        }
      : e
  );
  return saveProject(userId, project.id, { ...project, expenses }, project);
}

export async function deleteExpense(userId, project, expenseId) {
  const expenses = (project.expenses || []).filter((e) => e.id !== expenseId);
  return saveProject(userId, project.id, { ...project, expenses }, project);
}

/* ——— Splits ——— */

export async function addSplit(userId, project, { person, amount, date, notes }) {
  const splits = [
    ...(project.splits || []),
    {
      id: entryId(),
      person: person || '',
      amount: Number(amount || 0),
      date: date || new Date().toISOString().slice(0, 10),
      notes: notes || '',
    },
  ];
  return saveProject(userId, project.id, { ...project, splits }, project);
}

export async function updateSplit(userId, project, splitId, data) {
  const splits = (project.splits || []).map((s) =>
    s.id === splitId
      ? {
          ...s,
          person: data.person ?? s.person,
          amount: Number(data.amount ?? s.amount),
          date: data.date ?? s.date,
          notes: data.notes ?? s.notes,
        }
      : s
  );
  return saveProject(userId, project.id, { ...project, splits }, project);
}

export async function deleteSplit(userId, project, splitId) {
  const splits = (project.splits || []).filter((s) => s.id !== splitId);
  return saveProject(userId, project.id, { ...project, splits }, project);
}

/* ——— Queries ——— */

function projectSortTime(project) {
  if (project.createdAt?.toDate) return project.createdAt.toDate().getTime();
  if (project.updatedAt?.toDate) return project.updatedAt.toDate().getTime();
  if (project.startDate) return new Date(project.startDate).getTime();
  return 0;
}

/** Load all projects for user — ordered query with simple fallback (no index required) */
export async function queryUserProjects(userId) {
  try {
    const q = query(
      collection(db, COLLECTIONS.PROJECTS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await firestoreCall(() => getDocs(q), 'projects');
    return snap.docs.map((d) => normalizeProject({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('[BizTrack] Ordered project query failed, using fallback:', err?.code || err);
    const q = query(
      collection(db, COLLECTIONS.PROJECTS),
      where('userId', '==', userId)
    );
    const snap = await firestoreCall(() => getDocs(q), 'projects fallback');
    const projects = snap.docs.map((d) => normalizeProject({ id: d.id, ...d.data() }));
    projects.sort((a, b) => projectSortTime(b) - projectSortTime(a));
    return projects;
  }
}

export function filterProjects(projects, { statusFilter, search }) {
  let list = [...projects];
  if (statusFilter && statusFilter !== 'All') {
    list = list.filter((p) => p.status === statusFilter);
  }
  if (search?.trim()) {
    const term = search.toLowerCase();
    list = list.filter(
      (p) =>
        p.projectName?.toLowerCase().includes(term) ||
        p.customerName?.toLowerCase().includes(term)
    );
  }
  return list;
}

export async function fetchAllProjects(userId) {
  return queryUserProjects(userId);
}

export async function fetchProjects(userId, options = {}) {
  const { statusFilter, search, pageSize = PAGE_SIZE, pageOffset = 0 } = options;
  const all = await queryUserProjects(userId);
  const filtered = filterProjects(all, { statusFilter, search });
  const slice = filtered.slice(pageOffset, pageOffset + pageSize);
  return {
    projects: slice,
    pageOffset: pageOffset + slice.length,
    hasMore: pageOffset + pageSize < filtered.length,
  };
}

export async function fetchRecentProjects(userId, count = 5) {
  const all = await queryUserProjects(userId);
  return all.slice(0, count);
}

export async function fetchProjectsByStatus(userId, status, count = 5) {
  const all = await queryUserProjects(userId);
  return all.filter((p) => p.status === status).slice(0, count);
}
