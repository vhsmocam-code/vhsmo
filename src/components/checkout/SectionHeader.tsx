export function SectionHeader({
  title,
  subtitle,
  secondarySubtitle,
}: {
  title: string;
  subtitle?: string;
  secondarySubtitle?: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-darkroom">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-darkroom/55">{subtitle}</p>}
      {secondarySubtitle && (
        <p className="mt-2 rounded-lg border-l-2 border-bluehour bg-bluehour/[0.07] px-3 py-2 text-xs font-medium leading-relaxed text-darkroom/70">
          {secondarySubtitle}
        </p>
      )}
    </div>
  );
}
