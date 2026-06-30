// Converts a Firestore timestamp (or Date) into a short relative string
// e.g. "now", "5m", "2h", "3d", then falls back to a date like "Mar 4".
export function timeAgo(ts) {
  if (!ts) return '';
  const date = ts?.toDate?.() || (ts instanceof Date ? ts : null);
  if (!date) return '';

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 30) return 'now';
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;

  // Older than ~a month: show an actual date
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}