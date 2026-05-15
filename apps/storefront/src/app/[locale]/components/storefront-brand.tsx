type StorefrontBrandLogoProps = {
  className?: string;
};

export function StorefrontBrandLogo({
  className = "brand__logo__SW0ej",
}: StorefrontBrandLogoProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 166 28"
    >
      <path
        d="M4.5 3.5h14.4L11.7 24.5H4.5l5.35-15.25H0Z"
        fill="currentColor"
      />
      <path
        d="M20.7 3.5h7.2l-7.2 21h-7.2Z"
        fill="currentColor"
        opacity="0.42"
      />
      <text
        fill="currentColor"
        fontFamily="var(--font-display)"
        fontSize="18"
        fontWeight="900"
        letterSpacing="0"
        x="38"
        y="20.5"
      >
        VELORO
      </text>
    </svg>
  );
}
