export type NavItem = {
  title: string;
  href: string;
};

// Public site sections (order = order in the menu).
export const mainNav: NavItem[] = [
  { title: "History", href: "/history" },
  { title: "Objects", href: "/objects" },
  { title: "Events", href: "/events" },
  { title: "News", href: "/news" },
  { title: "Gallery", href: "/gallery" },
  { title: "Education", href: "/education" },
  { title: "Members", href: "/members" },
];
