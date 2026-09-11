export type AdminNavItem = {
  href: string;
  label: string;
};

export const adminNav: AdminNavItem[] = [
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/objects", label: "Objects" },
  { href: "/admin/pages", label: "Pages" },
];
