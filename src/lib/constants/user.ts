export const UserStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const Role = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const Permission = {
  MEDIA_UPLOAD: "MEDIA_UPLOAD",
  EVENT_MANAGE: "EVENT_MANAGE",
  CONTENT_MANAGE: "CONTENT_MANAGE",
  USER_MANAGE: "USER_MANAGE",
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

export const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];
