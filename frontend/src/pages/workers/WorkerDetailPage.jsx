import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Briefcase, CreditCard, Clock, CheckCircle } from 'lucide-react';
import { workerService } from '../../services/workerService';
import { formatDate, formatCurrency, getPaymentStatusBadge, getPaymentStatusText, getErrorMessage } from '../../utils/formatters';
import { PageLoader, ErrorState } from '../../components/ui/Common';

const WorkerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [w, hist] = await Promise.all([
        workerService.getById(id),
        workerService.getHistory(id),
      ]);
      setWorker(w);
      setHistory(hist);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!worker) return null;

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate('/workers')}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Workers
      </button>

      {/* Worker Info */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-600/20 flex items-center justify-center flex-shrink-0">
            <span className="text-3xl font-bold text-primary-400">
              {worker.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-100">{worker.name}</h1>
              <span className={`badge ${worker.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`}>
                {worker.status}
              </span>
            </div>
            {worker.workerType && <p className="text-slate-400">{worker.workerType}</p>}
            {worker.phone && <p className="text-slate-500 text-sm">📞 {worker.phone}</p>}
            {worker.address && <p className="text-slate-500 text-sm">📍 {worker.address}</p>}
            {worker.defaultWage && (
              <p className="text-slate-500 text-sm">Default wage: {formatCurrency(worker.defaultWage)}/day</p>
            )}
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 text-center">
          <p className="text-xs text-slate-500 mb-1 flex items-center justify-center gap-1">
            <Calendar size={11} /> Days Worked
          </p>
          <p className="text-2xl font-bold text-slate-100">{worker.totalDaysWorked}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Total Earned</p>
          <p className="text-xl font-bold text-slate-100 text-currency">{formatCurrency(worker.totalEarned)}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-slate-500 mb-1 flex items-center justify-center gap-1">
            <CheckCircle size={11} className="text-emerald-400" /> Total Paid
          </p>
          <p className="text-xl font-bold text-emerald-400 text-currency">{formatCurrency(worker.totalPaid)}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-slate-500 mb-1 flex items-center justify-center gap-1">
            <Clock size={11} className="text-red-400" /> Total Due
          </p>
          <p className="text-xl font-bold text-red-400 text-currency">{formatCurrency(worker.totalUnpaid)}</p>
        </div>
      </div>

      {/* Work History */}
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Briefcase size={18} className="text-primary-400" /> Work History
        </h2>
        {history.length === 0 ? (
          <div className="card p-8 text-center text-slate-600">
            No work history found for this worker.
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Work</th>
                  <th>Date</th>
                  <th>Day #</th>
                  <th>Daily Wage</th>
                  <th>Paid</th>
                  <th>Remaining</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map(dw => (
                  <tr key={dw.id}>
                    <td className="font-medium text-slate-200">
                      <button
                        onClick={() => navigate(`/works/${dw.workId}`)}
                        className="hover:text-primary-400 transition-colors text-left"
                      >
                        {dw.workName}
                      </button>
                    </td>
                    <td className="text-slate-500">{formatDate(dw.workDate)}</td>
                    <td>Day {dw.dayNumber}</td>
                    <td className="text-currency font-semibold">{formatCurrency(dw.dailyWage)}</td>
                    <td className="text-emerald-400 text-currency">{formatCurrency(dw.totalPaid)}</td>
                    <td className="text-red-400 text-currency">{formatCurrency(dw.remainingAmount)}</td>
                    <td>
                      <span className={`badge ${getPaymentStatusBadge(dw.paymentStatus)}`}>
                        {getPaymentStatusText(dw.paymentStatus)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerDetailPage;
