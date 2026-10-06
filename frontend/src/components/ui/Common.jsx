import React from 'react';

/**
 * Loading spinner component
 */
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`spinner ${sizes[size]} ${className}`} />
  );
};

/**
 * Full page loading state
 */
export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-64">
    <div className="text-center">
      <Spinner size="lg" className="mx-auto mb-3" />
      <p className="text-slate-500 text-sm">Loading...</p>
    </div>
  </div>
);

/**
 * Empty state component
 */
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="empty-state">
    {Icon && (
      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={32} className="text-slate-500" />
      </div>
    )}
    <h3 className="text-lg font-semibold text-slate-300 mb-1">{title}</h3>
    {description && <p className="text-slate-500 text-sm mb-4 max-w-xs">{description}</p>}
    {action}
  </div>
);

/**
 * Error state component
 */
export const ErrorState = ({ message, onRetry }) => (
  <div className="empty-state">
    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4">
      <span className="text-3xl">⚠️</span>
    </div>
    <h3 className="text-lg font-semibold text-red-400 mb-1">Something went wrong</h3>
    <p className="text-slate-500 text-sm mb-4">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn btn-secondary">
        Try Again
      </button>
    )}
  </div>
);

/**
 * Confirmation dialog component
 */
export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', danger = false }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal max-w-sm w-full">
        <div className="modal-header">
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
        </div>
        <div className="modal-body">
          <p className="text-slate-400">{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className={danger ? 'btn btn-danger' : 'btn btn-primary'}
            onClick={() => { onConfirm(); onClose(); }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Stat card for dashboard
 */
export const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
  const colors = {
    blue: 'from-primary-600/20 to-primary-800/10 border-primary-500/20 text-primary-400',
    green: 'from-emerald-600/20 to-emerald-800/10 border-emerald-500/20 text-emerald-400',
    red: 'from-red-600/20 to-red-800/10 border-red-500/20 text-red-400',
    yellow: 'from-amber-600/20 to-amber-800/10 border-amber-500/20 text-amber-400',
    purple: 'from-purple-600/20 to-purple-800/10 border-purple-500/20 text-purple-400',
  };

  return (
    <div className={`card p-5 bg-gradient-to-br ${colors[color]} hover:-translate-y-0.5 transition-transform duration-200`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-100">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-current/10 flex items-center justify-center flex-shrink-0">
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
};
