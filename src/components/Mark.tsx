export function Mark({ small = false }: { small?: boolean }) {
  return (
    <span className={`mark ${small ? "mark-small" : ""}`} aria-hidden="true">
      <i />
      <i />
    </span>
  );
}
export function Arrow() {
  return (
    <svg
      className="arrow-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
    >
      <path d="M5 19 19 5M5 5h14v14" />
    </svg>
  );
}
