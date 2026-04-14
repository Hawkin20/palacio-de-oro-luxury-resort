interface StatusBadgeProps {
  status: 'available' | 'booked' | 'closed' | 'maintenance' | 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'preparing' | 'ready';
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    available: { bg: 'bg-green-900/40', text: 'text-green-300', label: 'Available' },
    booked: { bg: 'bg-red-900/40', text: 'text-red-300', label: 'Booked' },
    closed: { bg: 'bg-gray-800', text: 'text-gray-400', label: 'Closed' },
    maintenance: { bg: 'bg-yellow-900/40', text: 'text-yellow-300', label: 'Maintenance' },
    pending: { bg: 'bg-blue-900/40', text: 'text-blue-300', label: 'Pending' },
    confirmed: { bg: 'bg-green-900/40', text: 'text-green-300', label: 'Confirmed' },
    cancelled: { bg: 'bg-red-900/40', text: 'text-red-300', label: 'Cancelled' },
    completed: { bg: 'bg-green-900/40', text: 'text-green-300', label: 'Completed' },
    preparing: { bg: 'bg-yellow-900/40', text: 'text-yellow-300', label: 'Preparing' },
    ready: { bg: 'bg-blue-900/40', text: 'text-blue-300', label: 'Ready' },
  };

  const config = statusConfig[status] || statusConfig.available;
  const sizeClass = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-cinzel font-semibold ${sizeClass} ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
