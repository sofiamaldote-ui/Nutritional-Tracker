/**
 * NutriSpace Logo mark — replace the SVG paths when the final logo image is provided.
 * Usage: <NutriSpaceLogo size={32} /> inside sidebar/login.
 */
export function NutriSpaceLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
    >
      <rect width="64" height="64" rx="16" fill="currentColor" className="text-primary" />
      {/* Leaf */}
      <path
        d="M32 12 C20 20 18 36 28 46 C30 48 34 48 36 46 C46 36 44 20 32 12Z"
        fill="#d5ddbb"
        opacity="0.95"
      />
      {/* Center vein */}
      <path d="M32 14 L32 44" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      {/* Side veins */}
      <path d="M32 28 C28 25 24 24 22 26" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.35" />
      <path d="M32 34 C36 31 40 30 42 32" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.35" />
      {/* Space dots */}
      <circle cx="44" cy="18" r="2.5" fill="#f4e7e5" opacity="0.9" />
      <circle cx="50" cy="26" r="1.5" fill="#f4e7e5" opacity="0.65" />
      <circle cx="20" cy="44" r="1.5" fill="#f4e7e5" opacity="0.55" />
    </svg>
  );
}
