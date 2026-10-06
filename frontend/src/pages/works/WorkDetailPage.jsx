import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Calendar, Users, IndianRupee, ChevronDown,
  ChevronUp, CreditCard, Receipt, Trash2, Edit
} from 'lucide-react';
import { workService } from '../../services/workService';
import { workerService } from '../../services/workerService';
import { dailyWorkerService, paymentService } from '../../services/paymentService';
import { formatDate, formatCurrency, getPaymentStatusBadge, getPaymentStatusText, getErrorMessage } from '../../utils/formatters';
import { PageLoader, ErrorState, EmptyState, ConfirmDialog } from '../../components/ui/Common';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

// ---- Add Work Day Modal ----
const AddWorkDayModal = ({ isOpen, onClose, workId, onSuccess }) => {
  const [form, setForm] = useState({ workDate: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.workDate) { toast.error('Please select a date'); return; }
    setLoading(true);
    try {
      await workService.addDay(workId, form);
      toast.success('Working day added');
      setForm({ workDate: '', notes: '' });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Working Day"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner w-4 h-4" /> : 'Add Day'}
          </button>
        </>
      }>
      <div className="space-y-4">
        <div>
          <label className="label">Work Date *</label>
          <input type="date" value={form.workDate}
            onChange={e => setForm(f => ({ ...f, workDate: e.target.value }))}
            className="input" />
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            className="input resize-none min-h-16" placeholder="Optional notes" />
        </div>
      </div>
    </Modal>
  );
};

// ---- Assign Worker Modal ----
const AssignWorkerModal = ({ isOpen, onClose, workDayId, onSuccess }) => {
  const [workers, setWorkers] = useState([]);
  const [form, setForm] = useState({ workerId: '', dailyWage: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      workerService.getActive().then(setWorkers).catch(() => {});
    }
  }, [isOpen]);

  const handleWorkerChange = (e) => {
    const worker = workers.find(w => w.id === Number(e.target.value));
    setForm({ workerId: e.target.value, dailyWage: worker?.defaultWage || '' });
  };

  const handleSubmit = async () => {
    if (!form.workerId || !form.dailyWage) { toast.error('Select worker and enter wage'); return; }
    setLoading(true);
    try {
      await dailyWorkerService.assign(workDayId, {
        workerId: Number(form.workerId),
        dailyWage: Number(form.dailyWage),
      });
      toast.success('Worker assigned');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Worker"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner w-4 h-4" /> : 'Assign'}
          </button>
        </>
      }>
      <div className="space-y-4">
        <div>
          <label className="label">Select Worker *</label>
          <select value={form.workerId} onChange={handleWorkerChange} className="select">
            <option value="">Choose a worker...</option>
            {workers.map(w => (
              <option key={w.id} value={w.id}>{w.name} {w.phone ? `(${w.phone})` : ''}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Daily Wage (₹) *</label>
          <input type="number" min="0" step="0.01" value={form.dailyWage}
            onChange={e => setForm(f => ({ ...f, dailyWage: e.target.value }))}
            className="input" placeholder="Enter wage for this day" />
          <p className="text-xs text-slate-500 mt-1">Pre-filled from worker's default wage</p>
        </div>
      </div>
    </Modal>
  );
};

// ---- Record Payment Modal ----
const RecordPaymentModal = ({ isOpen, onClose, dailyWorker, onSuccess }) => {
  const [form, setForm] = useState({ amount: '', paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH', transactionReference: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const remaining = dailyWorker ? (Number(dailyWorker.remainingAmount) || 0) : 0;

  const handleSubmit = async () => {
    if (!form.amount || Number(form.amount) <= 0) { toast.error('Enter a valid amount'); return; }
    setLoading(true);
    try {
      await paymentService.record(dailyWorker.id, { ...form, amount: Number(form.amount) });
      toast.success('Payment recorded');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!dailyWorker) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Record Payment — ${dailyWorker.workerName}`}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner w-4 h-4" /> : 'Record Payment'}
          </button>
        </>
      }>
      <div className="space-y-4">
        <div className="p-3 bg-slate-800/50 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Daily Wage</span>
            <span className="text-currency font-semibold">{formatCurrency(dailyWorker.dailyWage)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-slate-400">Already Paid</span>
            <span className="text-emerald-400 text-currency">{formatCurrency(dailyWorker.totalPaid)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1 pt-1 border-t border-slate-700">
            <span className="text-slate-300 font-medium">Remaining</span>
            <span className="text-red-400 font-bold text-currency">{formatCurrency(remaining)}</span>
          </div>
        </div>

        <div>
          <label className="label">Amount (₹) *</label>
          <input type="number" min="0.01" max={remaining} step="0.01"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            className="input" placeholder={`Max: ₹${remaining}`} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Payment Date *</label>
            <input type="date" value={form.paymentDate}
              onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))}
              className="input" />
          </div>
          <div>
            <label className="label">Method</label>
            <select value={form.paymentMethod}
              onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
              className="select">
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Transaction Reference</label>
          <input value={form.transactionReference}
            onChange={e => setForm(f => ({ ...f, transactionReference: e.target.value }))}
            className="input" placeholder="UTR/UPI ID/Ref (optional)" />
        </div>
      </div>
    </Modal>
  );
};

// ---- Add Expense Modal ----
const AddExpenseModal = ({ isOpen, onClose, workId, onSuccess }) => {
  const [form, setForm] = useState({ category: 'MATERIALS', description: '', amount: '',
    expenseDate: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.amount || Number(form.amount) <= 0) { toast.error('Enter a valid amount'); return; }
    setLoading(true);
    try {
      await workService.addExpense(workId, { ...form, amount: Number(form.amount) });
      toast.success('Expense added');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Expense"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner w-4 h-4" /> : 'Add Expense'}
          </button>
        </>
      }>
      <div className="space-y-4">
        <div>
          <label className="label">Category</label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="select">
            {['MATERIALS','TRANSPORT','FOOD','EQUIPMENT','FUEL','ELECTRICITY','OTHER'].map(c => (
              <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Description</label>
          <input value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="input" placeholder="e.g., Cement - 50 bags" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Amount (₹) *</label>
            <input type="number" min="0.01" value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className="input" placeholder="Amount" />
          </div>
          <div>
            <label className="label">Date *</label>
            <input type="date" value={form.expenseDate}
              onChange={e => setForm(f => ({ ...f, expenseDate: e.target.value }))}
              className="input" />
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ---- Work Day Card ----
const WorkDayCard = ({ day, onRefresh }) => {
  const [expanded, setExpanded] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleRemoveDailyWorker = async (id) => {
    try {
      await dailyWorkerService.remove(id);
      toast.success('Worker removed');
      onRefresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const totalWage = day.dailyWorkers?.reduce((s, dw) => s + Number(dw.dailyWage), 0) || 0;

  return (
    <div className="card">
      {/* Day header */}
      <button
        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center">
            <span className="text-primary-400 font-bold text-sm">D{day.dayNumber}</span>
          </div>
          <div className="text-left">
            <p className="font-medium text-slate-200">{formatDate(day.workDate)}</p>
            <p className="text-xs text-slate-500">
              {day.dailyWorkers?.length || 0} worker{day.dailyWorkers?.length !== 1 ? 's' : ''} · {formatCurrency(totalWage)}
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-800">
          {day.notes && <p className="text-xs text-slate-500 mt-3 mb-2">{day.notes}</p>}

          {/* Workers table */}
          <div className="mt-3">
            {day.dailyWorkers?.length === 0 ? (
              <p className="text-slate-600 text-xs py-3 text-center">No workers assigned for this day</p>
            ) : (
              <div className="space-y-2">
                {day.dailyWorkers?.map(dw => (
                  <div key={dw.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{dw.workerName}</p>
                      <p className="text-xs text-slate-500 text-currency">
                        ₹{Number(dw.dailyWage).toLocaleString('en-IN')} total ·{' '}
                        <span className="text-emerald-400">₹{Number(dw.totalPaid).toLocaleString('en-IN')} paid</span> ·{' '}
                        <span className="text-red-400">₹{Number(dw.remainingAmount).toLocaleString('en-IN')} due</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${getPaymentStatusBadge(dw.paymentStatus)}`}>
                        {getPaymentStatusText(dw.paymentStatus)}
                      </span>
                      {dw.paymentStatus !== 'PAID' && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => setPaymentTarget(dw)}
                        >
                          <CreditCard size={12} /> Pay
                        </button>
                      )}
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteTarget(dw.id)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="btn btn-secondary btn-sm mt-3" onClick={() => setShowAssign(true)}>
            <Plus size={14} /> Assign Worker
          </button>
        </div>
      )}

      <AssignWorkerModal
        isOpen={showAssign}
        onClose={() => setShowAssign(false)}
        workDayId={day.id}
        onSuccess={onRefresh}
      />

      <RecordPaymentModal
        isOpen={!!paymentTarget}
        onClose={() => setPaymentTarget(null)}
        dailyWorker={paymentTarget}
        onSuccess={onRefresh}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleRemoveDailyWorker(deleteTarget)}
        title="Remove Worker"
        message="Remove this worker from this working day? Payments already recorded will be deleted."
        confirmText="Remove"
        danger
      />
    </div>
  );
};

// ---- Main Work Detail Page ----
const WorkDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [work, setWork] = useState(null);
  const [days, setDays] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddDay, setShowAddDay] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [deleteExpenseTarget, setDeleteExpenseTarget] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [workData, daysData, expensesData] = await Promise.all([
        workService.getById(id),
        workService.getDays(id),
        workService.getExpenses(id),
      ]);
      setWork(workData);
      setDays(daysData);
      setExpenses(expensesData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleDeleteExpense = async (expenseId) => {
    try {
      await workService.deleteExpense(expenseId);
      toast.success('Expense deleted');
      loadAll();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={loadAll} />;
  if (!work) return null;

  return (
    <div className="animate-fade-in">
      {/* Back + Header */}
      <button onClick={() => navigate('/works')} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Works
      </button>

      <div className="page-header flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="page-title">{work.workName}</h1>
            <span className={`badge ${work.status === 'ONGOING' ? 'badge-blue' : 'badge-green'}`}>
              {work.status}
            </span>
          </div>
          {work.clientName && <p className="text-slate-500 text-sm">Client: {work.clientName}</p>}
          {work.location && <p className="text-slate-500 text-sm">📍 {work.location}</p>}
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => setShowAddExpense(true)}>
            <Receipt size={16} /> Add Expense
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddDay(true)}>
            <Plus size={16} /> Add Work Day
          </button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Working Days', value: work.totalWorkingDays, plain: true },
          { label: 'Workers', value: work.totalWorkersInvolved, plain: true },
          { label: 'Labour Cost', value: formatCurrency(work.totalLabourCost) },
          { label: 'Total Paid', value: formatCurrency(work.totalPaid), color: 'text-emerald-400' },
          { label: 'Total Due', value: formatCurrency(work.totalUnpaid), color: 'text-red-400' },
        ].map(({ label, value, color, plain }) => (
          <div key={label} className="card p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-xl font-bold ${color || 'text-slate-100'} ${!plain ? 'text-currency' : ''}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Work Days */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Calendar size={18} className="text-primary-400" />
            Working Days ({days.length})
          </h2>
        </div>

        {days.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No working days yet"
            description="Add the first working day to start assigning workers."
            action={<button className="btn btn-primary" onClick={() => setShowAddDay(true)}><Plus size={16} /> Add Day</button>}
          />
        ) : (
          <div className="space-y-3">
            {days.map(day => (
              <WorkDayCard key={day.id} day={day} onRefresh={loadAll} />
            ))}
          </div>
        )}
      </div>

      {/* Expenses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Receipt size={18} className="text-amber-400" />
            Other Expenses ({expenses.length}) · {formatCurrency(work.totalOtherExpenses)}
          </h2>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowAddExpense(true)}>
            <Plus size={14} /> Add
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="card p-6 text-center text-slate-600 text-sm">No other expenses recorded</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(exp => (
                  <tr key={exp.id}>
                    <td>
                      <span className="badge badge-gray">{exp.category}</span>
                    </td>
                    <td className="text-slate-400">{exp.description || '-'}</td>
                    <td className="text-currency font-semibold">{formatCurrency(exp.amount)}</td>
                    <td className="text-slate-500">{formatDate(exp.expenseDate)}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteExpenseTarget(exp.id)}>
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddWorkDayModal isOpen={showAddDay} onClose={() => setShowAddDay(false)} workId={id} onSuccess={loadAll} />
      <AddExpenseModal isOpen={showAddExpense} onClose={() => setShowAddExpense(false)} workId={id} onSuccess={loadAll} />
      <ConfirmDialog
        isOpen={!!deleteExpenseTarget}
        onClose={() => setDeleteExpenseTarget(null)}
        onConfirm={() => handleDeleteExpense(deleteExpenseTarget)}
        title="Delete Expense"
        message="Are you sure you want to delete this expense?"
        confirmText="Delete"
        danger
      />
    </div>
  );
};

export default WorkDetailPage;
