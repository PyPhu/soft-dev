export const formatBanEndDate = (date: Date) => date.toISOString();

const isSameMonthAndYear = (a: Date, b: Date) =>
  a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

export function applyMonthlyResetIfNeeded(user: {
  cancellation_count?: number;
  last_cancellation_date?: Date | string | null;
}) {
  const now = new Date();
  if (!user.last_cancellation_date) {
    user.cancellation_count = user.cancellation_count ?? 0;
    return;
  }

  const last = new Date(user.last_cancellation_date);
  if (!isSameMonthAndYear(now, last)) {
    user.cancellation_count = 0;
  }
}

export function applyCancellationPenalty(user: {
  cancellation_count?: number;
  last_cancellation_date?: Date | null;
  ban_until?: Date | null;
}) {
  const now = new Date();
  applyMonthlyResetIfNeeded(user);

  const nextCount = (user.cancellation_count ?? 0) + 1;
  const banDays = nextCount;
  const banUntil = new Date(now);
  banUntil.setDate(banUntil.getDate() + banDays);

  user.cancellation_count = nextCount;
  user.last_cancellation_date = now;
  user.ban_until = banUntil;

  return {
    cancellationCount: nextCount,
    banUntil,
  };
}

export function getBanValidation(user: {
  ban_until?: Date | string | null;
}) {
  const now = new Date();
  const banUntil = user.ban_until ? new Date(user.ban_until) : null;
  const isBanned = Boolean(banUntil && banUntil > now);

  return {
    isBanned,
    banUntil,
  };
}
