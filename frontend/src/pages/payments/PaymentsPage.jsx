import React, { useEffect, useState } from 'react';
import { CreditCard, RefreshCw } from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { formatDate, formatCurrency, getErrorMessage } from '../../utils/formatters';
import { PageLoader, ErrorState, EmptyState } from '../../components/ui/Common';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await paymentService.getRecent(50);
      setPayments(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totalAmount = payments.reduce((s, p) => s + Number(p.amount), 0);

  const getMethodBadge = (method) => {
    const classes = {
      CASH: 'badge-green',
      UPI: 'badge-blue',
      BANK_TRANSFER: 'badge-purple',
      OTHER: 'badge-gray',
    };
    return classes[method] || 'badge-gray';
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {payments.length} recent transactions · Total: {formatCurrency(totalAmount)}
          </p>
        </div>
        <button className="btn btn-secondary" onClick={load}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="card p-4 mb-6 bg-amber-500/5 border-amber-500/20">
        <p className="text-xs text-amber-400">
          💡 To record a payment, navigate to a Work → select a Working Day → click "Pay" next to a worker.
        </p>
      </div>

      {loading ? <PageLoader /> : error ? <ErrorState message={error} onRetry={load} /> :
        payments.length === 0 ? (
          <EmptyState icon={CreditCard} title="No payments recorded"
            description="Payments are recorded per worker per working day." />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Work</th>
                  <th>Work Date</th>
                  <th>Amount</th>
                  <th>Payment Date</th>
                  <th>Method</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td className="font-medium text-slate-200">{p.workerName}</td>
                    <td className="text-slate-400">{p.workName}</td>
                    <td className="text-slate-500">{formatDate(p.workDate)}</td>
                    <td className="text-emerald-400 font-semibold text-currency">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="text-slate-500">{formatDate(p.paymentDate)}</td>
                    <td>
                      <span className={`badge ${getMethodBadge(p.paymentMethod)}`}>
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="text-slate-500 text-xs">{p.transactionReference || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  );
};

export default PaymentsPage;
