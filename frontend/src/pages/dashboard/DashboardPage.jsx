import React, { useEffect, useState } from 'react';
import {
  Briefcase, Users, CreditCard, TrendingUp, TrendingDown,
  IndianRupee, Clock, CheckCircle, AlertCircle, Receipt
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { paymentService } from '../../services/paymentService';
import { formatCurrency, formatDate, getPaymentStatusBadge, getPaymentStatusText } from '../../utils/formatters';
import { StatCard, PageLoader, ErrorState } from '../../components/ui/Common';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const DashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dash, payments] = await Promise.all([
        dashboardService.get(),
        paymentService.getRecent(5),
      ]);
      setDashboard(dash);
      setRecentPayments(payments);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  const expenseBreakdown = [
    { name: 'Labour', value: Number(dashboard.totalLabourCost || 0) },
    { name: 'Other', value: Number(dashboard.totalOtherExpenses || 0) },
  ];

  const paymentBreakdown = [
    { name: 'Paid', value: Number(dashboard.totalPaid || 0) },
    { name: 'Unpaid', value: Number(dashboard.totalUnpaid || 0) },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Overview of all labour tracking activities</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Active Works"
          value={dashboard.activeWorks}
          icon={Briefcase}
          color="blue"
          subtitle={`${dashboard.completedWorks} completed`}
        />
        <StatCard
          title="Active Workers"
          value={dashboard.activeWorkers}
          icon={Users}
          color="green"
          subtitle={`${dashboard.totalWorkers} total`}
        />
        <StatCard
          title="Total Labour Cost"
          value={formatCurrency(dashboard.totalLabourCost)}
          icon={IndianRupee}
          color="yellow"
        />
        <StatCard
          title="Pending Payments"
          value={dashboard.pendingPaymentsCount}
          icon={AlertCircle}
          color="red"
          subtitle="assignments with balance"
        />
      </div>

      {/* Financial cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-5 border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-emerald-400" />
            <span className="text-sm text-slate-400">Total Paid</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400 text-currency">
            {formatCurrency(dashboard.totalPaid)}
          </p>
        </div>
        <div className="card p-5 border-red-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-red-400" />
            <span className="text-sm text-slate-400">Total Unpaid</span>
          </div>
          <p className="text-2xl font-bold text-red-400 text-currency">
            {formatCurrency(dashboard.totalUnpaid)}
          </p>
        </div>
        <div className="card p-5 border-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Receipt size={16} className="text-amber-400" />
            <span className="text-sm text-slate-400">Total Expenses</span>
          </div>
          <p className="text-2xl font-bold text-amber-400 text-currency">
            {formatCurrency(dashboard.totalExpense)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            This month: {formatCurrency(dashboard.currentMonthExpense)}
          </p>
        </div>
      </div>

      {/* Charts + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Expense Breakdown</h3>
          {expenseBreakdown.every(d => d.value === 0) ? (
            <div className="h-48 flex items-center justify-center text-slate-600 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  paddingAngle={5} dataKey="value">
                  {expenseBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Payment Status */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Payment Status</h3>
          {paymentBreakdown.every(d => d.value === 0) ? (
            <div className="h-48 flex items-center justify-center text-slate-600 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={paymentBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  paddingAngle={5} dataKey="value">
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Payments */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Recent Payments</h3>
          {recentPayments.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-8">No payments recorded yet</p>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{p.workerName}</p>
                    <p className="text-xs text-slate-500">{p.workName} · {formatDate(p.paymentDate)}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-400 text-currency">
                    {formatCurrency(p.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
