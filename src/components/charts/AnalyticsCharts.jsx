import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/format';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

function ChartCard({ title, children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-border-light bg-card-light p-5 dark:border-border-dark dark:bg-card-dark ${className}`}
    >
      <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-white">
        {title}
      </h3>
      <div className="h-64">{children}</div>
    </div>
  );
}

export default function AnalyticsCharts({
  chartData,
  statusBreakdown,
  categoryBreakdown,
  workTypeBreakdown,
}) {
  const statusData = Object.entries(statusBreakdown || {}).map(([name, value]) => ({
    name,
    value,
  }));
  const categoryData = Object.entries(categoryBreakdown || {}).map(([name, value]) => ({
    name,
    value,
  }));
  const workData = Object.entries(workTypeBreakdown || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const tooltipFmt = (v) => formatCurrency(v);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title="Profit Trend" className="lg:col-span-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={tooltipFmt} />
            <Legend />
            <Line type="monotone" dataKey="profit" stroke="#2563eb" strokeWidth={2} name="Profit" />
            <Line type="monotone" dataKey="received" stroke="#10b981" strokeWidth={2} name="Received" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Expenses vs Split">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={tooltipFmt} />
            <Legend />
            <Bar dataKey="investment" fill="#f59e0b" name="Expenses" />
            <Bar dataKey="split" fill="#8b5cf6" name="Split" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Pending vs Received">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={tooltipFmt} />
            <Bar dataKey="pending" fill="#ef4444" name="Pending" />
            <Bar dataKey="received" fill="#10b981" name="Received" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Project Status">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {statusData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Expense by Category">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ name }) => name}
            >
              {categoryData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={tooltipFmt} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Work Type Distribution" className="lg:col-span-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={workData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" name="Projects" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
