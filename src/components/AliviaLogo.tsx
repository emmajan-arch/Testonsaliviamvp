import svgPaths from "../imports/svg-ke4sryjj2r";

interface AliviaLogoProps {
  className?: string;
}

export function AliviaLogo({
  className = "",
}: AliviaLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 102 102"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Grand logo uniquement */}
      <path
        d={svgPaths.p30b3a500}
        fill="#1E0E62"
      />
      <path
        d={svgPaths.p31544d80}
        fill="#1E0E62"
      />
    </svg>
  );
}
