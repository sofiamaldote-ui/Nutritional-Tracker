/**
 * NutriSpace Logo — uses the official Sofia Maldote Nutricionista PNG.
 *
 * variant="dark"  → logo on a white pill (for dark sidebar backgrounds)
 * variant="light" → logo directly on light backgrounds (login, setup)
 */
export function NutriSpaceLogo({
  size = 32,
  className = "",
  variant = "light",
}: {
  size?: number;
  className?: string;
  variant?: "light" | "dark";
}) {
  if (variant === "dark") {
    // Wrap in a white rounded pill so the black calligraphy is readable
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-white shadow-sm ${className}`}
        style={{ width: size, height: size, minWidth: size }}
      >
        <img
          src="/logo.png"
          alt="NutriSpace logo"
          style={{ width: size * 0.82, height: size * 0.82, objectFit: "contain" }}
          draggable={false}
        />
      </div>
    );
  }

  return (
    <img
      src="/logo.png"
      alt="NutriSpace logo"
      style={{ width: size, height: size, objectFit: "contain" }}
      className={className}
      draggable={false}
    />
  );
}
