// Small line icons for row actions. Stroke uses currentColor so each icon
// takes the colour of the button that holds it (neutral, then a hover accent).

interface IconProps {
  size?: number;
}

const BASE = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** Eye — open the read-only detail view. */
export function ViewIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...BASE}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/** Pencil — edit a record. */
export function EditIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...BASE}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

/** Calendar with a plus — extend the access window. */
export function ExtendIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...BASE}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
      <path d="M12 13v5M9.5 15.5h5" />
    </svg>
  );
}

/** Trash — delete a record. */
export function TrashIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...BASE}>
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

/** Sun — the interface is dark, and this switches it back to light. */
export function SunIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...BASE}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

/** Moon — the interface is light, and this switches it to dark. */
export function MoonIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...BASE}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

