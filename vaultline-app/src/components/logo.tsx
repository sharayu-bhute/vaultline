interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  variant?: "default" | "white";
  className?: string;
}
export default function Logo({
  size = 22,
  showWordmark = true,
  variant = "default",
  className = "",
}: LogoProps) {
  const shieldFill = variant === "white" ? "#ffffff" : "#3C3489";
  const pinFill = variant === "white" ? "#3C3489" : "#EF9F27";
  const wordmarkColor = variant === "white" ? "text-white" : "text-indigo-950";

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 60 60" width={size} height={size} aria-hidden="true">
        <path
          d="M30 6 L50 15 V29 C50 41 42 49 30 54 C18 49 10 41 10 29 V15 Z"
          fill="none"
          stroke={shieldFill}
          strokeWidth={4}
        />
        <path
          d="M30 6 L50 15 V29 C50 41 42 49 30 54 Z"
          fill={shieldFill}
        />
        <circle cx="30" cy="27" r="4.5" fill={pinFill} />
        <line
          x1="30"
          y1="31"
          x2="30"
          y2="40"
          stroke={pinFill}
          strokeWidth={4}
          strokeLinecap="round"
        />
      </svg>
      {showWordmark && (
        <span className={`font-semibold text-lg tracking-tight ${wordmarkColor}`}>
          vaultline
        </span>
      )}
    </div>
  );
}