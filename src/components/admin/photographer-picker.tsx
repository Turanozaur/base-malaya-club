"use client";

import { useMemo, useState, useTransition } from "react";
import { saveEventPhotographersAction } from "@/app/admin/events/[id]/photographers/actions";
import { sortUsersByName } from "@/lib/user-sort";

type UserOption = {
  id: string;
  name: string | null;
  email: string;
  country: string | null;
};

type Props = {
  eventId: string;
  users: UserOption[];
  assignedIds: string[];
};

export function PhotographerPicker({ eventId, users, assignedIds }: Props) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(assignedIds));
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = !q
      ? users
      : users.filter(
          (u) =>
            u.name?.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.country?.toLowerCase().includes(q),
        );
    return sortUsersByName(list);
  }, [users, search]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveEventPhotographersAction(eventId, [...selected]);
      if (result.error) setMessage(result.error);
      else setMessage("Photographers saved.");
    });
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div>
        <h2 className="text-base font-semibold">Event photographers</h2>
        <p className="text-sm text-muted-foreground">
          Assigned users can upload photos to this event at any time after logging in.
        </p>
      </div>

      <input
        type="search"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-9 w-full rounded-md border bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />

      <ul className="max-h-64 space-y-1 overflow-y-auto rounded-md border p-2">
        {filtered.length === 0 && (
          <li className="px-2 py-3 text-center text-sm text-muted-foreground">No users found</li>
        )}
        {filtered.map((user) => (
          <li key={user.id}>
            <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-accent/50">
              <input
                type="checkbox"
                checked={selected.has(user.id)}
                onChange={() => toggle(user.id)}
                className="h-4 w-4 rounded border"
              />
              <span className="flex-1 text-sm">
                <span className="font-medium">{user.name ?? user.email}</span>
                {user.name && (
                  <span className="ml-2 text-muted-foreground">{user.email}</span>
                )}
                {user.country && (
                  <span className="ml-2 text-xs text-muted-foreground">{user.country}</span>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save photographers"}
        </button>
        <span className="text-sm text-muted-foreground">{selected.size} selected</span>
      </div>

      {message && (
        <p className={`text-sm ${message.includes("Failed") ? "text-destructive" : "text-green-700 dark:text-green-400"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
