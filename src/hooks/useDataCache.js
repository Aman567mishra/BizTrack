import { useEffect } from 'react';
import { useDataStore } from '../context/dataStore';
import { useAuth } from './useAuth';

function listKey(statusFilter, search) {
  return `${statusFilter || 'All'}|${(search || '').trim().toLowerCase()}`;
}

function filterClientList(projects, statusFilter, search) {
  let list = projects || [];
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

export function useDashboardData() {
  const { user } = useAuth();
  const dashboard = useDataStore((s) => s.dashboard);
  const loading = useDataStore((s) => s.dashboardLoading);
  const loadDashboard = useDataStore((s) => s.loadDashboard);

  useEffect(() => {
    if (user?.uid) loadDashboard(user.uid);
  }, [user?.uid, loadDashboard]);

  return {
    data: dashboard,
    loading: loading && !dashboard,
    refresh: () => user?.uid && loadDashboard(user.uid, { force: true }),
  };
}

export function useProjectsList(statusFilter, search) {
  const { user } = useAuth();
  const key = listKey(statusFilter, search);
  const cached = useDataStore((s) => s.projectsList[key]);
  const allProjects = useDataStore((s) => s.allProjects);
  const loading = useDataStore((s) => s.projectsListLoading[key]);
  const allLoading = useDataStore((s) => s.allProjectsLoading);
  const loadProjectsPage = useDataStore((s) => s.loadProjectsPage);
  const loadAllProjects = useDataStore((s) => s.loadAllProjects);
  const invalidateBusinessData = useDataStore((s) => s.invalidateBusinessData);

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      await loadAllProjects(user.uid);
      await loadProjectsPage(user.uid, { statusFilter, search, force: true });
    })();
  }, [user?.uid, statusFilter, search, loadProjectsPage, loadAllProjects]);

  const projects =
    cached?.projects?.length > 0
      ? cached.projects
      : filterClientList(allProjects, statusFilter, search);

  return {
    projects,
    hasMore: cached?.hasMore ?? false,
    loading: (Boolean(loading) || Boolean(allLoading)) && !projects.length,
    loadMore: () => {},
    reload: async () => {
      invalidateBusinessData();
      if (user?.uid) {
        await loadAllProjects(user.uid, { force: true });
        await loadProjectsPage(user.uid, { statusFilter, search, force: true });
      }
    },
    updateProjectInList: (updated) => {
      if (!updated?.id) return;
      useDataStore.setState((s) => {
        const nextList = { ...s.projectsList };
        Object.keys(nextList).forEach((k) => {
          nextList[k] = {
            ...nextList[k],
            projects: nextList[k].projects.map((p) =>
              p.id === updated.id ? { ...p, ...updated } : p
            ),
          };
        });
        return { projectsList: nextList };
      });
      useDataStore.getState().setProjectCache(updated);
    },
  };
}

export function useProjectDetail(projectId) {
  const cached = useDataStore((s) => s.projectDetails[projectId]);
  const loading = useDataStore((s) => s.projectDetailsLoading[projectId]);
  const loadProjectDetail = useDataStore((s) => s.loadProjectDetail);
  const refreshProjectDetail = useDataStore((s) => s.refreshProjectDetail);
  const setProjectCache = useDataStore((s) => s.setProjectCache);

  useEffect(() => {
    if (projectId) loadProjectDetail(projectId);
  }, [projectId, loadProjectDetail]);

  const project = cached?.project ?? null;

  return {
    project,
    payments: project?.payments ?? cached?.payments ?? [],
    expenses: project?.expenses ?? cached?.expenses ?? [],
    splits: project?.splits ?? cached?.splits ?? [],
    loading: Boolean(loading) && !project,
    refresh: async () => {
      const entry = await refreshProjectDetail(projectId);
      return entry?.project;
    },
    setCachedProject: (updated) => setProjectCache(updated),
  };
}

export function useAnalyticsData(filters, { autoLoad = true } = {}) {
  const { user } = useAuth();
  const key = JSON.stringify(filters);
  const data = useDataStore((s) => s.analytics[key]);
  const loading = useDataStore((s) => s.analyticsLoading[key]);
  const loadAnalytics = useDataStore((s) => s.loadAnalytics);

  useEffect(() => {
    if (autoLoad && user?.uid) loadAnalytics(user.uid, filters);
  }, [user?.uid, autoLoad, loadAnalytics, key]);

  return {
    data,
    loading: Boolean(loading) && !data,
    applyFilters: (override) =>
      user?.uid && loadAnalytics(user.uid, override || filters, { force: true }),
  };
}
