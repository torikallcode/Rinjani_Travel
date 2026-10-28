export const CURRENCY = 'IDR';

export function formatCurrency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value) {
  return new Intl.NumberFormat('id-ID').format(Number(value || 0));
}

export function formatDate(value, options = {}) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date);
}

export function formatDateLong(value) {
  return formatDate(value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function toDateInput(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export const BOOKING_STATUS = {
  draft: { label: 'Draft', tone: 'neutral' },
  pending_payment: { label: 'Menunggu Pembayaran', tone: 'warning' },
  paid: { label: 'Dibayar', tone: 'info' },
  confirmed: { label: 'Terkonfirmasi', tone: 'success' },
  completed: { label: 'Selesai', tone: 'success' },
  cancelled: { label: 'Dibatalkan', tone: 'danger' },
  expired: { label: 'Kedaluwarsa', tone: 'neutral' },
  refunded: { label: 'Refund', tone: 'info' },
};

export const PAYMENT_STATUS = {
  pending: { label: 'Menunggu', tone: 'warning' },
  paid: { label: 'Lunas', tone: 'success' },
  failed: { label: 'Gagal', tone: 'danger' },
  expired: { label: 'Kedaluwarsa', tone: 'neutral' },
  refunded: { label: 'Refund', tone: 'info' },
};

export function statusMeta(map, value) {
  return map[value] || { label: value || '-', tone: 'neutral' };
}

export function packageImage(pkg) {
  const image = pkg?.image || pkg?.gallery?.[0] || '/img/mnt4.jpg';
  if (/^https?:\/\//.test(image)) return image;
  return image.startsWith('/') ? image : `/${image}`;
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
