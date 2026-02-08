export function compareTimeFromNow(date: Date | string) {
  const targetDate = new Date(date);
  const now = new Date();
  const diffMs = Math.abs(now.getTime() - targetDate.getTime());

  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const minutes = Math.floor(diffMs / (60 * 1000));

  return { days, minutes };
}
