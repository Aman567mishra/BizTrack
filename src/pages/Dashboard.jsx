import { Link } from 'react-router-dom';
import {
  HiOutlineFolderOpen,
  HiOutlineBanknotes,
  HiOutlineReceiptPercent,
  HiOutlineClock,
  HiOutlineChartPie,
  HiOutlineUsers,
} from 'react-icons/hi2';
import { useAuth } from '../hooks/useAuth';
import { useDashboardData } from '../hooks/useDataCache';
import StatCard from '../components/ui/StatCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DashboardCharts from '../components/charts/DashboardCharts';
import ProjectListItem from '../components/projects/ProjectListItem';
import Button from '../components/ui/Button';

export default function Dashboard() {
  const { profile } = useAuth();
  const { data, loading } = useDashboardData();

  const summaryFromProfile = profile
    ? {
        totalProjects: profile.totalProjects ?? 0,
        totalReceived: profile.totalReceived ?? 0,
        totalExpenses: profile.totalExpenses ?? 0,
        totalPending: profile.totalPending ?? 0,
        totalProfit: profile.totalProfit ?? 0,
        totalSplit: profile.totalSplit ?? 0,
      }
    : null;

  const { summary, recent, open, completed, chartData, allProjects } = data || {};
  const displaySummary = summary || summaryFromProfile;
  const recentList =
    recent?.length > 0 ? recent : (allProjects || []).slice(0, 5);
  const openList =
    open?.length > 0
      ? open
      : (allProjects || []).filter((p) => p.status === 'Open').slice(0, 5);
  const completedList =
    completed?.length > 0
      ? completed
      : (allProjects || []).filter((p) => p.status === 'Completed').slice(0, 5);

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500">Business overview at a glance</p>
        </div>
        <Link to="/projects">
          <Button>+ New Project</Button>
        </Link>
      </div>

      {loading && !data && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <LoadingSpinner size="sm" />
          Loading data…
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          title="Total Projects"
          value={displaySummary?.totalProjects ?? 0}
          icon={HiOutlineFolderOpen}
          isCurrency={false}
        />
        <StatCard
          title="Payments Received"
          value={displaySummary?.totalReceived ?? 0}
          icon={HiOutlineBanknotes}
          accent="emerald"
        />
        <StatCard
          title="Expenses / Investments"
          value={displaySummary?.totalExpenses ?? 0}
          icon={HiOutlineReceiptPercent}
          accent="amber"
        />
        <StatCard
          title="Pending Amount"
          value={displaySummary?.totalPending ?? 0}
          icon={HiOutlineClock}
          accent="rose"
        />
        <StatCard
          title="Total Profit"
          value={displaySummary?.totalProfit ?? 0}
          icon={HiOutlineChartPie}
          accent="violet"
        />
        <StatCard
          title="Total Split"
          value={displaySummary?.totalSplit ?? 0}
          icon={HiOutlineUsers}
          accent="slate"
        />
      </div>

      {!data && loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <DashboardCharts data={chartData} />
          <div className="grid gap-6 lg:grid-cols-3">
            <section className="rounded-2xl border border-border-light bg-card-light p-5 dark:border-border-dark dark:bg-card-dark">
              <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">
                Recent Projects
              </h2>
              <div className="space-y-2">
                {recentList?.length ? (
                  recentList.map((p) => <ProjectListItem key={p.id} project={p} compact />)
                ) : (
                  <p className="text-sm text-slate-500">No projects yet.</p>
                )}
              </div>
            </section>
            <section className="rounded-2xl border border-border-light bg-card-light p-5 dark:border-border-dark dark:bg-card-dark">
              <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">
                Open Projects
              </h2>
              <div className="space-y-2">
                {openList?.length ? (
                  openList.map((p) => <ProjectListItem key={p.id} project={p} compact />)
                ) : (
                  <p className="text-sm text-slate-500">No open projects.</p>
                )}
              </div>
            </section>
            <section className="rounded-2xl border border-border-light bg-card-light p-5 dark:border-border-dark dark:bg-card-dark">
              <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">Completed</h2>
              <div className="space-y-2">
                {completedList?.length ? (
                  completedList.map((p) => <ProjectListItem key={p.id} project={p} compact />)
                ) : (
                  <p className="text-sm text-slate-500">No completed projects.</p>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
