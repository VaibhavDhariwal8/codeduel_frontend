const variants = {
  primary:
    "bg-brand-500 hover:bg-brand-400 active:scale-[0.98] text-base-950 shadow-[0_0_0_1px_rgba(124,92,255,0.4),0_4px_12px_-2px_rgba(124,92,255,0.5)]",
  secondary:
    "bg-base-800 hover:bg-base-700 border border-base-700 text-ink-100",
  danger: "bg-verdict-fail hover:opacity-90 active:scale-[0.98] text-base-950",
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150
        disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
        ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
