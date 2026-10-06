import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Briefcase, MapPin, Calendar, Eye } from 'lucide-react';
import { workService } from '../../services/workService';
import { formatDate, formatCurrency, getWorkStatusBadge, getErrorMessage } from '../../utils/formatters';
import { PageLoader, ErrorState, EmptyState, ConfirmDialog } from '../../components/ui/Common';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const WorkFormModal = ({ isOpen, onClose, work, onSuccess }) => {
  const isEdit = !!work;
  const [form, setForm] = useState({
    workName: work?.workName || '',
    clientName: work?.clientName || '',
    location: work?.location || '',
    startDate: work?.startDate || '',
    endDate: work?.endDate || '',
    status: work?.status || 'ONGOING',
    description: work?.description || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.workName.trim()) errs.workName = 'Work name is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      if (isEdit) {
        await workService.update(work.id, form);
        toast.success('Work updated successfully');
      } else {
        await workService.create(form);
        toast.success('Work created successfully');
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Work' : 'Create New Work'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner w-4 h-4" /> : (isEdit ? 'Update' : 'Create')}
          </button>
        </>
      }
    >
      <form className="space-y-4">
        <div>
          <label className="label">Work Name *</label>
          <input name="workName" value={form.workName} onChange={handleChange}
            className={`input ${errors.workName ? 'input-error' : ''}`}
            placeholder="e.g., House Construction" />
          {errors.workName && <p className="error-text">{errors.workName}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Client Name</label>
            <input name="clientName" value={form.clientName} onChange={handleChange}
              className="input" placeholder="Client name" />
          </div>
          <div>
            <label className="label">Location</label>
            <input name="location" value={form.location} onChange={handleChange}
              className="input" placeholder="Work location" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Start Date</label>
            <input type="date" name="startDate" value={form.startDate} onChange={handleChange}
              className="input" />
          </div>
          <div>
            <label className="label">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="select">
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange}
            className="input min-h-20 resize-none" placeholder="Work description (optional)" />
        </div>
      </form>
    </Modal>
  );
};

const WorksPage = () => {
  const navigate = useNavigate();
  const [works, setWorks] = useState([]);
  const [pagination, setPagination] = useState({ totalElements: 0, totalPages: 0, pageNumber: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editWork, setEditWork] = useState(null);

  const loadWorks = async (page = 0) => {
    setLoading(true);
    setError(null);
    try {
      const data = await workService.getAll({ search, status: statusFilter, page, size: 10 });
      setWorks(data.content);
      setPagination({ totalElements: data.totalElements, totalPages: data.totalPages, pageNumber: data.pageNumber });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWorks(); }, [search, statusFilter]);

  const openCreate = () => { setEditWork(null); setShowModal(true); };
  const openEdit = (work) => { setEditWork(work); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditWork(null); };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Works</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {pagination.totalElements} work{pagination.totalElements !== 1 ? 's' : ''} total
          </p>
        </div>
        <button id="create-work-btn" className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> New Work
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search works..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="select w-40">
          <option value="">All Status</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={loadWorks} />
      ) : works.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No works found"
          description="Create your first work to start tracking labour."
          action={<button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Create Work</button>}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {works.map(work => (
            <div key={work.id} className="card p-5 hover:border-slate-700 transition-all duration-200">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-100 truncate">{work.workName}</h3>
                  {work.clientName && (
                    <p className="text-xs text-slate-500 mt-0.5">{work.clientName}</p>
                  )}
                </div>
                <span className={`badge ${getWorkStatusBadge(work.status)} ml-2 flex-shrink-0`}>
                  {work.status === 'ONGOING' ? 'Ongoing' : 'Completed'}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-1.5 mb-4">
                {work.location && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin size={12} /> {work.location}
                  </div>
                )}
                {work.startDate && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar size={12} /> Started {formatDate(work.startDate)}
                  </div>
                )}
              </div>

              {/* Financial summary */}
              <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-slate-800/50 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-slate-500">Labour</p>
                  <p className="text-sm font-semibold text-slate-200 text-currency">
                    {formatCurrency(work.totalLabourCost)}
                  </p>
                </div>
                <div className="text-center border-x border-slate-700">
                  <p className="text-xs text-slate-500">Paid</p>
                  <p className="text-sm font-semibold text-emerald-400 text-currency">
                    {formatCurrency(work.totalPaid)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Due</p>
                  <p className="text-sm font-semibold text-red-400 text-currency">
                    {formatCurrency(work.totalUnpaid)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-primary btn-sm flex-1"
                  onClick={() => navigate(`/works/${work.id}`)}
                >
                  <Eye size={14} /> View Details
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => openEdit(work)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => loadWorks(pagination.pageNumber - 1)}
            disabled={pagination.pageNumber === 0}
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">
            Page {pagination.pageNumber + 1} of {pagination.totalPages}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => loadWorks(pagination.pageNumber + 1)}
            disabled={pagination.pageNumber >= pagination.totalPages - 1}
          >
            Next
          </button>
        </div>
      )}

      {/* Form Modal */}
      <WorkFormModal
        isOpen={showModal}
        onClose={closeModal}
        work={editWork}
        onSuccess={loadWorks}
      />
    </div>
  );
};

export default WorksPage;
