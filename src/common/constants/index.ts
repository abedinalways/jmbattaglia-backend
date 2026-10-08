export const ISN_DEFAULTS = {
  DAYS_AHEAD: 7,
  SLOT_INTERVAL_MINUTES: 60,
  DEFAULT_DURATION_MINUTES: 180,
} as const;

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  DRAFT_CREATED: 'DRAFT_CREATED',
  SCHEDULED: 'SCHEDULED',
  FAILED: 'FAILED',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
