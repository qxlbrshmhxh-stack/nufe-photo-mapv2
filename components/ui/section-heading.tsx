type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">{eyebrow}</p>
      <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{title}</h2>
      {description ? <p className="max-w-2xl text-sm leading-6 text-ink/68">{description}</p> : null}
    </div>
  );
}
