import { EventStatus } from "@/lib/constants/event";

export type EventVisibilityFields = {
  visiblePublic: boolean;
  visibleMembers: boolean;
  status: string;
};

/** Lifecycle statuses that represent a live (non-draft) event. */
export function isActiveEventStatus(status: string): boolean {
  return (
    status === EventStatus.PUBLISHED || status === EventStatus.COMPLETED
  );
}

/** Shown on the public website (homepage, /events for guests, gallery filters). */
export function isEventPubliclyVisible(event: EventVisibilityFields): boolean {
  return event.visiblePublic && isActiveEventStatus(event.status);
}

/** Shown to approved members (includes public events). */
export function isEventVisibleToMember(event: EventVisibilityFields): boolean {
  return (
    (event.visiblePublic || event.visibleMembers) &&
    isActiveEventStatus(event.status)
  );
}

export function canViewEvent(
  event: EventVisibilityFields,
  viewer: { isAdmin: boolean; isApproved: boolean },
): boolean {
  if (viewer.isAdmin) return true;
  if (viewer.isApproved) return isEventVisibleToMember(event);
  return isEventPubliclyVisible(event);
}

/** @deprecated Use isEventPubliclyVisible — kept for gradual migration. */
export function isEventVisibleOnSite(status: string): boolean {
  return isActiveEventStatus(status);
}

export const PUBLIC_EVENT_STATUSES = [
  EventStatus.PUBLISHED,
  EventStatus.COMPLETED,
] as const;

export function publicEventsWhere() {
  return {
    visiblePublic: true,
    status: { in: [...PUBLIC_EVENT_STATUSES] },
  };
}

export function memberEventsWhere() {
  return {
    OR: [{ visiblePublic: true }, { visibleMembers: true }],
    status: { in: [...PUBLIC_EVENT_STATUSES] },
  };
}

/** Maps admin visibility checkboxes + dates to stored fields. */
export function resolveEventFromVisibilityForm(
  visiblePublic: boolean,
  visibleMembers: boolean,
  existingStatus: string,
  startDate: Date,
  endDate: Date | null,
): { visiblePublic: boolean; visibleMembers: boolean; status: string } {
  if (existingStatus === EventStatus.CANCELLED) {
    return { visiblePublic, visibleMembers, status: EventStatus.CANCELLED };
  }

  if (!visiblePublic && !visibleMembers) {
    return {
      visiblePublic: false,
      visibleMembers: false,
      status: EventStatus.DRAFT,
    };
  }

  const eventEnd = endDate ?? startDate;
  const status =
    eventEnd.getTime() < Date.now()
      ? EventStatus.COMPLETED
      : EventStatus.PUBLISHED;

  return { visiblePublic, visibleMembers, status };
}
