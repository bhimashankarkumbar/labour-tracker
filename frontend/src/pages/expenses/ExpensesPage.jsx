import React, { useEffect, useState } from 'react';
import { Receipt, RefreshCw } from 'lucide-react';
import { workService } from '../../services/workService';
import { formatDate, formatCurrency, getErrorMessage } from '../../utils/formatters';
import { PageLoader, ErrorState, EmptyState } from '../../components/ui/Common';

const ExpensesPage = () => {
  const [works, setWorks] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const worksData = await workService.getAll({ size: 100 });
      const expensesPromises = worksData.content.map(w =>
        workService.getExpenses(w.id).catch(() => [])
      );
      const expenseArrays = await Promise.all(expensesPromises);
      setWorks(worksData.content);
      setAllExpenses(expenseArrays.flat().sort((a, b) =>
        new Date(b.expenseDate) - new Date(a.expenseDate)
      ));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = categoryFilter
    ? allExpenses.filter(e => e.category === categoryFilter)
    : allExpenses;

  const total = filtered.reduce((s, e) => s + Number(e.amount), 0);

  const CATEGORIES = ['MATERIALS','TRANSPORT','FOOD','EQUIPMENT','FUEL','ELECTRICITY','OTHER'];

  const getCategoryColor = (cat) => {
    const map = {
      MATERIALS: 'badge-blue', TRANSPORT: 'badge-yellow', FOOD: 'badge-green',
      EQUIPMENT: 'badge-purple', FUEL: 'badge-red', ELECTRICITY: 'badge-yellow', OTHER: 'badge-gray'
    };
    return map[cat] || 'badge-gray';
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {filtered.length} expenses · Total: {formatCurrency(total)}
          </p>
        </div>
        <button className="btn btn-secondary" onClick={load}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="select w-48">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
        </select>
      </div>

      <div className="card p-4 mb-6 bg-amber-500/5 border-amber-500/20">
        <p className="text-xs text-amber-400">
          💡 Add expenses from inside a Work detail page by clicking "Add Expense".
        </p>
      </div>

      {loading ? <PageLoader /> : error ? <ErrorState message={error} onRetry={load} /> :
        filtered.length === 0 ? (
          <EmptyState icon={Receipt} title="No expenses found"
            description="Expenses are added per work from the Work detail page." />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Work</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Added By</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(exp => (
                  <tr key={exp.id}>
                    <td className="font-medium text-slate-200">{exp.workName}</td>
                    <td>
                      <span className={`badge ${getCategoryColor(exp.category)}`}>{exp.category}</span>
                    </td>
                    <td className="text-slate-400">{exp.description || '-'}</td>
                    <td className="font-semibold text-currency text-amber-400">{formatCurrency(exp.amount)}</td>
                    <td className="text-slate-500">{formatDate(exp.expenseDate)}</td>
                    <td className="text-slate-500">{exp.createdByName || '-'}</td>
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

export default ExpensesPage;
