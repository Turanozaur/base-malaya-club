export const EventStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const;

export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus];

export const RegistrationStatus = {
  REGISTERED: "REGISTERED",
  WAITLISTED: "WAITLISTED",
  CANCELLED: "CANCELLED",
  ATTENDED: "ATTENDED",
  NO_SHOW: "NO_SHOW",
} as const;

export type RegistrationStatus = (typeof RegistrationStatus)[keyof typeof RegistrationStatus];

export const PaymentStatus = {
  NOT_REQUIRED: "NOT_REQUIRED",
  PENDING: "PENDING",
  PAID: "PAID",
  REFUNDED: "REFUNDED",
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const ObjectType = {
  BUILDING: "BUILDING",
  ANTENNA: "ANTENNA",
  SPAN: "SPAN",
  EARTH: "EARTH",
} as const;

export type ObjectType = (typeof ObjectType)[keyof typeof ObjectType];
