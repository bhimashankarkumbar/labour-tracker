/**
 * Format number as Indian Rupee currency
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date to readable string
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format datetime
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get payment status badge class
 */
export const getPaymentStatusBadge = (status) => {
  switch (status) {
    case 'PAID': return 'badge-green';
    case 'PARTIALLY_PAID': return 'badge-yellow';
    case 'UNPAID': return 'badge-red';
    default: return 'badge-gray';
  }
};

/**
 * Get payment status display text
 */
export const getPaymentStatusText = (status) => {
  switch (status) {
    case 'PAID': return 'Paid';
    case 'PARTIALLY_PAID': return 'Partial';
    case 'UNPAID': return 'Unpaid';
    default: return status;
  }
};

/**
 * Extract error message from Axios error
 */
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.message) return error.message;
  return 'An unexpected error occurred';
};

/**
 * Get work status badge class
 */
export const getWorkStatusBadge = (status) => {
  switch (status) {
    case 'ONGOING': return 'badge-blue';
    case 'COMPLETED': return 'badge-green';
    default: return 'badge-gray';
  }
};

/**
 * Get worker status badge class
 */
export const getWorkerStatusBadge = (status) => {
  switch (status) {
    case 'ACTIVE': return 'badge-green';
    case 'INACTIVE': return 'badge-red';
    default: return 'badge-gray';
  }
};

/**
 * Format large numbers compactly
 */
export const formatCompactNumber = (num) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
};
