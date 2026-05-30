import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/format';

const tooltipStyle = {
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  fontSize: '13px',
};

function ChartCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-border-light bg-card-light p-5 dark:border-border-dark dark:bg-card-dark">
      <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-white">
        {title}
      </h3>
      <div className="h-56">{children}</div>
    </div>
  );
}

const formatY = (v) =>
  v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`;

export default function DashboardCharts({ data }) {
  if (!data?.length) {
    return (
      <p className="text-center text-sm text-slate-500">No chart data yet.</p>
    );
  }

  const tooltipFormatter = (value) => formatCurrency(value);

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <ChartCard title="Monthly Profit">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={formatY} tick={{ fontSize: 11 }} />
            <Tooltip formatter={tooltipFormatter} contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Profit"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Investment (Expenses)">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={formatY} tick={{ fontSize: 11 }} />
            <Tooltip formatter={tooltipFormatter} contentStyle={tooltipStyle} />
            <Bar dataKey="investment" fill="#f59e0b" name="Expenses" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Split Amount">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={formatY} tick={{ fontSize: 11 }} />
            <Tooltip formatter={tooltipFormatter} contentStyle={tooltipStyle} />
            <Bar dataKey="split" fill="#8b5cf6" name="Split" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Received Amount">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={formatY} tick={{ fontSize: 11 }} />
            <Tooltip formatter={tooltipFormatter} contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="received"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Received"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Pending Amount">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={formatY} tick={{ fontSize: 11 }} />
            <Tooltip formatter={tooltipFormatter} contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="pending"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Pending"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Overview (All Metrics)">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={formatY} tick={{ fontSize: 11 }} />
            <Tooltip formatter={tooltipFormatter} contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="received" fill="#10b981" name="Received" />
            <Bar dataKey="profit" fill="#2563eb" name="Profit" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
