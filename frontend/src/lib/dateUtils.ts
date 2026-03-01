import { format } from 'date-fns';

export function formatMovementDate(date: Date): string {
  return format(date, 'MMM dd, yyyy HH:mm');
}
