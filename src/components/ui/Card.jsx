export default function Card({
  className = "",
  interactive = false,
  children,
  ...props
}) {
  return (
    <div
      className={`bg-base-900 border border-base-700 rounded-lg
        ${
          interactive
            ? "transition-all duration-150 hover:border-brand-500/50 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)] cursor-pointer"
            : ""
        }
        ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
