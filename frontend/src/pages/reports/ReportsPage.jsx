import React, { useEffect, useState } from 'react';
import { BarChart2, RefreshCw } from 'lucide-react';
import { workService } from '../../services/workService';
import { workerService } from '../../services/workerService';
import { formatDate, formatCurrency, getPaymentStatusBadge, getPaymentStatusText, getErrorMessage } from '../../utils/formatters';
import { PageLoader, ErrorState } from '../../components/ui/Common';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ReportsPage = () => {
  const [workReport, setWorkReport] = useState([]);
  const [workerReport, setWorkerReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('work');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [worksData, workersData] = await Promise.all([
        workService.getAll({ size: 100 }),
        workerService.getAll({ size: 100 }),
      ]);

      // Work-wise report: get financial data per work
      const worksWithFinancials = worksData.content;
      setWorkReport(worksWithFinancials);

      setWorkerReport(workersData.content);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Chart data for work-wise report
  const workChartData = workReport.slice(0, 10).map(w => ({
    name: w.workName.length > 12 ? w.workName.substring(0, 12) + '...' : w.workName,
    Labour: Number(w.totalLabourCost || 0),
    Expenses: Number(w.totalOtherExpenses || 0),
    Paid: Number(w.totalPaid || 0),
    Unpaid: Number(w.totalUnpaid || 0),
  }));

  const tabs = [
    { key: 'work', label: 'Work-wise Report' },
    { key: 'worker', label: 'Worker-wise Report' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="text-slate-500 text-sm mt-0.5">Financial summaries and analytics</p>
        </div>
        <button className="btn btn-secondary" onClick={load}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-900 border border-slate-800 rounded-lg p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${activeTab === tab.key
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? <PageLoader /> : error ? <ErrorState message={error} onRetry={load} /> : (
        <>
          {/* Work-wise Report */}
          {activeTab === 'work' && (
            <div className="space-y-6">
              {/* Chart */}
              {workChartData.length > 0 && (
                <div className="card p-5">
                  <h3 className="text-sm font-semibold text-slate-300 mb-4">Work-wise Cost Overview</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={workChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }}
                        tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                      <Tooltip
                        contentStyle={{ background: '#0f172a', border: '1px solid #1e293b' }}
                        formatter={(v) => formatCurrency(v)}
                      />
                      <Legend />
                      <Bar dataKey="Labour" fill="#0ea5e9" radius={[4,4,0,0]} />
                      <Bar dataKey="Expenses" fill="#f59e0b" radius={[4,4,0,0]} />
                      <Bar dataKey="Paid" fill="#10b981" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Table */}
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Work</th>
                      <th>Status</th>
                      <th>Days</th>
                      <th>Workers</th>
                      <th>Labour Cost</th>
                      <th>Other Exp.</th>
                      <th>Total</th>
                      <th>Paid</th>
                      <th>Unpaid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workReport.map(w => (
                      <tr key={w.id}>
                        <td className="font-medium text-slate-200">{w.workName}</td>
                        <td>
                          <span className={`badge ${w.status === 'ONGOING' ? 'badge-blue' : 'badge-green'}`}>
                            {w.status}
                          </span>
                        </td>
                        <td>{w.totalWorkingDays}</td>
                        <td>{w.totalWorkersInvolved}</td>
                        <td className="text-currency">{formatCurrency(w.totalLabourCost)}</td>
                        <td className="text-currency">{formatCurrency(w.totalOtherExpenses)}</td>
                        <td className="text-currency font-semibold">{formatCurrency(w.totalExpense)}</td>
                        <td className="text-emerald-400 text-currency">{formatCurrency(w.totalPaid)}</td>
                        <td className="text-red-400 text-currency">{formatCurrency(w.totalUnpaid)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Worker-wise Report */}
          {activeTab === 'worker' && (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Days Worked</th>
                    <th>Total Earned</th>
                    <th>Total Paid</th>
                    <th>Balance Due</th>
                  </tr>
                </thead>
                <tbody>
                  {workerReport.map(w => (
                    <tr key={w.id}>
                      <td className="font-medium text-slate-200">{w.name}</td>
                      <td className="text-slate-500">{w.workerType || '-'}</td>
                      <td>
                        <span className={`badge ${w.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`}>
                          {w.status}
                        </span>
                      </td>
                      <td>{w.totalDaysWorked}</td>
                      <td className="text-currency">{formatCurrency(w.totalEarned)}</td>
                      <td className="text-emerald-400 text-currency">{formatCurrency(w.totalPaid)}</td>
                      <td className="text-red-400 text-currency font-semibold">{formatCurrency(w.totalUnpaid)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportsPage;
