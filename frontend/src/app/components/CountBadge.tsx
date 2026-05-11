interface CountBadgeProps {
  delta: number;
}

export function CountBadge({ delta }: CountBadgeProps): JSX.Element {
  const label = delta === 0 ? "정상" : delta > 0 ? "초과" : "부족";
  const tone = delta === 0 ? "good" : delta > 0 ? "warn" : "danger";

  return <span className={`count-badge count-badge--${tone}`}>{label}</span>;
}
