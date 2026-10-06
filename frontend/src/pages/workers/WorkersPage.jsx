import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, Phone, Edit, Eye, UserX, UserCheck, IndianRupee } from 'lucide-react';
import { workerService } from '../../services/workerService';
import { formatCurrency, getWorkerStatusBadge, getErrorMessage } from '../../utils/formatters';
import { PageLoader, ErrorState, EmptyState, ConfirmDialog } from '../../components/ui/Common';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const WorkerFormModal = ({ isOpen, onClose, worker, onSuccess }) => {
  const isEdit = !!worker;
  const [form, setForm] = useState({
    name: worker?.name || '',
    phone: worker?.phone || '',
    workerType: worker?.workerType || '',
    defaultWage: worker?.defaultWage || '',
    address: worker?.address || '',
    notes: worker?.notes || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (form.defaultWage && Number(form.defaultWage) <= 0) errs.defaultWage = 'Wage must be positive';
    return errs;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = {
      ...form,
      defaultWage: form.defaultWage ? Number(form.defaultWage) : null,
    };

    setLoading(true);
    try {
      if (isEdit) {
        await workerService.update(worker.id, payload);
        toast.success('Worker updated');
      } else {
        await workerService.create(payload);
        toast.success('Worker created');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}
      title={isEdit ? 'Edit Worker' : 'Add New Worker'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner w-4 h-4" /> : (isEdit ? 'Update' : 'Add Worker')}
          </button>
        </>
      }>
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name *</label>
            <input name="name" value={form.name} onChange={handleChange}
              className={`input ${errors.name ? 'input-error' : ''}`}
              placeholder="Worker name" />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>
          <div>
            <label className="label">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange}
              className="input" placeholder="Mobile number" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Worker Type</label>
            <input name="workerType" value={form.workerType} onChange={handleChange}
              className="input" placeholder="e.g., Mason, Helper" />
          </div>
          <div>
            <label className="label">Default Wage (₹)</label>
            <input type="number" name="defaultWage" value={form.defaultWage}
              onChange={handleChange}
              className={`input ${errors.defaultWage ? 'input-error' : ''}`}
              placeholder="Default daily wage" />
            {errors.defaultWage && <p className="error-text">{errors.defaultWage}</p>}
          </div>
        </div>
        <div>
          <label className="label">Address</label>
          <input name="address" value={form.address} onChange={handleChange}
            className="input" placeholder="Worker address" />
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange}
            className="input resize-none min-h-16" placeholder="Any additional notes" />
        </div>
        {isEdit && (
          <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
            ⚠ Changing the default wage will NOT affect historical daily wages already recorded.
          </p>
        )}
      </form>
    </Modal>
  );
};

const WorkersPage = () => {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [pagination, setPagination] = useState({ totalElements: 0, totalPages: 0, pageNumber: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editWorker, setEditWorker] = useState(null);
  const [statusChangeTarget, setStatusChangeTarget] = useState(null);

  const loadWorkers = async (page = 0) => {
    setLoading(true);
    setError(null);
    try {
      const data = await workerService.getAll({ search, status: statusFilter, page, size: 12 });
      setWorkers(data.content);
      setPagination({ totalElements: data.totalElements, totalPages: data.totalPages, pageNumber: data.pageNumber });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWorkers(); }, [search, statusFilter]);

  const handleStatusToggle = async (worker) => {
    try {
      if (worker.status === 'ACTIVE') {
        await workerService.deactivate(worker.id);
        toast.success(`${worker.name} deactivated`);
      } else {
        await workerService.activate(worker.id);
        toast.success(`${worker.name} activated`);
      }
      loadWorkers();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Workers</h1>
          <p className="text-slate-500 text-sm mt-0.5">{pagination.totalElements} workers total</p>
        </div>
        <button id="add-worker-btn" className="btn btn-primary" onClick={() => { setEditWorker(null); setShowModal(true); }}>
          <Plus size={18} /> Add Worker
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search by name or phone..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-10" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="select w-40">
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {loading ? <PageLoader /> : error ? <ErrorState message={error} onRetry={loadWorkers} /> :
        workers.length === 0 ? (
          <EmptyState icon={Users} title="No workers found"
            description="Add your first worker to start tracking."
            action={<button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Worker</button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {workers.map(worker => (
              <div key={worker.id} className="card p-5 hover:border-slate-700 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-primary-600/20 flex items-center justify-center">
                        <span className="text-primary-400 font-bold text-sm">
                          {worker.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-100">{worker.name}</h3>
                        {worker.workerType && <p className="text-xs text-slate-500">{worker.workerType}</p>}
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${getWorkerStatusBadge(worker.status)}`}>
                    {worker.status}
                  </span>
                </div>

                {worker.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                    <Phone size={11} /> {worker.phone}
                  </div>
                )}

                {worker.defaultWage && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                    <IndianRupee size={11} /> Default wage: {formatCurrency(worker.defaultWage)}/day
                  </div>
                )}

                {/* Financials */}
                <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Days</p>
                    <p className="text-sm font-bold text-slate-200">{worker.totalDaysWorked}</p>
                  </div>
                  <div className="text-center border-x border-slate-700">
                    <p className="text-xs text-slate-500">Earned</p>
                    <p className="text-sm font-bold text-slate-200 text-currency">{formatCurrency(worker.totalEarned)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Due</p>
                    <p className="text-sm font-bold text-red-400 text-currency">{formatCurrency(worker.totalUnpaid)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="btn btn-primary btn-sm flex-1"
                    onClick={() => navigate(`/workers/${worker.id}`)}>
                    <Eye size={14} /> View
                  </button>
                  <button className="btn btn-secondary btn-sm"
                    onClick={() => { setEditWorker(worker); setShowModal(true); }}>
                    <Edit size={14} />
                  </button>
                  <button
                    className={`btn btn-sm ${worker.status === 'ACTIVE' ? 'btn-danger' : 'btn-success'}`}
                    onClick={() => handleStatusToggle(worker)}
                    title={worker.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  >
                    {worker.status === 'ACTIVE' ? <UserX size={14} /> : <UserCheck size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      }

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button className="btn btn-secondary btn-sm"
            onClick={() => loadWorkers(pagination.pageNumber - 1)}
            disabled={pagination.pageNumber === 0}>Previous</button>
          <span className="text-sm text-slate-500">
            Page {pagination.pageNumber + 1} of {pagination.totalPages}
          </span>
          <button className="btn btn-secondary btn-sm"
            onClick={() => loadWorkers(pagination.pageNumber + 1)}
            disabled={pagination.pageNumber >= pagination.totalPages - 1}>Next</button>
        </div>
      )}

      <WorkerFormModal isOpen={showModal} onClose={() => setShowModal(false)}
        worker={editWorker} onSuccess={loadWorkers} />
    </div>
  );
};

export default WorkersPage;
