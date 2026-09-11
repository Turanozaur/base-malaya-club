type Props = {
  className?: string;
};

/** Inline Malaysia flag (Jalur Gemilang) for the site header. */
export function MalaysiaFlag({ className }: Props) {
  return (
    <span
      className={`inline-block shrink-0 overflow-hidden rounded-none shadow-sm ring-1 ring-black/10 dark:ring-white/15 ${className ?? "h-5 w-10"}`}
    >
      <svg
        viewBox="0 0 28 14"
        aria-hidden
        className="block h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        {Array.from({ length: 14 }, (_, i) => (
          <rect
            key={i}
            x="0"
            y={i}
            width="28"
            height="1"
            fill={i % 2 === 0 ? "#CC0001" : "#FFFFFF"}
          />
        ))}
        <rect x="0" y="0" width="14" height="8" fill="#010066" />
        <circle cx="7.2" cy="4" r="2.2" fill="#FFCC00" />
        <circle cx="7.8" cy="4" r="1.7" fill="#010066" />
        <polygon
          fill="#FFCC00"
          points="7.5,1.6 8.1,3.5 10.1,3.5 8.5,4.6 9.1,6.5 7.5,5.4 5.9,6.5 6.5,4.6 4.9,3.5 6.9,3.5"
        />
      </svg>
    </span>
  );
}
