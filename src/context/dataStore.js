import { create } from 'zustand';
import { fetchDashboardData } from '../services/dashboardService';
import { queryUserProjects, getProject } from '../services/projectService';
import { filterProjects } from '../services/projectService';
import { fetchAnalyticsData } from '../services/analyticsService';

function projectsListKey(statusFilter, search) {
  return `${statusFilter || 'All'}|${(search || '').trim().toLowerCase()}`;
}

function analyticsKey(filters) {
  return JSON.stringify(filters);
}

export const useDataStore = create((set, get) => ({
  dashboard: null,
  dashboardLoading: false,
  allProjects: null,
  allProjectsLoading: false,
  projectsList: {},
  projectsListLoading: {},
  projectDetails: {},
  projectDetailsLoading: {},
  analytics: {},
  analyticsLoading: {},

  clearAll: () =>
    set({
      dashboard: null,
      dashboardLoading: false,
      allProjects: null,
      allProjectsLoading: false,
      projectsList: {},
      projectsListLoading: {},
      projectDetails: {},
      projectDetailsLoading: {},
      analytics: {},
      analyticsLoading: {},
    }),

  invalidateBusinessData: (projectId = null) => {
    set((state) => {
      const next = {
        dashboard: null,
        allProjects: null,
        projectsList: {},
        analytics: {},
      };
      if (projectId) {
        const details = { ...state.projectDetails };
        delete details[projectId];
        next.projectDetails = details;
      } else {
        next.projectDetails = {};
      }
      return next;
    });
  },

  setProjectCache: (project) => {
    if (!project?.id) return;
    set((s) => {
      const allProjects = (s.allProjects || []).map((p) =>
        p.id === project.id ? { ...p, ...project } : p
      );
      return {
        allProjects: allProjects.length ? allProjects : s.allProjects,
        projectDetails: {
          ...s.projectDetails,
          [project.id]: {
            project,
            payments: project.payments || [],
            expenses: project.expenses || [],
            splits: project.splits || [],
          },
        },
      };
    });
  },

  loadAllProjects: async (userId, { force = false } = {}) => {
    const { allProjects, allProjectsLoading } = get();
    if (!force && allProjects?.length) return allProjects;
    if (allProjectsLoading) return allProjects || [];

    set({ allProjectsLoading: true });
    try {
      const projects = await queryUserProjects(userId);
      set({ allProjects: projects, allProjectsLoading: false });
      return projects;
    } catch (err) {
      console.error('[BizTrack] loadAllProjects failed:', err);
      set({ allProjectsLoading: false });
      return allProjects || [];
    }
  },

  loadDashboard: async (userId, { force = false } = {}) => {
    const { dashboard, dashboardLoading } = get();
    if (!force && dashboard) return dashboard;
    if (dashboardLoading) return dashboard;

    set({ dashboardLoading: true });
    try {
      const data = await fetchDashboardData(userId);
      set({
        dashboard: data,
        allProjects: data.allProjects || [],
        dashboardLoading: false,
      });
      return data;
    } catch (err) {
      console.error('[BizTrack] loadDashboard failed:', err);
      set({ dashboardLoading: false });
      return dashboard;
    }
  },

  loadProjectsPage: async (userId, { statusFilter, search, force = false }) => {
    const key = projectsListKey(statusFilter, search);

    if (!force && get().projectsList[key]?.projects?.length) {
      return get().projectsList[key];
    }

    set((s) => ({
      projectsListLoading: { ...s.projectsListLoading, [key]: true },
    }));

    try {
      const all = await queryUserProjects(userId);
      const filtered = filterProjects(all, { statusFilter, search });
      const entry = {
        projects: filtered,
        pageOffset: filtered.length,
        hasMore: false,
      };
      set((s) => ({
        allProjects: all,
        projectsList: { ...s.projectsList, [key]: entry },
        projectsListLoading: { ...s.projectsListLoading, [key]: false },
      }));
      return entry;
    } catch (err) {
      console.error('[BizTrack] loadProjectsPage failed:', err);
      set((s) => ({
        projectsListLoading: { ...s.projectsListLoading, [key]: false },
      }));
      return get().projectsList[key];
    }
  },

  loadProjectDetail: async (projectId, { force = false } = {}) => {
    const cached = get().projectDetails[projectId];
    if (!force && cached?.project) return cached;

    set((s) => ({
      projectDetailsLoading: { ...s.projectDetailsLoading, [projectId]: true },
    }));

    try {
      const project = await getProject(projectId);
      const entry = {
        project,
        payments: project?.payments || [],
        expenses: project?.expenses || [],
        splits: project?.splits || [],
      };
      set((s) => ({
        projectDetails: { ...s.projectDetails, [projectId]: entry },
        projectDetailsLoading: { ...s.projectDetailsLoading, [projectId]: false },
      }));
      return entry;
    } catch (err) {
      console.error('[BizTrack] loadProjectDetail failed:', err);
      set((s) => ({
        projectDetailsLoading: { ...s.projectDetailsLoading, [projectId]: false },
      }));
      return cached;
    }
  },

  refreshProjectDetail: async (projectId) => get().loadProjectDetail(projectId, { force: true }),

  loadAnalytics: async (userId, filters, { force = false } = {}) => {
    const key = analyticsKey(filters);
    const cached = get().analytics[key];
    if (!force && cached) return cached;

    set((s) => ({ analyticsLoading: { ...s.analyticsLoading, [key]: true } }));
    try {
      const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
      const toDate = filters.toDate
        ? new Date(filters.toDate + 'T23:59:59')
        : null;
      const data = await fetchAnalyticsData(userId, {
        fromDate,
        toDate,
        projectId: filters.projectId,
        customer: filters.customer,
        status: filters.status,
      });
      set((s) => ({
        analytics: { ...s.analytics, [key]: data },
        analyticsLoading: { ...s.analyticsLoading, [key]: false },
      }));
      return data;
    } catch {
      set((s) => ({
        analyticsLoading: { ...s.analyticsLoading, [key]: false },
      }));
      return cached;
    }
  },
}));
