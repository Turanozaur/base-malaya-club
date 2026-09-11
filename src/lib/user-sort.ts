type NamedUser = {
  name?: string | null;
  email?: string | null;
};

/** Display name used for alphabetical sorting (name, then email). */
export function userDisplayName(user: NamedUser): string {
  const name = user.name?.trim();
  if (name) return name;
  return user.email?.trim() ?? "";
}

export function compareUsersByName(a: NamedUser, b: NamedUser): number {
  return userDisplayName(a).localeCompare(userDisplayName(b), "en", {
    sensitivity: "base",
  });
}

export function sortUsersByName<T extends NamedUser>(users: readonly T[]): T[] {
  return [...users].sort(compareUsersByName);
}

export function sortByUserName<T>(
  items: readonly T[],
  getUser: (item: T) => NamedUser,
): T[] {
  return [...items].sort((a, b) => compareUsersByName(getUser(a), getUser(b)));
}

/** Prisma orderBy helper — secondary sort by email when name is missing. */
export const prismaUserNameOrder = [
  { name: "asc" as const },
  { email: "asc" as const },
];
