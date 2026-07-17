/**
 * NutriSpace Logo — uses the official Sofia Maldote Nutricionista PNG.
 * The image has a transparent background and black calligraphy, so it renders
 * well on both white and light backgrounds.
 */
export function NutriSpaceLogo({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
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
