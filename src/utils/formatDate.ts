export function formatDate(date: Date | string | number): string {
  const dateObject = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObject);
}
